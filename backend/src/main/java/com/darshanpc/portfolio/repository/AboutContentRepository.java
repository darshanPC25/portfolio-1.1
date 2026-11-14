package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.AboutContent;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AboutContentRepository extends JpaRepository<AboutContent, UUID> {

    Optional<AboutContent> findFirstBy();
}
