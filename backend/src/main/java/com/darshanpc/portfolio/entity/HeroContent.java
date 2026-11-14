package com.darshanpc.portfolio.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Hero copy and calls to action. Single row. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "hero_content")
public class HeroContent extends BaseEntity {

    @Column(name = "greeting", nullable = false, length = 120)
    private String greeting;

    @Column(name = "role", nullable = false, length = 120)
    private String role;

    @Column(name = "tagline", nullable = false, length = 300)
    private String tagline;

    @Column(name = "primary_cta_label", nullable = false, length = 60)
    private String primaryCtaLabel;

    @Column(name = "primary_cta_href", nullable = false, length = 500)
    private String primaryCtaHref;

    @Column(name = "secondary_cta_label", nullable = false, length = 60)
    private String secondaryCtaLabel;

    @Column(name = "secondary_cta_href", nullable = false, length = 500)
    private String secondaryCtaHref;

    @Column(name = "resume_label", nullable = false, length = 60)
    private String resumeLabel;

    @Column(name = "focus_label", nullable = false, length = 60)
    private String focusLabel;

    @ElementCollection
    @CollectionTable(name = "hero_focus_area", joinColumns = @JoinColumn(name = "hero_id"))
    @OrderColumn(name = "position")
    @Column(name = "label", nullable = false, length = 120)
    private List<String> focusAreas = new ArrayList<>();
}
