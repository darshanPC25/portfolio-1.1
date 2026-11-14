package com.darshanpc.portfolio.entity;

import com.darshanpc.portfolio.entity.enums.AssetKind;
import com.darshanpc.portfolio.entity.enums.AssetStorageType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** An image or document used by the portfolio, either hosted elsewhere or stored by the backend. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "portfolio_asset")
public class PortfolioAsset extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "kind", nullable = false, length = 20)
    private AssetKind kind;

    @Enumerated(EnumType.STRING)
    @Column(name = "storage_type", nullable = false, length = 20)
    private AssetStorageType storageType;

    /** Location for EXTERNAL assets. */
    @Column(name = "url", length = 1000)
    private String url;

    /** File key for LOCAL assets. */
    @Column(name = "storage_key", length = 300)
    private String storageKey;

    @Column(name = "original_filename", nullable = false, length = 255)
    private String originalFilename;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "size_bytes")
    private Long sizeBytes;

    @Column(name = "sha256", length = 64)
    private String sha256;

    @Column(name = "width")
    private Integer width;

    @Column(name = "height")
    private Integer height;

    @Column(name = "alt_text", length = 200)
    private String altText;
}
