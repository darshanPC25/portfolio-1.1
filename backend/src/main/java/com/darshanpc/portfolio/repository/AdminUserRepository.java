package com.darshanpc.portfolio.repository;

import com.darshanpc.portfolio.entity.AdminUser;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminUserRepository extends JpaRepository<AdminUser, UUID> {

    java.util.Optional<AdminUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCaseAndIdNot(String email, UUID id);
}
