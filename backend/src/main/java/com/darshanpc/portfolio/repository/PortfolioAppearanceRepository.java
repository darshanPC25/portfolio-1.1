package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.PortfolioAppearance;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioAppearanceRepository extends JpaRepository<PortfolioAppearance, UUID> {

    Optional<PortfolioAppearance> findFirstBy();
}
