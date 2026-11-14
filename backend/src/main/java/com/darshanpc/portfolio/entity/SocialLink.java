package com.darshanpc.portfolio.entity;

import com.darshanpc.portfolio.entity.enums.SocialPlatform;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A social profile link. Links without a URL are kept but not published. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "social_link")
public class SocialLink extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "platform", nullable = false, length = 20)
    private SocialPlatform platform;

    @Column(name = "label", nullable = false, length = 60)
    private String label;

    @Column(name = "url", length = 500)
    private String url;

    @Column(name = "visible", nullable = false)
    private boolean visible = true;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
