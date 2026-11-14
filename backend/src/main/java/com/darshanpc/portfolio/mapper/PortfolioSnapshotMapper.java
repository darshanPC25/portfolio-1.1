package com.darshanpc.portfolio.mapper;

import com.darshanpc.portfolio.dto.portfolio.PortfolioResponse;
import com.darshanpc.portfolio.entity.AboutContent;
import com.darshanpc.portfolio.entity.Education;
import com.darshanpc.portfolio.entity.Experience;
import com.darshanpc.portfolio.entity.HeroContent;
import com.darshanpc.portfolio.entity.PortfolioAppearance;
import com.darshanpc.portfolio.entity.PortfolioAsset;
import com.darshanpc.portfolio.entity.PortfolioProfile;
import com.darshanpc.portfolio.entity.PortfolioSection;
import com.darshanpc.portfolio.entity.Project;
import com.darshanpc.portfolio.entity.SeoSettings;
import com.darshanpc.portfolio.entity.SkillCategory;
import com.darshanpc.portfolio.entity.SocialLink;
import com.darshanpc.portfolio.entity.enums.AssetStorageType;
import java.util.List;
import java.util.stream.IntStream;
import org.springframework.stereotype.Component;

/**
 * Converts draft entities into the public response shape. Only called while
 * building a publication snapshot; entities are never serialised directly.
 */
@Component
public class PortfolioSnapshotMapper {

    /** Fixed by the specification: the footer link reads exactly "Login" and opens the admin login. */
    public static final String LOGIN_LABEL = "Login";
    public static final String LOGIN_HREF = "/admin/login";

    static final String SETTING_EMPTY_MESSAGE = "emptyMessage";
    static final String SETTING_FORM_HEADING = "formHeading";
    static final String SETTING_SUBMIT_LABEL = "submitLabel";

    public PortfolioResponse.Profile profile(PortfolioProfile profile) {
        return new PortfolioResponse.Profile(
                profile.getFullName(),
                profile.getPreferredName(),
                profile.getTitle(),
                profile.getLocation(),
                assetUrl(profile.getPhoto()),
                assetUrl(profile.getPhotoDark()),
                profile.getPhotoAlt(),
                assetUrl(profile.getResume()),
                profile.getPublicEmail(),
                new PortfolioResponse.Availability(profile.isAvailable(), profile.getAvailabilityLabel()));
    }

    public PortfolioResponse.NavItem navItem(PortfolioSection section) {
        return new PortfolioResponse.NavItem(section.getSectionKey().publicValue(), section.getNavLabel());
    }

    public PortfolioResponse.Hero hero(HeroContent hero) {
        return new PortfolioResponse.Hero(
                hero.getGreeting(),
                hero.getRole(),
                hero.getTagline(),
                new PortfolioResponse.CallToAction(hero.getPrimaryCtaLabel(), hero.getPrimaryCtaHref()),
                new PortfolioResponse.CallToAction(hero.getSecondaryCtaLabel(), hero.getSecondaryCtaHref()),
                hero.getResumeLabel(),
                hero.getFocusLabel(),
                List.copyOf(hero.getFocusAreas()));
    }

    public PortfolioResponse.About about(PortfolioSection section, AboutContent about) {
        List<PortfolioResponse.Fact> facts = IntStream.range(0, about.getFacts().size())
                .mapToObj(i -> new PortfolioResponse.Fact(
                        "fact-" + (i + 1), about.getFacts().get(i).getLabel(), about.getFacts().get(i).getValue()))
                .toList();
        List<PortfolioResponse.Step> steps = IntStream.range(0, about.getApproachSteps().size())
                .mapToObj(i -> {
                    var step = about.getApproachSteps().get(i);
                    return new PortfolioResponse.Step(
                            "approach-" + (i + 1), step.getStepLabel(), step.getTitle(), step.getDescription());
                })
                .toList();
        return new PortfolioResponse.About(
                section.getEyebrow(),
                section.getHeading(),
                section.getIntro(),
                List.copyOf(about.getParagraphs()),
                facts,
                about.getApproachHeading(),
                steps);
    }

    public PortfolioResponse.SkillGroup skillGroup(SkillCategory category) {
        List<PortfolioResponse.SkillItem> skills = category.getSkills().stream()
                .filter(skill -> skill.isVisible())
                .map(skill -> new PortfolioResponse.SkillItem(skill.getId().toString(), skill.getName()))
                .toList();
        return new PortfolioResponse.SkillGroup(
                category.getId().toString(),
                category.getTitle(),
                category.getIcon().publicValue(),
                category.getDescription(),
                skills,
                category.getDisplayOrder());
    }

    public PortfolioResponse.ProjectItem project(Project project) {
        return new PortfolioResponse.ProjectItem(
                project.getId().toString(),
                project.getSlug(),
                project.getName(),
                project.getSummary(),
                project.getDescription(),
                List.copyOf(project.getHighlights()),
                List.copyOf(project.getTags()),
                assetUrl(project.getImage()),
                project.getImageAlt(),
                project.getStatus().publicValue(),
                project.getRepoUrl(),
                project.getDemoUrl(),
                project.isFeatured(),
                project.getDisplayOrder());
    }

    public PortfolioResponse.JourneyEntry journeyEntry(Experience experience) {
        return new PortfolioResponse.JourneyEntry(
                experience.getId().toString(),
                experience.getPeriodLabel(),
                experience.getTitle(),
                experience.getOrganisation(),
                experience.getDescription(),
                experience.getDisplayOrder());
    }

    public PortfolioResponse.EducationEntry educationEntry(Education education) {
        return new PortfolioResponse.EducationEntry(
                education.getId().toString(),
                education.getDegree(),
                education.getFieldOfStudy(),
                education.getInstitution(),
                education.getPeriodLabel(),
                education.getDescription(),
                education.getDisplayOrder());
    }

    public PortfolioResponse.GitHubSection github(PortfolioSection section, PortfolioProfile profile) {
        return new PortfolioResponse.GitHubSection(
                section.getEyebrow(),
                section.getHeading(),
                section.getIntro(),
                profile.getGithubUsername(),
                section.setting(SETTING_EMPTY_MESSAGE));
    }

    public PortfolioResponse.ContactSection contact(PortfolioSection section) {
        return new PortfolioResponse.ContactSection(
                section.getEyebrow(),
                section.getHeading(),
                section.getIntro(),
                section.setting(SETTING_FORM_HEADING),
                section.setting(SETTING_SUBMIT_LABEL));
    }

    public PortfolioResponse.SocialLinkItem socialLink(SocialLink link) {
        return new PortfolioResponse.SocialLinkItem(
                link.getId().toString(), link.getPlatform().publicValue(), link.getLabel(), link.getUrl());
    }

    public PortfolioResponse.Footer footer(PortfolioProfile profile) {
        return new PortfolioResponse.Footer(profile.getCopyrightText(), LOGIN_LABEL, LOGIN_HREF, profile.getFooterNote());
    }

    public PortfolioResponse.Appearance appearance(PortfolioAppearance appearance) {
        return new PortfolioResponse.Appearance(
                appearance.getAccentColor(),
                appearance.getBackgroundStyle().publicValue(),
                appearance.getHeadingFont().publicValue(),
                appearance.isHeroSceneEnabled(),
                appearance.isMotionEnabled(),
                appearance.getBackgroundColor(),
                appearance.getTextColor(),
                appearance.getBodyFont().publicValue(),
                appearance.getCornerStyle().publicValue());
    }

    public PortfolioResponse.ElementStyle style(com.darshanpc.portfolio.entity.ElementStyle style) {
        return new PortfolioResponse.ElementStyle(
                style.getColor(),
                style.getFontScale() == null ? null : style.getFontScale().doubleValue(),
                style.getFontWeight(),
                style.getTextAlign(),
                style.getFontFamily());
    }

    public PortfolioResponse.Seo seo(SeoSettings seo) {
        return new PortfolioResponse.Seo(
                seo.getMetaTitle(),
                seo.getMetaDescription(),
                seo.getCanonicalUrl(),
                assetUrl(seo.getOgImage()),
                seo.isAllowIndexing());
    }

    /**
     * Public address of an asset. External assets keep their URL; files stored
     * by the backend are addressed relative to the API so the frontend can
     * resolve them against the API origin.
     */
    public static String assetUrl(PortfolioAsset asset) {
        if (asset == null) {
            return null;
        }
        return asset.getStorageType() == AssetStorageType.EXTERNAL
                ? asset.getUrl()
                : "/api/v1/assets/" + asset.getId();
    }
}
