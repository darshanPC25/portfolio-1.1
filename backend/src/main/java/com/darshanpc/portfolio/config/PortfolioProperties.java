package com.darshanpc.portfolio.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;
import org.springframework.validation.annotation.Validated;

/** Application settings under the {@code portfolio.*} prefix. */
@Validated
@ConfigurationProperties(prefix = "portfolio")
public record PortfolioProperties(
        @Valid @NotNull Cors cors,
        @Valid @NotNull Publication publication,
        @Valid @NotNull Contact contact,
        @Valid @NotNull Admin admin,
        @Valid @NotNull Storage storage) {

    /** Browser origins allowed to call the API (the frontend). */
    public record Cors(@NotEmpty List<String> allowedOrigins) {
    }

    /** When true, the seeded draft content is published once if nothing has been published yet. */
    public record Publication(boolean bootstrapOnStartup) {
    }

    public record Contact(@Valid @NotNull RateLimit rateLimit, String ipHashSalt) {
    }

    /** At most {@code maxRequests} requests per client IP in each {@code window}. */
    public record RateLimit(@Positive int maxRequests, @NotNull Duration window) {
    }

    public record Admin(
            @Valid @NotNull Bootstrap bootstrap,
            @Valid @NotNull RateLimit loginRateLimit,
            @Positive int maxFailedAttempts,
            @NotNull Duration lockDuration) {

        /**
         * One-time provisioning of the first administrator. Used only while the
         * admin_user table is empty; ignored afterwards.
         */
        public record Bootstrap(String email, String password, String displayName) {

            public boolean isConfigured() {
                return email != null && !email.isBlank() && password != null && !password.isBlank();
            }
        }
    }

    /** Where uploaded files are kept, and upload size limits. */
    public record Storage(
            @NotBlank String directory,
            @NotNull DataSize maxImageSize,
            @NotNull DataSize maxDocumentSize) {
    }
}
