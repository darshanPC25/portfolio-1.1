package com.darshanpc.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** One numbered step of the "how I work" tiles. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class ApproachStep {

    @Column(name = "step_label", nullable = false, length = 10)
    private String stepLabel;

    @Column(name = "title", nullable = false, length = 80)
    private String title;

    @Column(name = "description", nullable = false, length = 300)
    private String description;
}
