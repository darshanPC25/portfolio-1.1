package com.darshanpc.portfolio.dto.contact;

import com.darshanpc.portfolio.validation.SingleLine;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * A contact form submission. Limits match the frontend form. Surrounding
 * whitespace is removed before validation.
 */
@Schema(name = "ContactRequest")
public record ContactRequest(
        @NotBlank(message = "Please enter your name.")
        @Size(min = 2, max = 80, message = "Name must be between 2 and 80 characters.")
        @SingleLine(message = "Name must be a single line.")
        String name,

        @NotBlank(message = "Please enter your email.")
        @Email(message = "Please enter a valid email address.")
        @Size(max = 254, message = "Email is too long.")
        String email,

        @NotBlank(message = "Please add a short subject.")
        @Size(min = 3, max = 120, message = "Subject must be between 3 and 120 characters.")
        @SingleLine(message = "Subject must be a single line.")
        String subject,

        @NotBlank(message = "Please write a message.")
        @Size(min = 10, max = 2000, message = "Message must be between 10 and 2000 characters.")
        String message,

        @Schema(description = "Anti-spam field that real visitors never see. Must be left empty.")
        @Size(max = 200)
        String website) {

    public ContactRequest {
        name = strip(name);
        email = strip(email);
        subject = strip(subject);
        message = strip(message);
        website = strip(website);
    }

    /** True when the hidden anti-spam field was filled in, which only automated senders do. */
    public boolean isLikelySpam() {
        return website != null && !website.isEmpty();
    }

    private static String strip(String value) {
        return value == null ? null : value.strip();
    }
}
