package com.darshanpc.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * Formatting for one page element, set in the visual editor. Keyed by the
 * element's editor id (e.g. "hero.greeting"). Every attribute is optional;
 * a row with none would be meaningless, so it is deleted instead.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "element_style")
@EntityListeners(AuditingEntityListener.class)
public class ElementStyle {

    @Id
    @Column(name = "element_key", length = 120, updatable = false)
    private String elementKey;

    /** Hex text colour. */
    @Column(name = "color", length = 7)
    private String color;

    /** Size relative to the design, 0.75–1.50. */
    @Column(name = "font_scale", precision = 3, scale = 2)
    private BigDecimal fontScale;

    /** 300, 400, 500, 600 or 700. */
    @Column(name = "font_weight")
    private Integer fontWeight;

    /** start, center or end. */
    @Column(name = "text_align", length = 10)
    private String textAlign;

    /** sans or serif. */
    @Column(name = "font_family", length = 10)
    private String fontFamily;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    public ElementStyle(String elementKey) {
        this.elementKey = elementKey;
    }
}
