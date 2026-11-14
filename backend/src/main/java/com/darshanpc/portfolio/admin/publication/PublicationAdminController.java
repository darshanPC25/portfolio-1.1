package com.darshanpc.portfolio.admin.publication;

import com.darshanpc.portfolio.entity.AdminUser;
import com.darshanpc.portfolio.entity.PortfolioPublication;
import com.darshanpc.portfolio.repository.AdminUserRepository;
import com.darshanpc.portfolio.repository.PortfolioPublicationRepository;
import com.darshanpc.portfolio.security.AdminPrincipal;
import com.darshanpc.portfolio.service.publication.PublicationService;
import com.darshanpc.portfolio.util.Texts;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Publishing: makes the current draft the live site, and lists past publications. */
@RestController
@RequestMapping("/api/v1/admin/publications")
@RequiredArgsConstructor
@Tag(name = "Studio: publishing")
public class PublicationAdminController {

    private final PublicationService publicationService;
    private final PortfolioPublicationRepository publications;
    private final AdminUserRepository admins;

    public record PublishRequest(@Size(max = 200) String note) {
    }

    public record PublicationResponse(int version, Instant publishedAt, String note, String publishedBy) {
    }

    @GetMapping
    @Transactional(readOnly = true)
    @Operation(summary = "The 20 most recent publications")
    public List<PublicationResponse> list() {
        return publications.findTop20ByOrderByVersionNumberDesc().stream()
                .map(PublicationAdminController::toResponse)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    @Operation(summary = "Publish the current draft to the live site")
    public PublicationResponse publish(
            @AuthenticationPrincipal AdminPrincipal principal, @Valid @RequestBody(required = false) PublishRequest body) {
        AdminUser admin = admins.getReferenceById(principal.id());
        String note = body == null ? null : Texts.blankToNull(body.note());
        PortfolioPublication publication = publicationService.publish(note, admin);
        return new PublicationResponse(
                publication.getVersionNumber(), publication.getPublishedAt(), publication.getNote(),
                principal.displayName());
    }

    private static PublicationResponse toResponse(PortfolioPublication p) {
        return new PublicationResponse(p.getVersionNumber(), p.getPublishedAt(), p.getNote(),
                p.getPublishedBy() == null ? null : p.getPublishedBy().getDisplayName());
    }
}
