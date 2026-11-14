package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.HeroContent;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface HeroContentRepository extends JpaRepository<HeroContent, UUID> {

    Optional<HeroContent> findFirstBy();
}
