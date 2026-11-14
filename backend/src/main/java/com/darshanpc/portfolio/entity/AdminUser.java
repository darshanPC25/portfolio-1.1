package com.darshanpc.portfolio.entity;

import com.darshanpc.portfolio.entity.enums.AdminRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Portfolio Studio administrator. Only the BCrypt hash of the password is
 * stored. No accounts are created by migrations; see the authentication batch.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "admin_user")
public class AdminUser extends BaseEntity {

    @Column(name = "email", nullable = false, length = 254)
    private String email;

    @Column(name = "display_name", nullable = false, length = 80)
    private String displayName;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private AdminRole role = AdminRole.ADMIN;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @Column(name = "failed_login_attempts", nullable = false)
    private int failedLoginAttempts;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;
}
