package com.darshanpc.portfolio.service;

import com.darshanpc.portfolio.dto.portfolio.PortfolioResponse;
import com.darshanpc.portfolio.exception.ContentNotPublishedException;
import com.darshanpc.portfolio.exception.ResourceNotFoundException;
import com.darshanpc.portfolio.repository.PortfolioPublicationRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Objects;
import java.util.function.Function;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Read side of the public API. Everything comes from the latest publication,
 * never from the draft tables, so visitors only ever see published content.
 *
 * <p>The parsed snapshot is cached in memory and reused until a newer version
 * number appears, which is a single indexed {@code max()} query per request.
 */
@Service
@RequiredArgsConstructor
public class PublishedPortfolioService {

    private final PortfolioPublicationRepository publications;
    private final ObjectMapper objectMapper;

    private record Cached(int version, PortfolioResponse content, String json) {
    }

    private volatile Cached cache;

    @Transactional(readOnly = true)
    public PortfolioResponse current() {
        return load().content();
    }

    /** True when the latest publication uses the uploaded file with this id. */
    @Transactional(readOnly = true)
    public boolean referencesAsset(java.util.UUID assetId) {
        if (publications.findLatestVersionNumber().isEmpty()) {
            return false;
        }
        return load().json().contains("/api/v1/assets/" + assetId);
    }

    private Cached load() {
        int latest = publications.findLatestVersionNumber().orElseThrow(ContentNotPublishedException::new);
        Cached cached = cache;
        if (cached != null && cached.version() == latest) {
            return cached;
        }
        String json = publications.findByVersionNumber(latest)
                .orElseThrow(ContentNotPublishedException::new)
                .getSnapshot();
        Cached loaded = new Cached(latest, parse(json), json);
        cache = loaded;
        return loaded;
    }

    public PortfolioResponse.Profile profile() {
        return current().profile();
    }

    public List<PortfolioResponse.ProjectItem> projects() {
        return listOf(current().projects(), PortfolioResponse.ProjectsSection::items);
    }

    /** Finds a published project by its id or its slug. */
    public PortfolioResponse.ProjectItem project(String idOrSlug) {
        return projects().stream()
                .filter(p -> p.id().equalsIgnoreCase(idOrSlug) || p.slug().equals(idOrSlug))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Project", idOrSlug));
    }

    public List<PortfolioResponse.SkillGroup> skills() {
        return listOf(current().skills(), PortfolioResponse.SkillsSection::groups);
    }

    public List<PortfolioResponse.JourneyEntry> experience() {
        return listOf(current().journey(), PortfolioResponse.JourneySection::entries);
    }

    public List<PortfolioResponse.EducationEntry> education() {
        return listOf(current().education(), PortfolioResponse.EducationSection::entries);
    }

    public List<PortfolioResponse.SocialLinkItem> socialLinks() {
        return Objects.requireNonNullElse(current().socialLinks(), List.of());
    }

    /** Items of a section, or an empty list when the section is hidden. */
    private static <S, T> List<T> listOf(S section, Function<S, List<T>> items) {
        return section == null ? List.of() : Objects.requireNonNullElse(items.apply(section), List.of());
    }

    private PortfolioResponse parse(String json) {
        try {
            return objectMapper.readValue(json, PortfolioResponse.class);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Stored portfolio snapshot could not be read", e);
        }
    }
}
