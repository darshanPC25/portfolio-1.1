package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.PortfolioPublication;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PortfolioPublicationRepository extends JpaRepository<PortfolioPublication, UUID> {

    /** Highest published version, or empty if nothing has been published. Cheap: no snapshot is read. */
    @Query("select max(p.versionNumber) from PortfolioPublication p")
    Optional<Integer> findLatestVersionNumber();

    Optional<PortfolioPublication> findByVersionNumber(int versionNumber);

    /** Recent publications for the studio history (the snapshot JSON is loaded but not returned). */
    @EntityGraph(attributePaths = "publishedBy")
    List<PortfolioPublication> findTop20ByOrderByVersionNumberDesc();
}
