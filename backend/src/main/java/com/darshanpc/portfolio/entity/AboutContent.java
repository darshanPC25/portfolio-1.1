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

/** About Me body. The section heading lives in {@link PortfolioSection}. Single row. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "about_content")
public class AboutContent extends BaseEntity {

    @ElementCollection
    @CollectionTable(name = "about_paragraph", joinColumns = @JoinColumn(name = "about_id"))
    @OrderColumn(name = "position")
    @Column(name = "body", nullable = false, columnDefinition = "text")
    private List<String> paragraphs = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "about_fact", joinColumns = @JoinColumn(name = "about_id"))
    @OrderColumn(name = "position")
    private List<AboutFact> facts = new ArrayList<>();

    @Column(name = "approach_heading", nullable = false, length = 120)
    private String approachHeading;

    @ElementCollection
    @CollectionTable(name = "about_approach_step", joinColumns = @JoinColumn(name = "about_id"))
    @OrderColumn(name = "position")
    private List<ApproachStep> approachSteps = new ArrayList<>();
}
