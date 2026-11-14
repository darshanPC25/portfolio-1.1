package com.darshanpc.portfolio.admin.projects;

import com.darshanpc.portfolio.admin.support.AdminSupport.AssetResponse;
import com.darshanpc.portfolio.entity.enums.ProjectStatus;
import com.darshanpc.portfolio.util.Texts;
import com.darshanpc.portfolio.validation.WebUrl;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public final class ProjectAdminDtos {

    private ProjectAdminDtos() {
    }

    public record ProjectResponse(
            UUID id,
            String slug,
            String name,
            String summary,
            String description,
            List<String> highlights,
            List<String> tags,
            AssetResponse image,
            String imageAlt,
            ProjectStatus status,
            String repoUrl,
            String demoUrl,
            boolean featured,
            boolean visible,
            int order,
            Instant updatedAt) {
    }

    /** Create or update. {@code slug} is generated from the name when left empty. */
    public record ProjectRequest(
            @Size(max = 120)
            @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "Use lowercase letters, numbers and dashes.")
            String slug,
            @NotBlank(message = "Enter a project name.") @Size(max = 160) String name,
            @NotBlank(message = "Enter a short summary.") @Size(max = 300) String summary,
            @NotBlank(message = "Enter a description.") @Size(max = 5000) String description,
            @Size(max = 10, message = "Use at most 10 highlights.")
            List<@NotBlank @Size(max = 300, message = "Keep each highlight under 300 characters.") String> highlights,
            @Size(max = 10, message = "Use at most 10 tags.")
            List<@NotBlank @Size(max = 60, message = "Keep each tag under 60 characters.") String> tags,
            @NotBlank(message = "Describe the image for screen readers.") @Size(max = 200) String imageAlt,
            @NotNull(message = "Choose a status.") ProjectStatus status,
            @WebUrl String repoUrl,
            @WebUrl String demoUrl,
            boolean featured,
            boolean visible) {

        public ProjectRequest {
            slug = Texts.blankToNull(slug);
            name = Texts.strip(name);
            summary = Texts.strip(summary);
            description = Texts.strip(description);
            highlights = Texts.cleanList(highlights);
            tags = Texts.cleanList(tags);
            imageAlt = Texts.strip(imageAlt);
            repoUrl = Texts.blankToNull(repoUrl);
            demoUrl = Texts.blankToNull(demoUrl);
        }
    }
}
