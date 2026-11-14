package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.NotificationSettings;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationSettingsRepository extends JpaRepository<NotificationSettings, UUID> {

    Optional<NotificationSettings> findFirstBy();
}
