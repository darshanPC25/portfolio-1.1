package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.PortfolioAsset;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PortfolioAssetRepository extends JpaRepository<PortfolioAsset, UUID> {
}
