package com.darshanpc.portfolio.entity;

import com.darshanpc.portfolio.entity.enums.BackgroundStyle;
import com.darshanpc.portfolio.entity.enums.CornerStyle;
import com.darshanpc.portfolio.entity.enums.HeadingFont;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Site-wide visual settings. Single row. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "portfolio_appearance")
public class PortfolioAppearance extends BaseEntity {

    /** Accent colour (hex), used for the hero greeting, contact heading and small highlights. */
    @Column(name = "accent_color", nullable = false, length = 7)
    private String accentColor = "#6f8446";

    @Enumerated(EnumType.STRING)
    @Column(name = "background_style", nullable = false, length = 20)
    private BackgroundStyle backgroundStyle = BackgroundStyle.IVORY;

    @Enumerated(EnumType.STRING)
    @Column(name = "heading_font", nullable = false, length = 20)
    private HeadingFont headingFont = HeadingFont.SANS;

    /** Custom page background (hex); overrides {@link #backgroundStyle} when set. */
    @Column(name = "background_color", length = 7)
    private String backgroundColor;

    /** Custom main text colour (hex); the design's ink colour when null. */
    @Column(name = "text_color", length = 7)
    private String textColor;

    /** Typeface for body text (same choices as headings). */
    @Enumerated(EnumType.STRING)
    @Column(name = "body_font", nullable = false, length = 20)
    private HeadingFont bodyFont = HeadingFont.SANS;

    @Enumerated(EnumType.STRING)
    @Column(name = "corner_style", nullable = false, length = 20)
    private CornerStyle cornerStyle = CornerStyle.SOFT;

    /** Show the WebGL hero scene (otherwise the static CSS shapes are used). */
    @Column(name = "hero_scene_enabled", nullable = false)
    private boolean heroSceneEnabled = true;

    /** Play animations. When false the site behaves as if the visitor prefers reduced motion. */
    @Column(name = "motion_enabled", nullable = false)
    private boolean motionEnabled = true;
}
