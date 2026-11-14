package com.darshanpc.portfolio.controller;

import com.darshanpc.portfolio.entity.PortfolioAsset;
import com.darshanpc.portfolio.entity.enums.AssetStorageType;
import com.darshanpc.portfolio.exception.ResourceNotFoundException;
import com.darshanpc.portfolio.repository.PortfolioAssetRepository;
import com.darshanpc.portfolio.security.SecurityConfig;
import com.darshanpc.portfolio.service.PublishedPortfolioService;
import com.darshanpc.portfolio.service.asset.AssetStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves uploaded files. Visitors can fetch a file only if the latest
 * published portfolio uses it; signed-in administrators can also see draft
 * uploads (for previews).
 */
@RestController
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
@Tag(name = "Public portfolio")
public class AssetController {

    private final PortfolioAssetRepository assets;
    private final AssetStorageService storage;
    private final PublishedPortfolioService published;

    @GetMapping("/{id}")
    @Operation(summary = "An uploaded image or document used by the published portfolio")
    public ResponseEntity<Resource> asset(
            @PathVariable UUID id, @RequestParam(name = "download", defaultValue = "false") boolean download) {
        boolean admin = isAdmin();
        PortfolioAsset asset = assets.findById(id)
                .filter(a -> a.getStorageType() == AssetStorageType.LOCAL)
                .filter(a -> admin || published.referencesAsset(a.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("File", id.toString()));

        ContentDisposition disposition = (download ? ContentDisposition.attachment() : ContentDisposition.inline())
                .filename(asset.getOriginalFilename(), StandardCharsets.UTF_8)
                .build();

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(asset.getContentType()))
                .contentLength(asset.getSizeBytes())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header("X-Content-Type-Options", "nosniff")
                .cacheControl(admin
                        ? CacheControl.noStore()
                        : CacheControl.maxAge(Duration.ofHours(1)).cachePublic())
                .eTag(asset.getSha256())
                .body(storage.load(asset));
    }

    private static boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.isAuthenticated() && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + SecurityConfig.ADMIN_ROLE));
    }
}
