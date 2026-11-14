package com.darshanpc.portfolio.admin.entries;

import com.darshanpc.portfolio.admin.entries.EntryAdminDtos.EducationRequest;
import com.darshanpc.portfolio.admin.entries.EntryAdminDtos.EducationResponse;
import com.darshanpc.portfolio.admin.entries.EntryAdminDtos.ExperienceRequest;
import com.darshanpc.portfolio.admin.entries.EntryAdminDtos.ExperienceResponse;
import com.darshanpc.portfolio.admin.entries.EntryAdminDtos.SocialLinkRequest;
import com.darshanpc.portfolio.admin.entries.EntryAdminDtos.SocialLinkResponse;
import com.darshanpc.portfolio.admin.support.AdminSupport.ReorderRequest;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Studio: experience, education, social links")
public class EntryAdminController {

    private final EntryAdminService service;

    // ---------------------------------------------------------- Experience

    @GetMapping("/experience")
    public List<ExperienceResponse> experiences() {
        return service.experiences();
    }

    @PostMapping("/experience")
    @ResponseStatus(HttpStatus.CREATED)
    public ExperienceResponse createExperience(@Valid @RequestBody ExperienceRequest body) {
        return service.createExperience(body);
    }

    @PutMapping("/experience/{id}")
    public ExperienceResponse updateExperience(@PathVariable UUID id, @Valid @RequestBody ExperienceRequest body) {
        return service.updateExperience(id, body);
    }

    @DeleteMapping("/experience/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExperience(@PathVariable UUID id) {
        service.deleteExperience(id);
    }

    @PutMapping("/experience/order")
    public List<ExperienceResponse> reorderExperiences(@Valid @RequestBody ReorderRequest body) {
        return service.reorderExperiences(body.ids());
    }

    // ----------------------------------------------------------- Education

    @GetMapping("/education")
    public List<EducationResponse> educations() {
        return service.educations();
    }

    @PostMapping("/education")
    @ResponseStatus(HttpStatus.CREATED)
    public EducationResponse createEducation(@Valid @RequestBody EducationRequest body) {
        return service.createEducation(body);
    }

    @PutMapping("/education/{id}")
    public EducationResponse updateEducation(@PathVariable UUID id, @Valid @RequestBody EducationRequest body) {
        return service.updateEducation(id, body);
    }

    @DeleteMapping("/education/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEducation(@PathVariable UUID id) {
        service.deleteEducation(id);
    }

    @PutMapping("/education/order")
    public List<EducationResponse> reorderEducations(@Valid @RequestBody ReorderRequest body) {
        return service.reorderEducations(body.ids());
    }

    // -------------------------------------------------------- Social links

    @GetMapping("/social-links")
    public List<SocialLinkResponse> socialLinks() {
        return service.socialLinks();
    }

    @PostMapping("/social-links")
    @ResponseStatus(HttpStatus.CREATED)
    public SocialLinkResponse createSocialLink(@Valid @RequestBody SocialLinkRequest body) {
        return service.createSocialLink(body);
    }

    @PutMapping("/social-links/{id}")
    public SocialLinkResponse updateSocialLink(@PathVariable UUID id, @Valid @RequestBody SocialLinkRequest body) {
        return service.updateSocialLink(id, body);
    }

    @DeleteMapping("/social-links/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSocialLink(@PathVariable UUID id) {
        service.deleteSocialLink(id);
    }

    @PutMapping("/social-links/order")
    public List<SocialLinkResponse> reorderSocialLinks(@Valid @RequestBody ReorderRequest body) {
        return service.reorderSocialLinks(body.ids());
    }
}
