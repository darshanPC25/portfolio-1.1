package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.Experience;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ExperienceRepository extends JpaRepository<Experience, UUID> {

    List<Experience> findAllByVisibleTrueOrderByDisplayOrderAsc();

    List<Experience> findAllByOrderByDisplayOrderAsc();

    @Query("select coalesce(max(e.displayOrder), 0) from Experience e")
    int maxDisplayOrder();
}
