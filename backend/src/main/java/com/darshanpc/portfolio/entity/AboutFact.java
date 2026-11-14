package com.darshanpc.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A short label/value pair shown under the About text, e.g. "Based in: India". */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class AboutFact {

    @Column(name = "label", nullable = false, length = 60)
    private String label;

    @Column(name = "value", nullable = false, length = 120)
    private String value;
}
