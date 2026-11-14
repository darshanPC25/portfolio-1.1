package com.darshanpc.portfolio.security.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;

class FixedWindowRateLimiterTest {

    /** A clock the test can move forward. */
    static final class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-01-01T00:00:00Z");

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public ZoneId getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(ZoneId zone) {
            return this;
        }

        @Override
        public Instant instant() {
            return now;
        }
    }

    private final MutableClock clock = new MutableClock();
    private final FixedWindowRateLimiter limiter = new FixedWindowRateLimiter(2, Duration.ofMinutes(10), clock);

    @Test
    void allowsUpToTheLimitThenReportsTimeRemaining() {
        assertThat(limiter.tryAcquire("a")).isEmpty();
        assertThat(limiter.tryAcquire("a")).isEmpty();

        clock.advance(Duration.ofMinutes(4));
        assertThat(limiter.tryAcquire("a")).contains(Duration.ofMinutes(6));
    }

    @Test
    void windowResetsAfterItExpires() {
        limiter.tryAcquire("a");
        limiter.tryAcquire("a");
        assertThat(limiter.tryAcquire("a")).isPresent();

        clock.advance(Duration.ofMinutes(10));
        assertThat(limiter.tryAcquire("a")).isEmpty();
    }

    @Test
    void keysAreIndependent() {
        limiter.tryAcquire("a");
        limiter.tryAcquire("a");
        assertThat(limiter.tryAcquire("a")).isPresent();
        assertThat(limiter.tryAcquire("b")).isEmpty();
    }

    @Test
    void rejectsInvalidConfiguration() {
        assertThatThrownBy(() -> new FixedWindowRateLimiter(0, Duration.ofMinutes(1), clock))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new FixedWindowRateLimiter(1, Duration.ZERO, clock))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
