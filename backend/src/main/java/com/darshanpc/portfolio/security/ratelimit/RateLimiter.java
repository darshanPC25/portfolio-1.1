package com.darshanpc.portfolio.security.ratelimit;

import java.time.Duration;
import java.util.Optional;

/** Fixed-window rate limiting: each key may make a number of requests per window. */
public interface RateLimiter {

    /**
     * Records a request for {@code key}.
     *
     * @return empty when allowed, otherwise how long until the key may try again
     */
    Optional<Duration> tryAcquire(String key);
}
