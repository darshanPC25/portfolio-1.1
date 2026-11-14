package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.Education;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface EducationRepository extends JpaRepository<Education, UUID> {

    List<Education> findAllByVisibleTrueOrderByDisplayOrderAsc();

    List<Education> findAllByOrderByDisplayOrderAsc();

    @Query("select coalesce(max(e.displayOrder), 0) from Education e")
    int maxDisplayOrder();
}
