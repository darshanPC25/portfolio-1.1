package com.darshanpc.portfolio.admin.auth;

import com.darshanpc.portfolio.config.PortfolioProperties;
import com.darshanpc.portfolio.entity.AdminUser;
import com.darshanpc.portfolio.repository.AdminUserRepository;
import com.darshanpc.portfolio.security.PasswordPolicy;
import com.darshanpc.portfolio.service.DatabaseLocks;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates the first administrator from ADMIN_EMAIL / ADMIN_PASSWORD /
 * ADMIN_DISPLAY_NAME, but only while no administrator exists. Afterwards the
 * variables are ignored (and a warning reminds you to remove the password).
 * There is no public registration and no credential in source code.
 *
 * <p>Several instances may start at once (AWS Lambda), so the check and the insert
 * run under a database lock: exactly one of them creates the account.
 */
@Slf4j
@Component
@Order(0)
@RequiredArgsConstructor
public class AdminBootstrapRunner implements ApplicationRunner {

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    private final AdminUserRepository admins;
    private final PasswordEncoder passwordEncoder;
    private final PortfolioProperties properties;
    private final DatabaseLocks locks;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        var bootstrap = properties.admin().bootstrap();
        locks.lockForTransaction("admin-bootstrap");

        if (admins.count() > 0) {
            if (bootstrap.password() != null && !bootstrap.password().isBlank()) {
                log.warn("ADMIN_PASSWORD is set but an administrator already exists; it is ignored. "
                        + "Remove it from the environment.");
            }
            return;
        }

        if (!bootstrap.isConfigured()) {
            log.warn("No administrator exists. Set ADMIN_EMAIL and ADMIN_PASSWORD (and optionally "
                    + "ADMIN_DISPLAY_NAME), then restart to create one.");
            return;
        }

        String email = bootstrap.email().strip();
        if (!EMAIL.matcher(email).matches()) {
            throw new IllegalStateException("ADMIN_EMAIL is not a valid email address");
        }
        PasswordPolicy.problem(bootstrap.password()).ifPresent(problem -> {
            throw new IllegalStateException("ADMIN_PASSWORD is not acceptable: " + problem);
        });

        AdminUser admin = new AdminUser();
        admin.setEmail(email);
        admin.setDisplayName(bootstrap.displayName() == null || bootstrap.displayName().isBlank()
                ? "Administrator" : bootstrap.displayName().strip());
        admin.setPasswordHash(passwordEncoder.encode(bootstrap.password()));
        admins.save(admin);
        log.info("Created the first administrator ({}). Remove ADMIN_PASSWORD from the environment now.", email);
    }
}
