package com.darshanpc.portfolio.entity;

import com.darshanpc.portfolio.entity.enums.SkillIcon;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A group of skills, e.g. "Backend". */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "skill_category")
public class SkillCategory extends BaseEntity {

    @Column(name = "title", nullable = false, length = 80)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "icon", nullable = false, length = 20)
    private SkillIcon icon;

    @Column(name = "description", nullable = false, length = 200)
    private String description;

    @Column(name = "visible", nullable = false)
    private boolean visible = true;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    // No orphanRemoval: moving a skill to another category must not delete it.
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    @OrderBy("displayOrder ASC")
    private List<Skill> skills = new ArrayList<>();
}
