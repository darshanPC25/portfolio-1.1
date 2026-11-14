package com.darshanpc.portfolio.admin.entries;

import com.darshanpc.portfolio.entity.enums.SocialPlatform;
import com.darshanpc.portfolio.util.Texts;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/** Professional journey (experience), education and social links. */
public final class EntryAdminDtos {

    private EntryAdminDtos() {
    }

    public record ExperienceResponse(
            UUID id,
            String period,
            String title,
            String organisation,
            String description,
            LocalDate startDate,
            LocalDate endDate,
            boolean visible,
            int order,
            Instant updatedAt) {
    }

    public record ExperienceRequest(
            @NotBlank(message = "Enter the period, e.g. 2025 – Now.") @Size(max = 40) String period,
            @NotBlank(message = "Enter a title.") @Size(max = 160) String title,
            @Size(max = 160) String organisation,
            @NotBlank(message = "Enter a description.") @Size(max = 2000) String description,
            LocalDate startDate,
            LocalDate endDate,
            boolean visible) {

        public ExperienceRequest {
            period = Texts.strip(period);
            title = Texts.strip(title);
            organisation = Texts.blankToNull(organisation);
            description = Texts.strip(description);
        }
    }

    public record EducationResponse(
            UUID id,
            String degree,
            String field,
            String institution,
            String period,
            String description,
            boolean visible,
            int order,
            Instant updatedAt) {
    }

    public record EducationRequest(
            @NotBlank(message = "Enter the degree.") @Size(max = 160) String degree,
            @NotBlank(message = "Enter the field of study.") @Size(max = 200) String field,
            @Size(max = 200) String institution,
            @NotBlank(message = "Enter the period, e.g. Graduating 2026.") @Size(max = 60) String period,
            @NotBlank(message = "Enter a description.") @Size(max = 2000) String description,
            boolean visible) {

        public EducationRequest {
            degree = Texts.strip(degree);
            field = Texts.strip(field);
            institution = Texts.blankToNull(institution);
            period = Texts.strip(period);
            description = Texts.strip(description);
        }
    }

    public record SocialLinkResponse(
            UUID id,
            SocialPlatform platform,
            String label,
            String url,
            boolean visible,
            int order,
            Instant updatedAt) {
    }

    /** {@code url}: a web address, or for EMAIL an address (stored as {@code mailto:}). */
    public record SocialLinkRequest(
            @NotNull(message = "Choose a platform.") SocialPlatform platform,
            @NotBlank(message = "Enter a label.") @Size(max = 60) String label,
            @Size(max = 500) String url,
            boolean visible) {

        public SocialLinkRequest {
            label = Texts.strip(label);
            url = Texts.blankToNull(url);
        }
    }
}
