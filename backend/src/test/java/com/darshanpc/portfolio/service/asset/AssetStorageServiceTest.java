package com.darshanpc.portfolio.service.asset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.darshanpc.portfolio.entity.PortfolioAsset;
import com.darshanpc.portfolio.entity.enums.AssetKind;
import com.darshanpc.portfolio.exception.InvalidUploadException;
import com.darshanpc.portfolio.repository.PortfolioAssetRepository;
import com.darshanpc.portfolio.security.PasswordAndHashingTest;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;

/** Unit tests for upload validation: type sniffing, size limits (64 kB here) and safe names. */
class AssetStorageServiceTest {

    @TempDir
    Path directory;

    PortfolioAssetRepository repository;
    AssetStorageService service;

    @BeforeEach
    void setUp() {
        repository = mock(PortfolioAssetRepository.class);
        when(repository.save(any())).thenAnswer(call -> call.getArgument(0));
        service = new AssetStorageService(repository, PasswordAndHashingTest.properties("salt", directory.toString()));
    }

    @Test
    void storesPngUnderRandomNameWithDimensionsAndChecksum() throws Exception {
        PortfolioAsset asset = service.store(file("photo.png", png(40, 30)), AssetKind.IMAGE, "Portrait");

        assertThat(asset.getContentType()).isEqualTo("image/png");
        assertThat(asset.getWidth()).isEqualTo(40);
        assertThat(asset.getHeight()).isEqualTo(30);
        assertThat(asset.getSha256()).hasSize(64);
        assertThat(asset.getStorageKey()).matches("[0-9a-f-]{36}\\.png");
        assertThat(Files.exists(directory.resolve(asset.getStorageKey()))).isTrue();
        assertThat(asset.getOriginalFilename()).isEqualTo("photo.png");
        assertThat(asset.getAltText()).isEqualTo("Portrait");
    }

    @Test
    void typeComesFromTheBytesNotTheNameOrDeclaredType() {
        var disguised = new MockMultipartFile("file", "cat.png", "image/png",
                "<html><script>alert(1)</script>".getBytes(StandardCharsets.UTF_8));
        assertThatThrownBy(() -> service.store(disguised, AssetKind.IMAGE, null))
                .isInstanceOf(InvalidUploadException.class)
                .extracting("status").isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);

        var svg = new MockMultipartFile("file", "logo.svg", "image/svg+xml",
                "<svg xmlns=\"http://www.w3.org/2000/svg\"/>".getBytes(StandardCharsets.UTF_8));
        assertThatThrownBy(() -> service.store(svg, AssetKind.IMAGE, null)).isInstanceOf(InvalidUploadException.class);

        var pdfAsImage = new MockMultipartFile("file", "cv.png", "image/png", "%PDF-1.7\n".getBytes(StandardCharsets.UTF_8));
        assertThatThrownBy(() -> service.store(pdfAsImage, AssetKind.IMAGE, null)).isInstanceOf(InvalidUploadException.class);

        verify(repository, never()).save(any());
    }

    @Test
    void savedNameAlwaysEndsWithTheDetectedExtension() throws Exception {
        PortfolioAsset asset = service.store(file("..\\..\\evil.html", png(2, 2)), AssetKind.IMAGE, null);
        assertThat(asset.getOriginalFilename()).isEqualTo("evil.html.png");

        assertThat(AssetStorageService.sanitizeFilename("../../etc/passwd", "pdf")).isEqualTo("passwd.pdf");
        assertThat(AssetStorageService.sanitizeFilename("photo.JPEG", "jpg")).isEqualTo("photo.JPEG");
        assertThat(AssetStorageService.sanitizeFilename("na\"me\u0000.pdf", "pdf")).isEqualTo("name.pdf");
        assertThat(AssetStorageService.sanitizeFilename(null, "pdf")).isEqualTo("file.pdf");
    }

    @Test
    void rejectsEmptyAndOversizedFiles() {
        var empty = new MockMultipartFile("file", "a.png", "image/png", new byte[0]);
        assertThatThrownBy(() -> service.store(empty, AssetKind.IMAGE, null))
                .extracting("status").isEqualTo(HttpStatus.BAD_REQUEST);

        byte[] big = new byte[65 * 1024];
        System.arraycopy("%PDF-".getBytes(StandardCharsets.US_ASCII), 0, big, 0, 5);
        var oversized = new MockMultipartFile("file", "big.pdf", "application/pdf", big);
        assertThatThrownBy(() -> service.store(oversized, AssetKind.DOCUMENT, null))
                .extracting("status").isEqualTo(HttpStatus.PAYLOAD_TOO_LARGE);
    }

    private static MockMultipartFile file(String name, byte[] bytes) {
        return new MockMultipartFile("file", name, "application/octet-stream", bytes);
    }

    private static byte[] png(int width, int height) throws Exception {
        var out = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB), "png", out);
        return out.toByteArray();
    }
}
