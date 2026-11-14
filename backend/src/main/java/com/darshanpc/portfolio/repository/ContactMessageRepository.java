package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.ContactMessage;
import com.darshanpc.portfolio.entity.enums.ContactMessageStatus;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, UUID> {

    Page<ContactMessage> findByStatus(ContactMessageStatus status, Pageable pageable);

    long countByStatus(ContactMessageStatus status);
}
