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

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "skill")
public class Skill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private SkillCategory category;

    @Column(name = "name", nullable = false, length = 80)
    private String name;

    @Column(name = "visible", nullable = false)
    private boolean visible = true;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
