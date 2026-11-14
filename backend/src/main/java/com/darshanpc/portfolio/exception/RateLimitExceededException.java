package com.darshanpc.portfolio.exception;

import java.time.Duration;
import lombok.Getter;

/** The client sent too many requests. Mapped to 429 with a Retry-After header. */
@Getter
public class RateLimitExceededException extends RuntimeException {

    private final Duration retryAfter;

    public RateLimitExceededException(Duration retryAfter) {
        super("Too many requests");
        this.retryAfter = retryAfter;
    }
}
