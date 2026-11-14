package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.PortfolioSection;
import com.darshanpc.portfolio.entity.enums.SectionKey;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioSectionRepository extends JpaRepository<PortfolioSection, UUID> {

    List<PortfolioSection> findAllByOrderByDisplayOrderAsc();

    Optional<PortfolioSection> findBySectionKey(SectionKey key);

    long countByVisible(boolean visible);
}
