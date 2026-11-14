package com.darshanpc.portfolio.entity;

import com.darshanpc.portfolio.entity.enums.BackgroundStyle;
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

    /** Show the WebGL hero scene (otherwise the static CSS shapes are used). */
    @Column(name = "hero_scene_enabled", nullable = false)
    private boolean heroSceneEnabled = true;

    /** Play animations. When false the site behaves as if the visitor prefers reduced motion. */
    @Column(name = "motion_enabled", nullable = false)
    private boolean motionEnabled = true;
}
