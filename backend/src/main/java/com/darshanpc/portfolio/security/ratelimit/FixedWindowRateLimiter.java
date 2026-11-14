package com.darshanpc.portfolio.security.ratelimit;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory fixed-window rate limiter: each key may make {@code maxRequests}
 * requests per {@code window}. Suited to a single application instance;
 * multiple instances would each keep their own counts.
 */
public class FixedWindowRateLimiter implements RateLimiter {

    /** Prune expired windows once the map grows past this many keys. */
    private static final int CLEANUP_THRESHOLD = 10_000;

    private record Window(Instant start, int count) {
    }

    private final int maxRequests;
    private final Duration window;
    private final Clock clock;
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    public FixedWindowRateLimiter(int maxRequests, Duration window, Clock clock) {
        if (maxRequests < 1 || window.isZero() || window.isNegative()) {
            throw new IllegalArgumentException("maxRequests must be positive and window must be positive");
        }
        this.maxRequests = maxRequests;
        this.window = window;
        this.clock = clock;
    }

    /**
     * Records a request for {@code key}.
     *
     * @return empty when allowed, otherwise how long until the key may try again
     */
    @Override
    public Optional<Duration> tryAcquire(String key) {
        Instant now = clock.instant();
        if (windows.size() > CLEANUP_THRESHOLD) {
            windows.values().removeIf(w -> !now.isBefore(w.start().plus(window)));
        }

        Window updated = windows.compute(key, (k, current) -> {
            if (current == null || !now.isBefore(current.start().plus(window))) {
                return new Window(now, 1);
            }
            return new Window(current.start(), current.count() + 1);
        });

        if (updated.count() <= maxRequests) {
            return Optional.empty();
        }
        return Optional.of(Duration.between(now, updated.start().plus(window)));
    }
}
