package com.darshanpc.portfolio.admin.site;

import com.darshanpc.portfolio.admin.support.AdminSupport.AssetResponse;
import com.darshanpc.portfolio.entity.enums.BackgroundStyle;
import com.darshanpc.portfolio.entity.enums.CornerStyle;
import com.darshanpc.portfolio.entity.enums.HeadingFont;
import com.darshanpc.portfolio.entity.enums.SectionKey;
import com.darshanpc.portfolio.util.Texts;
import com.darshanpc.portfolio.validation.LinkTarget;
import com.darshanpc.portfolio.validation.WebUrl;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Hero, About, section headings, Appearance and SEO. */
public final class SiteAdminDtos {

    private SiteAdminDtos() {
    }

    // ---------------------------------------------------------------- Hero

    public record HeroDto(
            @NotBlank(message = "Enter a greeting.") @Size(max = 120) String greeting,
            @NotBlank(message = "Enter a role.") @Size(max = 120) String role,
            @NotBlank(message = "Enter a tagline.") @Size(max = 300) String tagline,
            @NotBlank(message = "Enter a label.") @Size(max = 60) String primaryCtaLabel,
            @NotBlank(message = "Enter a destination.") @LinkTarget @Size(max = 500) String primaryCtaHref,
            @NotBlank(message = "Enter a label.") @Size(max = 60) String secondaryCtaLabel,
            @NotBlank(message = "Enter a destination.") @LinkTarget @Size(max = 500) String secondaryCtaHref,
            @NotBlank(message = "Enter a label.") @Size(max = 60) String resumeLabel,
            @NotBlank(message = "Enter a label.") @Size(max = 60) String focusLabel,
            @NotNull @Size(max = 12, message = "Use at most 12 focus areas.")
            List<@NotBlank @Size(max = 120, message = "Keep each focus area under 120 characters.") String> focusAreas,
            Instant updatedAt) {

        public HeroDto {
            greeting = Texts.strip(greeting);
            role = Texts.strip(role);
            tagline = Texts.strip(tagline);
            primaryCtaLabel = Texts.strip(primaryCtaLabel);
            primaryCtaHref = Texts.strip(primaryCtaHref);
            secondaryCtaLabel = Texts.strip(secondaryCtaLabel);
            secondaryCtaHref = Texts.strip(secondaryCtaHref);
            resumeLabel = Texts.strip(resumeLabel);
            focusLabel = Texts.strip(focusLabel);
            focusAreas = Texts.cleanList(focusAreas);
        }
    }

    // --------------------------------------------------------------- About

    public record FactDto(
            @NotBlank(message = "Enter a label.") @Size(max = 60) String label,
            @NotBlank(message = "Enter a value.") @Size(max = 120) String value) {

        public FactDto {
            label = Texts.strip(label);
            value = Texts.strip(value);
        }
    }

    public record StepDto(
            @NotBlank(message = "Enter a number or label.") @Size(max = 10) String step,
            @NotBlank(message = "Enter a title.") @Size(max = 80) String title,
            @NotBlank(message = "Enter a description.") @Size(max = 300) String description) {

        public StepDto {
            step = Texts.strip(step);
            title = Texts.strip(title);
            description = Texts.strip(description);
        }
    }

    public record AboutDto(
            @NotNull @Size(min = 1, max = 6, message = "Use between 1 and 6 paragraphs.")
            List<@NotBlank @Size(max = 2000, message = "Keep each paragraph under 2000 characters.") String> paragraphs,
            @NotNull @Size(max = 8, message = "Use at most 8 facts.") List<@Valid FactDto> facts,
            @NotBlank(message = "Enter a heading.") @Size(max = 120) String approachHeading,
            @NotNull @Size(max = 6, message = "Use at most 6 steps.") List<@Valid StepDto> approach,
            Instant updatedAt) {

        public AboutDto {
            paragraphs = Texts.cleanList(paragraphs);
            facts = facts == null ? List.of() : facts;
            approachHeading = Texts.strip(approachHeading);
            approach = approach == null ? List.of() : approach;
        }
    }

    // ------------------------------------------------------------ Sections

    public record SectionResponse(
            SectionKey key,
            String navLabel,
            String eyebrow,
            String heading,
            String intro,
            boolean visible,
            int order,
            Map<String, String> settings,
            List<String> allowedSettings) {
    }

    public record SectionRequest(
            @NotBlank(message = "Enter a navigation label.") @Size(max = 40) String navLabel,
            @NotBlank(message = "Enter an eyebrow.") @Size(max = 80) String eyebrow,
            @NotBlank(message = "Enter a heading.") @Size(max = 160) String heading,
            @Size(max = 500) String intro,
            boolean visible,
            Map<String, @Size(max = 500) String> settings) {

        public SectionRequest {
            navLabel = Texts.strip(navLabel);
            eyebrow = Texts.strip(eyebrow);
            heading = Texts.strip(heading);
            intro = Texts.blankToNull(intro);
            Map<String, String> cleaned = new LinkedHashMap<>();
            if (settings != null) {
                settings.forEach((k, v) -> {
                    String value = Texts.blankToNull(v);
                    if (k != null && value != null) {
                        cleaned.put(k, value);
                    }
                });
            }
            settings = cleaned;
        }
    }

    public record SectionOrderRequest(@NotNull List<SectionKey> keys) {
    }

    // ---------------------------------------------------------- Appearance

    public record AppearanceDto(
            @NotBlank @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "Use a colour like #6f8446.") String accentColor,
            @NotNull BackgroundStyle backgroundStyle,
            @NotNull HeadingFont headingFont,
            boolean heroSceneEnabled,
            boolean motionEnabled,
            Instant updatedAt,
            /* Custom page background; overrides backgroundStyle. Null = use the preset. */
            @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "Use a colour like #f8f5ec.") String backgroundColor,
            /* Custom main text colour. Null = design default. */
            @Pattern(regexp = "^#[0-9a-fA-F]{6}$", message = "Use a colour like #222a1b.") String textColor,
            /* Body text typeface; defaults to SANS when omitted. */
            HeadingFont bodyFont,
            /* Corner rounding; defaults to SOFT when omitted. */
            CornerStyle cornerStyle) {

        public AppearanceDto {
            backgroundColor = Texts.blankToNull(backgroundColor);
            textColor = Texts.blankToNull(textColor);
            bodyFont = bodyFont == null ? HeadingFont.SANS : bodyFont;
            cornerStyle = cornerStyle == null ? CornerStyle.SOFT : cornerStyle;
        }
    }

    // ----------------------------------------------------------------- SEO

    public record SeoResponse(
            String title,
            String description,
            String canonicalUrl,
            boolean allowIndexing,
            AssetResponse ogImage,
            Instant updatedAt) {
    }

    public record SeoRequest(
            @NotBlank(message = "Enter a page title.") @Size(max = 120) String title,
            @NotBlank(message = "Enter a description.") @Size(max = 300) String description,
            @WebUrl String canonicalUrl,
            boolean allowIndexing) {

        public SeoRequest {
            title = Texts.strip(title);
            description = Texts.strip(description);
            canonicalUrl = Texts.blankToNull(canonicalUrl);
        }
    }
}
