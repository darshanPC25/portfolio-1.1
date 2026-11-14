package com.darshanpc.portfolio.entity;

import com.darshanpc.portfolio.entity.enums.ProjectStatus;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A portfolio project. Repository and demo URLs stay null until real ones exist. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "project")
public class Project extends BaseEntity {

    @Column(name = "slug", nullable = false, length = 120)
    private String slug;

    @Column(name = "name", nullable = false, length = 160)
    private String name;

    @Column(name = "summary", nullable = false, length = 300)
    private String summary;

    @Column(name = "description", nullable = false, columnDefinition = "text")
    private String description;

    @ElementCollection
    @CollectionTable(name = "project_highlight", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "position")
    @Column(name = "text", nullable = false, length = 300)
    private List<String> highlights = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "project_tag", joinColumns = @JoinColumn(name = "project_id"))
    @OrderColumn(name = "position")
    @Column(name = "tag", nullable = false, length = 60)
    private List<String> tags = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_asset_id")
    private PortfolioAsset image;

    @Column(name = "image_alt", nullable = false, length = 200)
    private String imageAlt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ProjectStatus status;

    @Column(name = "repo_url", length = 500)
    private String repoUrl;

    @Column(name = "demo_url", length = 500)
    private String demoUrl;

    @Column(name = "featured", nullable = false)
    private boolean featured;

    @Column(name = "visible", nullable = false)
    private boolean visible = true;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
