package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.PortfolioProfile;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioProfileRepository extends JpaRepository<PortfolioProfile, UUID> {

    Optional<PortfolioProfile> findFirstBy();
}
