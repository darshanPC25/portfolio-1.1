package com.darshanpc.portfolio.security.ratelimit;

import com.darshanpc.portfolio.config.PortfolioProperties;
import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RateLimitConfig {

    /** Limits contact form submissions per client IP. */
    @Bean
    FixedWindowRateLimiter contactRateLimiter(PortfolioProperties properties, Clock clock) {
        var limit = properties.contact().rateLimit();
        return new FixedWindowRateLimiter(limit.maxRequests(), limit.window(), clock);
    }

    /** Limits admin login attempts per client IP (account lockout is handled separately). */
    @Bean
    FixedWindowRateLimiter loginRateLimiter(PortfolioProperties properties, Clock clock) {
        var limit = properties.admin().loginRateLimit();
        return new FixedWindowRateLimiter(limit.maxRequests(), limit.window(), clock);
    }
}
