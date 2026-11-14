package com.darshanpc.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "education")
public class Education extends BaseEntity {

    @Column(name = "degree", nullable = false, length = 160)
    private String degree;

    @Column(name = "field_of_study", nullable = false, length = 200)
    private String fieldOfStudy;

    @Column(name = "institution", length = 200)
    private String institution;

    @Column(name = "period_label", nullable = false, length = 60)
    private String periodLabel;

    @Column(name = "description", nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "visible", nullable = false)
    private boolean visible = true;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
