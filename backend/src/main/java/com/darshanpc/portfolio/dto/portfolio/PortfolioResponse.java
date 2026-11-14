package com.darshanpc.portfolio.dto.portfolio;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;

/**
 * The complete public portfolio as published. This exact structure is stored
 * as the publication snapshot and returned by {@code GET /api/v1/portfolio};
 * the narrower endpoints return parts of it.
 *
 * <p>A section field is {@code null} when that section is hidden. Field names
 * match the frontend content model.
 */
@Schema(name = "Portfolio")
public record PortfolioResponse(
        int version,
        Instant publishedAt,
        Profile profile,
        List<NavItem> navigation,
        Hero hero,
        About about,
        SkillsSection skills,
        ProjectsSection projects,
        JourneySection journey,
        EducationSection education,
        GitHubSection github,
        ContactSection contact,
        List<SocialLinkItem> socialLinks,
        Footer footer,
        Appearance appearance,
        Seo seo) {

    @Schema(name = "Profile")
    public record Profile(
            String fullName,
            String preferredName,
            String title,
            String location,
            String photoUrl,
            String photoAlt,
            String resumeUrl,
            String email,
            Availability availability) {
    }

    public record Availability(boolean available, String label) {
    }

    /** {@code id} is the section anchor, e.g. "projects". */
    public record NavItem(String id, String label) {
    }

    public record CallToAction(String label, String href) {
    }

    public record Hero(
            String greeting,
            String role,
            String tagline,
            CallToAction primaryCta,
            CallToAction secondaryCta,
            String resumeLabel,
            String focusLabel,
            List<String> focusAreas) {
    }

    public record About(
            String eyebrow,
            String heading,
            String intro,
            List<String> paragraphs,
            List<Fact> facts,
            String approachHeading,
            List<Step> approach) {
    }

    public record Fact(String id, String label, String value) {
    }

    public record Step(String id, String step, String title, String description) {
    }

    public record SkillsSection(String eyebrow, String heading, String intro, List<SkillGroup> groups) {
    }

    @Schema(name = "SkillGroup")
    public record SkillGroup(
            String id,
            String title,
            String icon,
            String description,
            List<SkillItem> skills,
            int order) {
    }

    public record SkillItem(String id, String name) {
    }

    public record ProjectsSection(String eyebrow, String heading, String intro, List<ProjectItem> items) {
    }

    @Schema(name = "Project")
    public record ProjectItem(
            String id,
            String slug,
            String name,
            String summary,
            String description,
            List<String> highlights,
            List<String> tags,
            String imageUrl,
            String imageAlt,
            @Schema(allowableValues = {"in-development", "completed", "planned"}) String status,
            String repoUrl,
            String demoUrl,
            boolean featured,
            int order) {
    }

    public record JourneySection(String eyebrow, String heading, String intro, List<JourneyEntry> entries) {
    }

    @Schema(name = "ExperienceEntry")
    public record JourneyEntry(
            String id,
            String period,
            String title,
            String organisation,
            String description,
            int order) {
    }

    public record EducationSection(String eyebrow, String heading, String intro, List<EducationEntry> entries) {
    }

    @Schema(name = "EducationEntry")
    public record EducationEntry(
            String id,
            String degree,
            String field,
            String institution,
            String period,
            String description,
            int order) {
    }

    public record GitHubSection(String eyebrow, String heading, String intro, String username, String emptyMessage) {
    }

    public record ContactSection(
            String eyebrow,
            String heading,
            String intro,
            String formHeading,
            String submitLabel) {
    }

    @Schema(name = "SocialLink")
    public record SocialLinkItem(String id, String platform, String label, String url) {
    }

    public record Footer(String copyright, String loginLabel, String loginHref, String note) {
    }

    /**
     * Visual settings. {@code backgroundStyle}: ivory | cream | mist;
     * {@code headingFont}: sans | serif. Fields may be null in snapshots
     * published before they existed (schema version 1).
     */
    public record Appearance(
            String accentColor,
            String backgroundStyle,
            String headingFont,
            boolean heroSceneEnabled,
            boolean motionEnabled) {
    }

    public record Seo(String title, String description, String canonicalUrl, String ogImageUrl, boolean allowIndexing) {
    }
}
