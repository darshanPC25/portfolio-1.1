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

/** Who the portfolio belongs to. Single row. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "portfolio_profile")
public class PortfolioProfile extends BaseEntity {

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "preferred_name", nullable = false, length = 60)
    private String preferredName;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "location", nullable = false, length = 120)
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "photo_asset_id")
    private PortfolioAsset photo;

    @Column(name = "photo_alt", nullable = false, length = 200)
    private String photoAlt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_asset_id")
    private PortfolioAsset resume;

    @Column(name = "public_email", length = 254)
    private String publicEmail;

    @Column(name = "available", nullable = false)
    private boolean available;

    @Column(name = "availability_label", nullable = false, length = 120)
    private String availabilityLabel;

    @Column(name = "github_username", length = 39)
    private String githubUsername;

    @Column(name = "copyright_text", nullable = false, length = 200)
    private String copyrightText;

    @Column(name = "footer_note", nullable = false, length = 200)
    private String footerNote;
}
