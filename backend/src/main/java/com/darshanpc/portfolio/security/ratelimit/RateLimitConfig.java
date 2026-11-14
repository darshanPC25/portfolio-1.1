package com.darshanpc.portfolio.security.ratelimit;

import com.darshanpc.portfolio.config.PortfolioProperties;
import java.time.Clock;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;

/**
 * Rate limiters. {@code portfolio.rate-limit-store}: "memory" (one instance) or
 * "jdbc" (PostgreSQL, shared by every instance — required on AWS Lambda).
 */
@Configuration
public class RateLimitConfig {

    private final boolean shared;
    private final Clock clock;
    private final JdbcTemplate jdbc;
    private final PlatformTransactionManager transactions;

    RateLimitConfig(@Value("${portfolio.rate-limit-store:memory}") String store, Clock clock, JdbcTemplate jdbc,
                    PlatformTransactionManager transactions) {
        this.shared = "jdbc".equalsIgnoreCase(store.strip());
        this.clock = clock;
        this.jdbc = jdbc;
        this.transactions = transactions;
    }

    private RateLimiter limiter(String name, int maxRequests, Duration window) {
        return shared
                ? new JdbcRateLimiter(name, maxRequests, window, clock, jdbc, transactions)
                : new FixedWindowRateLimiter(maxRequests, window, clock);
    }

    /** Limits contact form submissions per client IP. */
    @Bean
    RateLimiter contactRateLimiter(PortfolioProperties properties) {
        var limit = properties.contact().rateLimit();
        return limiter("contact", limit.maxRequests(), limit.window());
    }

    /**
     * Caps contact form submissions from everyone together, so spam cannot get
     * through by rotating or forging client addresses.
     */
    @Bean
    RateLimiter contactGlobalRateLimiter(
            @Value("${portfolio.contact.global-rate-limit.max-requests:30}") int maxRequests,
            @Value("${portfolio.contact.global-rate-limit.window:1h}") Duration window) {
        return limiter("contact-all", maxRequests, window);
    }

    /** Limits admin login attempts per client IP (account lockout is handled separately). */
    @Bean
    RateLimiter loginRateLimiter(PortfolioProperties properties) {
        var limit = properties.admin().loginRateLimit();
        return limiter("login", limit.maxRequests(), limit.window());
    }
}
