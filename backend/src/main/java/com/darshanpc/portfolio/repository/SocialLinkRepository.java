package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.SocialLink;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface SocialLinkRepository extends JpaRepository<SocialLink, UUID> {

    List<SocialLink> findAllByVisibleTrueOrderByDisplayOrderAsc();

    List<SocialLink> findAllByOrderByDisplayOrderAsc();

    @Query("select coalesce(max(s.displayOrder), 0) from SocialLink s")
    int maxDisplayOrder();
}
