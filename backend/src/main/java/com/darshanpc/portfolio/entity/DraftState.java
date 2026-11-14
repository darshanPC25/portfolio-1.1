package com.darshanpc.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * When the draft content last changed (any create, update, delete or reorder).
 * Compared with the latest publication to show "unpublished changes". Single row, id 1.
 */
@Getter
@NoArgsConstructor
@Entity
@Table(name = "draft_state")
public class DraftState {

    @Id
    private int id;

    @Column(name = "last_modified_at", nullable = false)
    private Instant lastModifiedAt;
}
