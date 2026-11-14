package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.DraftState;
import java.time.Instant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface DraftStateRepository extends JpaRepository<DraftState, Integer> {

    @Modifying
    @Query("update DraftState d set d.lastModifiedAt = :at where d.id = 1")
    int touch(@Param("at") Instant at);

    @Query("select d.lastModifiedAt from DraftState d where d.id = 1")
    Instant lastModifiedAt();
}
