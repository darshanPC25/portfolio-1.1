package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.Skill;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SkillRepository extends JpaRepository<Skill, UUID> {

    boolean existsByCategoryIdAndNameIgnoreCase(UUID categoryId, String name);

    boolean existsByCategoryIdAndNameIgnoreCaseAndIdNot(UUID categoryId, String name, UUID id);

    @Query("select coalesce(max(s.displayOrder), 0) from Skill s where s.category.id = :categoryId")
    int maxDisplayOrder(@Param("categoryId") UUID categoryId);
}
