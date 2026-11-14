package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.SeoSettings;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SeoSettingsRepository extends JpaRepository<SeoSettings, UUID> {

    Optional<SeoSettings> findFirstBy();
}
