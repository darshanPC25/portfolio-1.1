package com.darshanpc.portfolio.security.ratelimit;

import java.sql.Timestamp;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Fixed-window rate limiter whose counts live in PostgreSQL ({@code rate_limit_window}),
 * so every application instance (e.g. each AWS Lambda) shares the same limits.
 * One atomic upsert per request; expired windows are pruned now and then.
 *
 * <p>Each count is committed in its own transaction, so it sticks even when the
 * caller's transaction rolls back (a refused request or a failed sign-in).
 */
public class JdbcRateLimiter implements RateLimiter {

    private static final String UPSERT = """
            INSERT INTO rate_limit_window AS w (bucket_key, window_start, hits)
            VALUES (?, ?, 1)
            ON CONFLICT (bucket_key) DO UPDATE SET
                hits = CASE WHEN w.window_start <= ? THEN 1 ELSE w.hits + 1 END,
                window_start = CASE WHEN w.window_start <= ? THEN EXCLUDED.window_start ELSE w.window_start END
            RETURNING hits, window_start""";

    private record Window(int hits, Instant start) {
    }

    private final String name;
    private final int maxRequests;
    private final Duration window;
    private final Clock clock;
    private final JdbcTemplate jdbc;
    private final TransactionTemplate ownTransaction;

    public JdbcRateLimiter(String name, int maxRequests, Duration window, Clock clock, JdbcTemplate jdbc,
                           PlatformTransactionManager transactions) {
        if (maxRequests < 1 || window.isZero() || window.isNegative()) {
            throw new IllegalArgumentException("maxRequests must be positive and window must be positive");
        }
        this.name = name;
        this.maxRequests = maxRequests;
        this.window = window;
        this.clock = clock;
        this.jdbc = jdbc;
        this.ownTransaction = new TransactionTemplate(transactions);
        this.ownTransaction.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
    }

    @Override
    public Optional<Duration> tryAcquire(String key) {
        Instant now = clock.instant();
        // A window that started at or before this instant has expired.
        Timestamp expiredBefore = Timestamp.from(now.minus(window));
        String bucket = truncate(name + ":" + key);

        Window result = ownTransaction.execute(status -> {
            Window counted = jdbc.queryForObject(UPSERT,
                    (rs, i) -> new Window(rs.getInt("hits"), rs.getTimestamp("window_start").toInstant()),
                    bucket, Timestamp.from(now), expiredBefore, expiredBefore);
            if (ThreadLocalRandom.current().nextInt(100) == 0) {
                jdbc.update("DELETE FROM rate_limit_window WHERE window_start < ?", Timestamp.from(now.minus(Duration.ofDays(1))));
            }
            return counted;
        });
        if (result == null || result.hits() <= maxRequests) {
            return Optional.empty();
        }
        Duration retryAfter = Duration.between(now, result.start().plus(window));
        return Optional.of(retryAfter.isNegative() ? Duration.ZERO : retryAfter);
    }

    private static String truncate(String value) {
        return value.length() > 200 ? value.substring(0, 200) : value;
    }
}
