package com.darshanpc.portfolio.admin.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.UUID;

/** Request and response bodies for sign-in and the signed-in account. */
public final class AuthDtos {

    private AuthDtos() {
    }

    public record LoginRequest(
            @NotBlank(message = "Please enter your email.")
            @Email(message = "Please enter a valid email address.")
            @Size(max = 254)
            String email,

            @NotBlank(message = "Please enter your password.")
            @Size(max = 128)
            String password) {
    }

    public record CsrfResponse(String headerName, String token) {
    }

    /** The signed-in administrator. {@code csrfToken} is only set right after sign-in. */
    public record SessionResponse(
            UUID id,
            String email,
            String displayName,
            Instant lastLoginAt,
            String csrfToken) {
    }

    public record AccountUpdateRequest(
            @NotBlank(message = "Please enter a display name.")
            @Size(max = 80, message = "Display name is too long.")
            String displayName,

            @NotBlank(message = "Please enter your email.")
            @Email(message = "Please enter a valid email address.")
            @Size(max = 254)
            String email,

            @NotBlank(message = "Enter your current password to confirm.")
            String currentPassword) {
    }

    public record PasswordChangeRequest(
            @NotBlank(message = "Enter your current password.")
            String currentPassword,

            @NotBlank(message = "Enter a new password.")
            String newPassword) {
    }
}
