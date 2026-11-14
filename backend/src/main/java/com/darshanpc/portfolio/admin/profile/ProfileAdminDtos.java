package com.darshanpc.portfolio.admin.profile;

import com.darshanpc.portfolio.admin.support.AdminSupport.AssetResponse;
import com.darshanpc.portfolio.util.Texts;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public final class ProfileAdminDtos {

    private ProfileAdminDtos() {
    }

    public record ProfileResponse(
            String fullName,
            String preferredName,
            String title,
            String location,
            AssetResponse photo,
            AssetResponse photoDark,
            String photoAlt,
            AssetResponse resume,
            String publicEmail,
            boolean available,
            String availabilityLabel,
            String githubUsername,
            String copyrightText,
            String footerNote,
            Instant updatedAt) {
    }

    public record ProfileRequest(
            @NotBlank(message = "Enter your full name.") @Size(max = 120) String fullName,
            @NotBlank(message = "Enter your preferred name.") @Size(max = 60) String preferredName,
            @NotBlank(message = "Enter a professional title.") @Size(max = 160) String title,
            @NotBlank(message = "Enter a location.") @Size(max = 120) String location,
            @NotBlank(message = "Describe the photo for screen readers.") @Size(max = 200) String photoAlt,
            @Email(message = "Enter a valid email address.") @Size(max = 254) String publicEmail,
            boolean available,
            @NotBlank(message = "Enter an availability label.") @Size(max = 120) String availabilityLabel,
            @Pattern(regexp = "^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$",
                    message = "Enter a GitHub username (letters, numbers and dashes).")
            String githubUsername,
            @NotBlank(message = "Enter the copyright line.") @Size(max = 200) String copyrightText,
            @NotBlank(message = "Enter a footer note.") @Size(max = 200) String footerNote) {

        public ProfileRequest {
            fullName = Texts.strip(fullName);
            preferredName = Texts.strip(preferredName);
            title = Texts.strip(title);
            location = Texts.strip(location);
            photoAlt = Texts.strip(photoAlt);
            publicEmail = Texts.blankToNull(publicEmail);
            availabilityLabel = Texts.strip(availabilityLabel);
            githubUsername = Texts.blankToNull(githubUsername);
            copyrightText = Texts.strip(copyrightText);
            footerNote = Texts.strip(footerNote);
        }
    }

    /** Current resume, or null when none is uploaded. */
    public record ResumeResponse(AssetResponse resume) {
    }
}
