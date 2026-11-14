package com.darshanpc.portfolio.service.asset;

import com.darshanpc.portfolio.config.PortfolioProperties;
import com.darshanpc.portfolio.entity.PortfolioAsset;
import com.darshanpc.portfolio.entity.enums.AssetKind;
import com.darshanpc.portfolio.entity.enums.AssetStorageType;
import com.darshanpc.portfolio.exception.InvalidUploadException;
import com.darshanpc.portfolio.repository.PortfolioAssetRepository;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;
import javax.imageio.ImageIO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Stores uploaded files on disk and records them as {@link PortfolioAsset}s.
 *
 * <p>The file type is decided from the file's own bytes, never from the name
 * or the browser-supplied content type. Images may be PNG, JPEG or WebP (SVG is
 * refused because it can carry scripts); documents must be PDF. Files are saved
 * under random names inside the storage directory.
 */
@Slf4j
@Service
public class AssetStorageService {

    private enum FileType {
        PNG("image/png", "png", AssetKind.IMAGE),
        JPEG("image/jpeg", "jpg", AssetKind.IMAGE),
        WEBP("image/webp", "webp", AssetKind.IMAGE),
        PDF("application/pdf", "pdf", AssetKind.DOCUMENT);

        final String contentType;
        final String extension;
        final AssetKind kind;

        FileType(String contentType, String extension, AssetKind kind) {
            this.contentType = contentType;
            this.extension = extension;
            this.kind = kind;
        }
    }

    private final PortfolioAssetRepository assets;
    private final Path directory;
    private final long maxImageBytes;
    private final long maxDocumentBytes;

    public AssetStorageService(PortfolioAssetRepository assets, PortfolioProperties properties) {
        this.assets = assets;
        this.directory = Path.of(properties.storage().directory()).toAbsolutePath().normalize();
        this.maxImageBytes = properties.storage().maxImageSize().toBytes();
        this.maxDocumentBytes = properties.storage().maxDocumentSize().toBytes();
    }

    /** Validates and stores an upload of the expected kind. */
    @Transactional
    public PortfolioAsset store(MultipartFile file, AssetKind expectedKind, String altText) {
        if (file == null || file.isEmpty()) {
            throw new InvalidUploadException(HttpStatus.BAD_REQUEST, "Choose a file to upload.");
        }
        byte[] bytes = readBytes(file);
        long limit = expectedKind == AssetKind.IMAGE ? maxImageBytes : maxDocumentBytes;
        if (bytes.length > limit) {
            throw new InvalidUploadException(HttpStatus.PAYLOAD_TOO_LARGE,
                    "The file is too large (" + (limit / (1024 * 1024)) + " MB maximum).");
        }

        FileType type = detect(bytes)
                .filter(t -> t.kind == expectedKind)
                .orElseThrow(() -> new InvalidUploadException(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                        expectedKind == AssetKind.IMAGE
                                ? "Upload a PNG, JPEG or WebP image."
                                : "Upload a PDF document."));

        String storageKey = UUID.randomUUID() + "." + type.extension;
        writeFile(storageKey, bytes);

        PortfolioAsset asset = new PortfolioAsset();
        asset.setKind(type.kind);
        asset.setStorageType(AssetStorageType.LOCAL);
        asset.setStorageKey(storageKey);
        asset.setOriginalFilename(sanitizeFilename(file.getOriginalFilename(), type.extension));
        asset.setContentType(type.contentType);
        asset.setSizeBytes((long) bytes.length);
        asset.setSha256(sha256(bytes));
        asset.setAltText(altText);
        dimensions(type, bytes).ifPresent(image -> {
            asset.setWidth(image.getWidth());
            asset.setHeight(image.getHeight());
        });
        return assets.save(asset);
    }

    /** The stored file of a LOCAL asset. */
    public Resource load(PortfolioAsset asset) {
        Path path = directory.resolve(asset.getStorageKey()).normalize();
        if (!path.startsWith(directory) || !Files.isRegularFile(path)) {
            throw new IllegalStateException("Stored file for asset " + asset.getId() + " is missing");
        }
        return new FileSystemResource(path);
    }

    private static Optional<FileType> detect(byte[] b) {
        if (startsWith(b, 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A)) {
            return Optional.of(FileType.PNG);
        }
        if (startsWith(b, 0xFF, 0xD8, 0xFF)) {
            return Optional.of(FileType.JPEG);
        }
        if (b.length >= 12 && startsWith(b, 'R', 'I', 'F', 'F')
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return Optional.of(FileType.WEBP);
        }
        if (startsWith(b, '%', 'P', 'D', 'F', '-')) {
            return Optional.of(FileType.PDF);
        }
        return Optional.empty();
    }

    private static boolean startsWith(byte[] bytes, int... prefix) {
        if (bytes.length < prefix.length) {
            return false;
        }
        for (int i = 0; i < prefix.length; i++) {
            if ((bytes[i] & 0xFF) != prefix[i]) {
                return false;
            }
        }
        return true;
    }

    private static Optional<BufferedImage> dimensions(FileType type, byte[] bytes) {
        if (type != FileType.PNG && type != FileType.JPEG) {
            return Optional.empty();
        }
        try {
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(bytes));
            if (image == null) {
                throw new InvalidUploadException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "The image could not be read.");
            }
            return Optional.of(image);
        } catch (IOException e) {
            throw new InvalidUploadException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "The image could not be read.");
        }
    }

    private void writeFile(String storageKey, byte[] bytes) {
        try {
            Files.createDirectories(directory);
            Files.write(directory.resolve(storageKey), bytes, StandardOpenOption.CREATE_NEW);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not store the uploaded file", e);
        }
    }

    private static byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException e) {
            throw new InvalidUploadException(HttpStatus.BAD_REQUEST, "The upload could not be read.");
        }
    }

    /** Keeps only a safe base name, for display and download names. */
    static String sanitizeFilename(String original, String extension) {
        String name = original == null ? "" : original.replace('\\', '/');
        name = name.substring(name.lastIndexOf('/') + 1);
        name = name.codePoints()
                .filter(c -> !Character.isISOControl(c) && c != '"')
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString()
                .strip();
        if (name.isEmpty()) {
            name = "file";
        }
        // The extension always matches the detected type, so a PNG uploaded as
        // "page.html" is offered for download as "page.html.png", never as HTML.
        String suffix = "." + extension;
        if (!name.toLowerCase(java.util.Locale.ROOT).endsWith(suffix)
                && !(extension.equals("jpg") && name.toLowerCase(java.util.Locale.ROOT).endsWith(".jpeg"))) {
            name = name + suffix;
        }
        return name.length() > 200 ? name.substring(name.length() - 200) : name;
    }

    private static String sha256(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
