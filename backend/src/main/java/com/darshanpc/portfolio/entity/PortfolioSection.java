package com.darshanpc.portfolio.entity;

import com.darshanpc.portfolio.entity.enums.SectionKey;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapKeyColumn;
import jakarta.persistence.Table;
import java.util.HashMap;
import java.util.Map;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Heading, navigation label, order and visibility of one page section.
 * Section-specific copy (e.g. the contact form heading) is kept in {@link #settings}.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "portfolio_section")
public class PortfolioSection extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "section_key", nullable = false, length = 20, updatable = false)
    private SectionKey sectionKey;

    @Column(name = "nav_label", nullable = false, length = 40)
    private String navLabel;

    @Column(name = "eyebrow", nullable = false, length = 80)
    private String eyebrow;

    @Column(name = "heading", nullable = false, length = 160)
    private String heading;

    @Column(name = "intro", length = 500)
    private String intro;

    @Column(name = "visible", nullable = false)
    private boolean visible = true;

    @Column(name = "display_order", nullable = false)
    private int displayOrder;

    @ElementCollection
    @CollectionTable(name = "portfolio_section_setting", joinColumns = @JoinColumn(name = "section_id"))
    @MapKeyColumn(name = "setting_key", length = 60)
    @Column(name = "setting_value", nullable = false, length = 500)
    private Map<String, String> settings = new HashMap<>();

    public String setting(String key) {
        return settings.get(key);
    }
}
