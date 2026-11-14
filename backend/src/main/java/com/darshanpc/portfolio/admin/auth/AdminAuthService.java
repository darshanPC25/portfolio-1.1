package com.darshanpc.portfolio.admin.auth;

import com.darshanpc.portfolio.config.PortfolioProperties;
import com.darshanpc.portfolio.entity.AdminUser;
import com.darshanpc.portfolio.exception.InvalidCredentialsException;
import com.darshanpc.portfolio.exception.RateLimitExceededException;
import com.darshanpc.portfolio.repository.AdminUserRepository;
import com.darshanpc.portfolio.security.ratelimit.RateLimiter;
import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Checks administrator credentials.
 *
 * <ul>
 *   <li>Per-IP rate limit on attempts.</li>
 *   <li>After {@code maxFailedAttempts} wrong passwords the account is locked for
 *       {@code lockDuration}; while locked even the right password fails.</li>
 *   <li>Every failure looks the same, and unknown emails still pay the BCrypt cost,
 *       so responses do not reveal which accounts exist.</li>
 * </ul>
 */
@Slf4j
@Service
public class AdminAuthService {

    private final AdminUserRepository admins;
    private final PasswordEncoder passwordEncoder;
    private final RateLimiter loginRateLimiter;
    private final PortfolioProperties.Admin settings;
    private final Clock clock;
    private final String dummyHash;

    public AdminAuthService(
            AdminUserRepository admins,
            PasswordEncoder passwordEncoder,
            @Qualifier("loginRateLimiter") RateLimiter loginRateLimiter,
            PortfolioProperties properties,
            Clock clock) {
        this.admins = admins;
        this.passwordEncoder = passwordEncoder;
        this.loginRateLimiter = loginRateLimiter;
        this.settings = properties.admin();
        this.clock = clock;
        this.dummyHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    @Transactional(noRollbackFor = InvalidCredentialsException.class)
    public AdminUser authenticate(String email, String password, String clientIp) {
        loginRateLimiter.tryAcquire("login:" + clientIp).ifPresent(retryAfter -> {
            throw new RateLimitExceededException(retryAfter);
        });

        Optional<AdminUser> found = admins.findByEmailIgnoreCase(email.strip());
        if (found.isEmpty()) {
            passwordEncoder.matches(password, dummyHash);
            throw new InvalidCredentialsException();
        }

        AdminUser admin = found.get();
        Instant now = clock.instant();
        boolean locked = admin.getLockedUntil() != null && now.isBefore(admin.getLockedUntil());
        if (!admin.isEnabled() || locked) {
            passwordEncoder.matches(password, dummyHash);
            throw new InvalidCredentialsException();
        }

        if (!passwordEncoder.matches(password, admin.getPasswordHash())) {
            int attempts = admin.getFailedLoginAttempts() + 1;
            if (attempts >= settings.maxFailedAttempts()) {
                admin.setLockedUntil(now.plus(settings.lockDuration()));
                attempts = 0;
                log.warn("Administrator account locked for {} after repeated failed sign-ins", settings.lockDuration());
            }
            admin.setFailedLoginAttempts(attempts);
            throw new InvalidCredentialsException();
        }

        admin.setFailedLoginAttempts(0);
        admin.setLockedUntil(null);
        admin.setLastLoginAt(now);
        return admin;
    }
}
