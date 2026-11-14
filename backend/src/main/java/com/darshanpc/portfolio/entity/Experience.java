package com.darshanpc.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** An entry in the Professional Journey section. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "experience")
public class Experience extends BaseEntity {

    /** Display text for the period, e.g. "2025 – Now". */
    @Column(name = "period_label", nullable = false, length = 40)
    private String periodLabel;

    @Column(name = "title", nullable = false, length = 160)
    private String title;

    @Column(name = "organisation", length = 160)
    private String organisation;

    @Column(name = "description", nullable = false, columnDefinition = "text")
    private String description;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "visible", nullable = false)
    private boolean visible = true;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;
}
