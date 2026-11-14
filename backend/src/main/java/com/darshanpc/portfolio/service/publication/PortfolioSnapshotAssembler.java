package com.darshanpc.portfolio.service.publication;

import com.darshanpc.portfolio.dto.portfolio.PortfolioResponse;
import com.darshanpc.portfolio.entity.PortfolioProfile;
import com.darshanpc.portfolio.entity.PortfolioSection;
import com.darshanpc.portfolio.entity.enums.SectionKey;
import com.darshanpc.portfolio.mapper.PortfolioSnapshotMapper;
import com.darshanpc.portfolio.repository.AboutContentRepository;
import com.darshanpc.portfolio.repository.EducationRepository;
import com.darshanpc.portfolio.repository.ElementStyleRepository;
import com.darshanpc.portfolio.repository.ExperienceRepository;
import com.darshanpc.portfolio.repository.HeroContentRepository;
import com.darshanpc.portfolio.repository.PortfolioAppearanceRepository;
import com.darshanpc.portfolio.repository.PortfolioProfileRepository;
import com.darshanpc.portfolio.repository.PortfolioSectionRepository;
import com.darshanpc.portfolio.repository.ProjectRepository;
import com.darshanpc.portfolio.repository.SeoSettingsRepository;
import com.darshanpc.portfolio.repository.SkillCategoryRepository;
import com.darshanpc.portfolio.repository.SocialLinkRepository;
import java.time.Instant;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Reads the current draft content and turns it into the public snapshot.
 * Hidden sections become {@code null}; hidden items and social links without
 * a URL are left out.
 */
@Component
@RequiredArgsConstructor
public class PortfolioSnapshotAssembler {

    private final PortfolioProfileRepository profiles;
    private final HeroContentRepository heroes;
    private final AboutContentRepository abouts;
    private final PortfolioSectionRepository sections;
    private final SkillCategoryRepository skillCategories;
    private final ProjectRepository projects;
    private final ExperienceRepository experiences;
    private final EducationRepository educations;
    private final SocialLinkRepository socialLinks;
    private final PortfolioAppearanceRepository appearances;
    private final SeoSettingsRepository seoSettings;
    private final ElementStyleRepository elementStyles;
    private final PortfolioSnapshotMapper mapper;

    @Transactional(readOnly = true)
    public PortfolioResponse assemble(int version, Instant publishedAt) {
        PortfolioProfile profile = profiles.findFirstBy().orElseThrow(() -> missing("profile"));
        var hero = heroes.findFirstBy().orElseThrow(() -> missing("hero"));
        var about = abouts.findFirstBy().orElseThrow(() -> missing("about"));
        var appearance = appearances.findFirstBy().orElseThrow(() -> missing("appearance"));
        var seo = seoSettings.findFirstBy().orElseThrow(() -> missing("SEO settings"));

        List<PortfolioSection> ordered = sections.findAllByOrderByDisplayOrderAsc();
        Map<SectionKey, PortfolioSection> visible = new EnumMap<>(SectionKey.class);
        ordered.stream().filter(PortfolioSection::isVisible).forEach(s -> visible.put(s.getSectionKey(), s));

        return new PortfolioResponse(
                version,
                publishedAt,
                mapper.profile(profile),
                ordered.stream().filter(PortfolioSection::isVisible).map(mapper::navItem).toList(),
                mapper.hero(hero),
                section(visible, SectionKey.ABOUT, s -> mapper.about(s, about)),
                section(visible, SectionKey.SKILLS, s -> new PortfolioResponse.SkillsSection(
                        s.getEyebrow(), s.getHeading(), s.getIntro(),
                        skillCategories.findAllByVisibleTrueOrderByDisplayOrderAsc().stream()
                                .map(mapper::skillGroup).toList())),
                section(visible, SectionKey.PROJECTS, s -> new PortfolioResponse.ProjectsSection(
                        s.getEyebrow(), s.getHeading(), s.getIntro(),
                        projects.findAllByVisibleTrueOrderByDisplayOrderAsc().stream()
                                .map(mapper::project).toList())),
                section(visible, SectionKey.JOURNEY, s -> new PortfolioResponse.JourneySection(
                        s.getEyebrow(), s.getHeading(), s.getIntro(),
                        experiences.findAllByVisibleTrueOrderByDisplayOrderAsc().stream()
                                .map(mapper::journeyEntry).toList())),
                section(visible, SectionKey.EDUCATION, s -> new PortfolioResponse.EducationSection(
                        s.getEyebrow(), s.getHeading(), s.getIntro(),
                        educations.findAllByVisibleTrueOrderByDisplayOrderAsc().stream()
                                .map(mapper::educationEntry).toList())),
                section(visible, SectionKey.GITHUB, s -> mapper.github(s, profile)),
                section(visible, SectionKey.CONTACT, mapper::contact),
                socialLinks.findAllByVisibleTrueOrderByDisplayOrderAsc().stream()
                        .filter(link -> link.getUrl() != null && !link.getUrl().isBlank())
                        .map(mapper::socialLink)
                        .toList(),
                mapper.footer(profile),
                mapper.appearance(appearance),
                mapper.seo(seo),
                elementStyles.findAll().stream().collect(java.util.stream.Collectors.toMap(
                        com.darshanpc.portfolio.entity.ElementStyle::getElementKey, mapper::style,
                        (a, b) -> a, java.util.TreeMap::new)));
    }

    private static <T> T section(
            Map<SectionKey, PortfolioSection> visible, SectionKey key, Function<PortfolioSection, T> build) {
        PortfolioSection section = visible.get(key);
        return section == null ? null : build.apply(section);
    }

    private static IllegalStateException missing(String what) {
        return new IllegalStateException("Portfolio content is incomplete: no " + what + " row exists");
    }
}
