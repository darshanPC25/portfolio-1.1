package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.SkillCategory;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SkillCategoryRepository extends JpaRepository<SkillCategory, UUID> {

    List<SkillCategory> findAllByVisibleTrueOrderByDisplayOrderAsc();

    List<SkillCategory> findAllByOrderByDisplayOrderAsc();

    @Query("select coalesce(max(c.displayOrder), 0) from SkillCategory c")
    int maxDisplayOrder();
}
