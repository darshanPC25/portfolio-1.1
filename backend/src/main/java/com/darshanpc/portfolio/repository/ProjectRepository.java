package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.Project;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    List<Project> findAllByVisibleTrueOrderByDisplayOrderAsc();

    List<Project> findAllByOrderByDisplayOrderAsc();

    Optional<Project> findBySlug(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, UUID id);

    long countByVisibleTrue();

    @Query("select coalesce(max(p.displayOrder), 0) from Project p")
    int maxDisplayOrder();
}
