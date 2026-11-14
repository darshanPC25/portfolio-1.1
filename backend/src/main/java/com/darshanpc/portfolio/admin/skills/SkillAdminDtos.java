package com.darshanpc.portfolio.admin.skills;

import com.darshanpc.portfolio.entity.enums.SkillIcon;
import com.darshanpc.portfolio.util.Texts;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public final class SkillAdminDtos {

    private SkillAdminDtos() {
    }

    public record SkillResponse(UUID id, String name, boolean visible, int order) {
    }

    public record CategoryResponse(
            UUID id,
            String title,
            SkillIcon icon,
            String description,
            boolean visible,
            int order,
            List<SkillResponse> skills) {
    }

    public record CategoryRequest(
            @NotBlank(message = "Enter a category title.") @Size(max = 80) String title,
            @NotNull(message = "Choose an icon.") SkillIcon icon,
            @NotBlank(message = "Enter a short description.") @Size(max = 200) String description,
            boolean visible) {

        public CategoryRequest {
            title = Texts.strip(title);
            description = Texts.strip(description);
        }
    }

    /** Create or update a skill. On update, {@code categoryId} moves it to another category. */
    public record SkillRequest(
            @NotBlank(message = "Enter a skill name.") @Size(max = 80) String name,
            boolean visible,
            UUID categoryId) {

        public SkillRequest {
            name = Texts.strip(name);
        }
    }
}
