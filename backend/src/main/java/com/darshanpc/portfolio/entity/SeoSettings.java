package com.darshanpc.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Page title, description and indexing preferences. Single row. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "seo_settings")
public class SeoSettings extends BaseEntity {

    @Column(name = "meta_title", nullable = false, length = 120)
    private String metaTitle;

    @Column(name = "meta_description", nullable = false, length = 300)
    private String metaDescription;

    @Column(name = "canonical_url", length = 500)
    private String canonicalUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "og_image_asset_id")
    private PortfolioAsset ogImage;

    @Column(name = "allow_indexing", nullable = false)
    private boolean allowIndexing = true;
}
