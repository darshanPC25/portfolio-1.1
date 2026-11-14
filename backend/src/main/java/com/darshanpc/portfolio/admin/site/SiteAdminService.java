package com.darshanpc.portfolio.admin.site;

import com.darshanpc.portfolio.admin.site.SiteAdminDtos.AboutDto;
import com.darshanpc.portfolio.admin.site.SiteAdminDtos.AppearanceDto;
import com.darshanpc.portfolio.admin.site.SiteAdminDtos.FactDto;
import com.darshanpc.portfolio.admin.site.SiteAdminDtos.HeroDto;
import com.darshanpc.portfolio.admin.site.SiteAdminDtos.SectionRequest;
import com.darshanpc.portfolio.admin.site.SiteAdminDtos.SectionResponse;
import com.darshanpc.portfolio.admin.site.SiteAdminDtos.SeoRequest;
import com.darshanpc.portfolio.admin.site.SiteAdminDtos.SeoResponse;
import com.darshanpc.portfolio.admin.site.SiteAdminDtos.StepDto;
import com.darshanpc.portfolio.admin.support.AdminSupport.AssetResponse;
import com.darshanpc.portfolio.entity.AboutContent;
import com.darshanpc.portfolio.entity.AboutFact;
import com.darshanpc.portfolio.entity.ApproachStep;
import com.darshanpc.portfolio.entity.HeroContent;
import com.darshanpc.portfolio.entity.PortfolioAppearance;
import com.darshanpc.portfolio.entity.PortfolioSection;
import com.darshanpc.portfolio.entity.SeoSettings;
import com.darshanpc.portfolio.entity.enums.AssetKind;
import com.darshanpc.portfolio.entity.enums.SectionKey;
import com.darshanpc.portfolio.exception.BadRequestException;
import com.darshanpc.portfolio.exception.ResourceNotFoundException;
import com.darshanpc.portfolio.repository.AboutContentRepository;
import com.darshanpc.portfolio.repository.HeroContentRepository;
import com.darshanpc.portfolio.repository.PortfolioAppearanceRepository;
import com.darshanpc.portfolio.repository.PortfolioSectionRepository;
import com.darshanpc.portfolio.repository.SeoSettingsRepository;
import com.darshanpc.portfolio.service.DraftChangeTracker;
import com.darshanpc.portfolio.service.asset.AssetStorageService;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class SiteAdminService {

    /** Extra text each section may carry, beyond eyebrow/heading/intro. */
    static final Map<SectionKey, List<String>> ALLOWED_SETTINGS = Map.of(
            SectionKey.GITHUB, List.of("emptyMessage"),
            SectionKey.CONTACT, List.of("formHeading", "submitLabel"));

    private final HeroContentRepository heroes;
    private final AboutContentRepository abouts;
    private final PortfolioSectionRepository sections;
    private final PortfolioAppearanceRepository appearances;
    private final SeoSettingsRepository seoSettings;
    private final AssetStorageService storage;
    private final DraftChangeTracker draftChanges;

    // ---------------------------------------------------------------- Hero

    @Transactional(readOnly = true)
    public HeroDto hero() {
        return toDto(hero0());
    }

    @Transactional
    public HeroDto updateHero(HeroDto dto) {
        HeroContent hero = hero0();
        hero.setGreeting(dto.greeting());
        hero.setRole(dto.role());
        hero.setTagline(dto.tagline());
        hero.setPrimaryCtaLabel(dto.primaryCtaLabel());
        hero.setPrimaryCtaHref(dto.primaryCtaHref());
        hero.setSecondaryCtaLabel(dto.secondaryCtaLabel());
        hero.setSecondaryCtaHref(dto.secondaryCtaHref());
        hero.setResumeLabel(dto.resumeLabel());
        hero.setFocusLabel(dto.focusLabel());
        hero.getFocusAreas().clear();
        hero.getFocusAreas().addAll(dto.focusAreas());
        draftChanges.markChanged();
        return toDto(hero);
    }

    // --------------------------------------------------------------- About

    @Transactional(readOnly = true)
    public AboutDto about() {
        return toDto(about0());
    }

    @Transactional
    public AboutDto updateAbout(AboutDto dto) {
        AboutContent about = about0();
        about.getParagraphs().clear();
        about.getParagraphs().addAll(dto.paragraphs());
        about.getFacts().clear();
        dto.facts().forEach(f -> about.getFacts().add(new AboutFact(f.label(), f.value())));
        about.setApproachHeading(dto.approachHeading());
        about.getApproachSteps().clear();
        dto.approach().forEach(s -> about.getApproachSteps().add(new ApproachStep(s.step(), s.title(), s.description())));
        draftChanges.markChanged();
        return toDto(about);
    }

    // ------------------------------------------------------------ Sections

    @Transactional(readOnly = true)
    public List<SectionResponse> sections() {
        return sections.findAllByOrderByDisplayOrderAsc().stream().map(SiteAdminService::toResponse).toList();
    }

    @Transactional
    public SectionResponse updateSection(SectionKey key, SectionRequest request) {
        PortfolioSection section = sections.findBySectionKey(key)
                .orElseThrow(() -> new ResourceNotFoundException("Section", key.name()));
        List<String> allowed = ALLOWED_SETTINGS.getOrDefault(key, List.of());
        for (String setting : request.settings().keySet()) {
            if (!allowed.contains(setting)) {
                throw new BadRequestException("Unknown setting '" + setting + "' for this section.", null);
            }
        }
        section.setNavLabel(request.navLabel());
        section.setEyebrow(request.eyebrow());
        section.setHeading(request.heading());
        section.setIntro(request.intro());
        section.setVisible(request.visible());
        section.getSettings().keySet().removeIf(k -> !request.settings().containsKey(k));
        section.getSettings().putAll(request.settings());
        draftChanges.markChanged();
        return toResponse(section);
    }

    @Transactional
    public List<SectionResponse> reorderSections(List<SectionKey> keys) {
        Set<SectionKey> requested = keys.isEmpty() ? EnumSet.noneOf(SectionKey.class) : EnumSet.copyOf(keys);
        if (keys.size() != SectionKey.values().length || !requested.equals(EnumSet.allOf(SectionKey.class))) {
            throw new BadRequestException("The new order must list every section exactly once.", null);
        }
        List<PortfolioSection> all = sections.findAllByOrderByDisplayOrderAsc();
        for (PortfolioSection section : all) {
            section.setDisplayOrder(keys.indexOf(section.getSectionKey()) + 1);
        }
        draftChanges.markChanged();
        return sections();
    }

    // ---------------------------------------------------------- Appearance

    @Transactional(readOnly = true)
    public AppearanceDto appearance() {
        return toDto(appearance0());
    }

    @Transactional
    public AppearanceDto updateAppearance(AppearanceDto dto) {
        PortfolioAppearance a = appearance0();
        a.setAccentColor(dto.accentColor().toLowerCase());
        a.setBackgroundStyle(dto.backgroundStyle());
        a.setHeadingFont(dto.headingFont());
        a.setHeroSceneEnabled(dto.heroSceneEnabled());
        a.setMotionEnabled(dto.motionEnabled());
        draftChanges.markChanged();
        return toDto(a);
    }

    // ----------------------------------------------------------------- SEO

    @Transactional(readOnly = true)
    public SeoResponse seo() {
        return toResponse(seo0());
    }

    @Transactional
    public SeoResponse updateSeo(SeoRequest request) {
        SeoSettings seo = seo0();
        seo.setMetaTitle(request.title());
        seo.setMetaDescription(request.description());
        seo.setCanonicalUrl(request.canonicalUrl());
        seo.setAllowIndexing(request.allowIndexing());
        draftChanges.markChanged();
        return toResponse(seo);
    }

    @Transactional
    public SeoResponse replaceOgImage(MultipartFile file) {
        SeoSettings seo = seo0();
        seo.setOgImage(storage.store(file, AssetKind.IMAGE, "Social sharing image"));
        draftChanges.markChanged();
        return toResponse(seo);
    }

    @Transactional
    public SeoResponse removeOgImage() {
        SeoSettings seo = seo0();
        seo.setOgImage(null);
        draftChanges.markChanged();
        return toResponse(seo);
    }

    // ------------------------------------------------------------- Helpers

    private HeroContent hero0() {
        return heroes.findFirstBy().orElseThrow(() -> new IllegalStateException("No hero row exists"));
    }

    private AboutContent about0() {
        return abouts.findFirstBy().orElseThrow(() -> new IllegalStateException("No about row exists"));
    }

    private PortfolioAppearance appearance0() {
        return appearances.findFirstBy().orElseThrow(() -> new IllegalStateException("No appearance row exists"));
    }

    private SeoSettings seo0() {
        return seoSettings.findFirstBy().orElseThrow(() -> new IllegalStateException("No SEO row exists"));
    }

    private static HeroDto toDto(HeroContent h) {
        return new HeroDto(h.getGreeting(), h.getRole(), h.getTagline(), h.getPrimaryCtaLabel(), h.getPrimaryCtaHref(),
                h.getSecondaryCtaLabel(), h.getSecondaryCtaHref(), h.getResumeLabel(), h.getFocusLabel(),
                List.copyOf(h.getFocusAreas()), h.getUpdatedAt());
    }

    private static AboutDto toDto(AboutContent a) {
        return new AboutDto(
                List.copyOf(a.getParagraphs()),
                a.getFacts().stream().map(f -> new FactDto(f.getLabel(), f.getValue())).toList(),
                a.getApproachHeading(),
                a.getApproachSteps().stream()
                        .map(s -> new StepDto(s.getStepLabel(), s.getTitle(), s.getDescription())).toList(),
                a.getUpdatedAt());
    }

    private static SectionResponse toResponse(PortfolioSection s) {
        return new SectionResponse(s.getSectionKey(), s.getNavLabel(), s.getEyebrow(), s.getHeading(), s.getIntro(),
                s.isVisible(), s.getDisplayOrder(), new TreeMap<>(s.getSettings()),
                ALLOWED_SETTINGS.getOrDefault(s.getSectionKey(), List.of()));
    }

    private static AppearanceDto toDto(PortfolioAppearance a) {
        return new AppearanceDto(a.getAccentColor(), a.getBackgroundStyle(), a.getHeadingFont(),
                a.isHeroSceneEnabled(), a.isMotionEnabled(), a.getUpdatedAt());
    }

    private static SeoResponse toResponse(SeoSettings s) {
        return new SeoResponse(s.getMetaTitle(), s.getMetaDescription(), s.getCanonicalUrl(), s.isAllowIndexing(),
                AssetResponse.of(s.getOgImage()), s.getUpdatedAt());
    }
}
