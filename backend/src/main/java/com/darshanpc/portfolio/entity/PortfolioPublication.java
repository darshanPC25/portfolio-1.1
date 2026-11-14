package com.darshanpc.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * An immutable, published snapshot of the whole public portfolio. The public
 * API always serves the snapshot with the highest version number.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "portfolio_publication")
public class PortfolioPublication {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "version_number", nullable = false, updatable = false)
    private int versionNumber;

    /** Shape of the snapshot JSON, bumped when the public response format changes. */
    @Column(name = "schema_version", nullable = false, updatable = false)
    private int schemaVersion;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "snapshot", nullable = false, updatable = false, columnDefinition = "jsonb")
    private String snapshot;

    @Column(name = "note", length = 200, updatable = false)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "published_by", updatable = false)
    private AdminUser publishedBy;

    @Column(name = "published_at", nullable = false, updatable = false)
    private Instant publishedAt;
}
