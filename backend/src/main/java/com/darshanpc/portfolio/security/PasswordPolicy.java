package com.darshanpc.portfolio.security;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

/**
 * Administrator password rules: 12–64 characters and at most 72 bytes, the
 * longest input BCrypt actually uses.
 */
public final class PasswordPolicy {

    public static final int MIN_LENGTH = 12;
    public static final int MAX_LENGTH = 64;
    private static final int BCRYPT_MAX_BYTES = 72;

    private PasswordPolicy() {
    }

    /** A message describing why the password is not acceptable, or empty if it is. */
    public static Optional<String> problem(String password) {
        if (password == null || password.length() < MIN_LENGTH) {
            return Optional.of("Use at least " + MIN_LENGTH + " characters.");
        }
        if (password.length() > MAX_LENGTH || password.getBytes(StandardCharsets.UTF_8).length > BCRYPT_MAX_BYTES) {
            return Optional.of("Use at most " + MAX_LENGTH + " characters.");
        }
        if (password.isBlank()) {
            return Optional.of("The password cannot be only spaces.");
        }
        return Optional.empty();
    }
}
