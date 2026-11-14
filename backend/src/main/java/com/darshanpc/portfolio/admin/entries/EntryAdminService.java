package com.darshanpc.portfolio.admin.entries;

import com.darshanpc.portfolio.admin.entries.EntryAdminDtos.EducationRequest;
import com.darshanpc.portfolio.admin.entries.EntryAdminDtos.EducationResponse;
import com.darshanpc.portfolio.admin.entries.EntryAdminDtos.ExperienceRequest;
import com.darshanpc.portfolio.admin.entries.EntryAdminDtos.ExperienceResponse;
import com.darshanpc.portfolio.admin.entries.EntryAdminDtos.SocialLinkRequest;
import com.darshanpc.portfolio.admin.entries.EntryAdminDtos.SocialLinkResponse;
import com.darshanpc.portfolio.admin.support.AdminSupport;
import com.darshanpc.portfolio.entity.Education;
import com.darshanpc.portfolio.entity.Experience;
import com.darshanpc.portfolio.entity.SocialLink;
import com.darshanpc.portfolio.entity.enums.SocialPlatform;
import com.darshanpc.portfolio.exception.BadRequestException;
import com.darshanpc.portfolio.exception.ResourceNotFoundException;
import com.darshanpc.portfolio.repository.EducationRepository;
import com.darshanpc.portfolio.repository.ExperienceRepository;
import com.darshanpc.portfolio.repository.SocialLinkRepository;
import com.darshanpc.portfolio.service.DraftChangeTracker;
import com.darshanpc.portfolio.validation.WebUrlValidator;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EntryAdminService {

    private static final Pattern EMAIL = Pattern.compile("^[^@\\s:/]+@[^@\\s:/]+\\.[^@\\s:/]+$");

    private final ExperienceRepository experiences;
    private final EducationRepository educations;
    private final SocialLinkRepository socialLinks;
    private final DraftChangeTracker draftChanges;

    // ---------------------------------------------------------- Experience

    @Transactional(readOnly = true)
    public List<ExperienceResponse> experiences() {
        return experiences.findAllByOrderByDisplayOrderAsc().stream().map(EntryAdminService::toResponse).toList();
    }

    @Transactional
    public ExperienceResponse createExperience(ExperienceRequest request) {
        Experience entry = new Experience();
        apply(entry, request);
        entry.setDisplayOrder(experiences.maxDisplayOrder() + 1);
        experiences.save(entry);
        draftChanges.markChanged();
        return toResponse(entry);
    }

    @Transactional
    public ExperienceResponse updateExperience(UUID id, ExperienceRequest request) {
        Experience entry = experiences.findById(id).orElseThrow(() -> notFound("Experience", id));
        apply(entry, request);
        draftChanges.markChanged();
        return toResponse(entry);
    }

    @Transactional
    public void deleteExperience(UUID id) {
        experiences.delete(experiences.findById(id).orElseThrow(() -> notFound("Experience", id)));
        draftChanges.markChanged();
    }

    @Transactional
    public List<ExperienceResponse> reorderExperiences(List<UUID> ids) {
        AdminSupport.reorder(experiences.findAllByOrderByDisplayOrderAsc(), ids, Experience::setDisplayOrder);
        draftChanges.markChanged();
        return experiences();
    }

    // ----------------------------------------------------------- Education

    @Transactional(readOnly = true)
    public List<EducationResponse> educations() {
        return educations.findAllByOrderByDisplayOrderAsc().stream().map(EntryAdminService::toResponse).toList();
    }

    @Transactional
    public EducationResponse createEducation(EducationRequest request) {
        Education entry = new Education();
        apply(entry, request);
        entry.setDisplayOrder(educations.maxDisplayOrder() + 1);
        educations.save(entry);
        draftChanges.markChanged();
        return toResponse(entry);
    }

    @Transactional
    public EducationResponse updateEducation(UUID id, EducationRequest request) {
        Education entry = educations.findById(id).orElseThrow(() -> notFound("Education", id));
        apply(entry, request);
        draftChanges.markChanged();
        return toResponse(entry);
    }

    @Transactional
    public void deleteEducation(UUID id) {
        educations.delete(educations.findById(id).orElseThrow(() -> notFound("Education", id)));
        draftChanges.markChanged();
    }

    @Transactional
    public List<EducationResponse> reorderEducations(List<UUID> ids) {
        AdminSupport.reorder(educations.findAllByOrderByDisplayOrderAsc(), ids, Education::setDisplayOrder);
        draftChanges.markChanged();
        return educations();
    }

    // -------------------------------------------------------- Social links

    @Transactional(readOnly = true)
    public List<SocialLinkResponse> socialLinks() {
        return socialLinks.findAllByOrderByDisplayOrderAsc().stream().map(EntryAdminService::toResponse).toList();
    }

    @Transactional
    public SocialLinkResponse createSocialLink(SocialLinkRequest request) {
        SocialLink link = new SocialLink();
        apply(link, request);
        link.setDisplayOrder(socialLinks.maxDisplayOrder() + 1);
        socialLinks.save(link);
        draftChanges.markChanged();
        return toResponse(link);
    }

    @Transactional
    public SocialLinkResponse updateSocialLink(UUID id, SocialLinkRequest request) {
        SocialLink link = socialLinks.findById(id).orElseThrow(() -> notFound("Social link", id));
        apply(link, request);
        draftChanges.markChanged();
        return toResponse(link);
    }

    @Transactional
    public void deleteSocialLink(UUID id) {
        socialLinks.delete(socialLinks.findById(id).orElseThrow(() -> notFound("Social link", id)));
        draftChanges.markChanged();
    }

    @Transactional
    public List<SocialLinkResponse> reorderSocialLinks(List<UUID> ids) {
        AdminSupport.reorder(socialLinks.findAllByOrderByDisplayOrderAsc(), ids, SocialLink::setDisplayOrder);
        draftChanges.markChanged();
        return socialLinks();
    }

    // ------------------------------------------------------------- Helpers

    private static void apply(Experience e, ExperienceRequest r) {
        if (r.startDate() != null && r.endDate() != null && r.endDate().isBefore(r.startDate())) {
            throw new BadRequestException("The end date must be on or after the start date.", "endDate");
        }
        e.setPeriodLabel(r.period());
        e.setTitle(r.title());
        e.setOrganisation(r.organisation());
        e.setDescription(r.description());
        e.setStartDate(r.startDate());
        e.setEndDate(r.endDate());
        e.setVisible(r.visible());
    }

    private static void apply(Education e, EducationRequest r) {
        e.setDegree(r.degree());
        e.setFieldOfStudy(r.field());
        e.setInstitution(r.institution());
        e.setPeriodLabel(r.period());
        e.setDescription(r.description());
        e.setVisible(r.visible());
    }

    private static void apply(SocialLink link, SocialLinkRequest r) {
        link.setPlatform(r.platform());
        link.setLabel(r.label());
        link.setUrl(normaliseUrl(r.platform(), r.url()));
        link.setVisible(r.visible());
    }

    /** Email links become {@code mailto:}; everything else must be an http(s) address. */
    static String normaliseUrl(SocialPlatform platform, String url) {
        if (url == null) {
            return null;
        }
        if (platform == SocialPlatform.EMAIL) {
            String address = url.regionMatches(true, 0, "mailto:", 0, 7) ? url.substring(7) : url;
            if (!EMAIL.matcher(address).matches()) {
                throw new BadRequestException("Enter a valid email address.", "url");
            }
            return "mailto:" + address;
        }
        if (!WebUrlValidator.isWebUrl(url)) {
            throw new BadRequestException("Enter a full web address starting with https:// or http://.", "url");
        }
        return url;
    }

    private static ResourceNotFoundException notFound(String what, UUID id) {
        return new ResourceNotFoundException(what, id.toString());
    }

    private static ExperienceResponse toResponse(Experience e) {
        return new ExperienceResponse(e.getId(), e.getPeriodLabel(), e.getTitle(), e.getOrganisation(),
                e.getDescription(), e.getStartDate(), e.getEndDate(), e.isVisible(), e.getDisplayOrder(),
                e.getUpdatedAt());
    }

    private static EducationResponse toResponse(Education e) {
        return new EducationResponse(e.getId(), e.getDegree(), e.getFieldOfStudy(), e.getInstitution(),
                e.getPeriodLabel(), e.getDescription(), e.isVisible(), e.getDisplayOrder(), e.getUpdatedAt());
    }

    private static SocialLinkResponse toResponse(SocialLink s) {
        return new SocialLinkResponse(s.getId(), s.getPlatform(), s.getLabel(), s.getUrl(), s.isVisible(),
                s.getDisplayOrder(), s.getUpdatedAt());
    }
}
