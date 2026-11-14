package com.darshanpc.portfolio.admin.overview;

import com.darshanpc.portfolio.entity.PortfolioPublication;
import com.darshanpc.portfolio.entity.enums.ContactMessageStatus;
import com.darshanpc.portfolio.repository.ContactMessageRepository;
import com.darshanpc.portfolio.repository.DraftStateRepository;
import com.darshanpc.portfolio.repository.PortfolioPublicationRepository;
import com.darshanpc.portfolio.repository.PortfolioSectionRepository;
import com.darshanpc.portfolio.repository.ProjectRepository;
import com.darshanpc.portfolio.repository.SkillCategoryRepository;
import com.darshanpc.portfolio.repository.SkillRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Dashboard numbers, all counted live from the database. */
@RestController
@RequestMapping("/api/v1/admin/overview")
@RequiredArgsConstructor
@Tag(name = "Studio: overview")
public class OverviewController {

    private final ProjectRepository projects;
    private final SkillRepository skills;
    private final SkillCategoryRepository skillCategories;
    private final PortfolioSectionRepository sections;
    private final ContactMessageRepository messages;
    private final DraftStateRepository draftState;
    private final PortfolioPublicationRepository publications;

    public record Counts(long total, long published) {
    }

    public record SectionCounts(long visible, long hidden) {
    }

    public record MessageCounts(long total, long unread) {
    }

    public record LastPublication(int version, Instant publishedAt) {
    }

    public record OverviewResponse(
            Counts projects,
            long skills,
            long skillCategories,
            SectionCounts sections,
            MessageCounts messages,
            Instant draftLastChangedAt,
            LastPublication lastPublication,
            boolean hasUnpublishedChanges) {
    }

    @GetMapping
    @Transactional(readOnly = true)
    @Operation(summary = "Counts, last change and publication status")
    public OverviewResponse overview() {
        Instant draftChanged = draftState.lastModifiedAt();
        LastPublication last = publications.findLatestVersionNumber()
                .flatMap(publications::findByVersionNumber)
                .map((PortfolioPublication p) -> new LastPublication(p.getVersionNumber(), p.getPublishedAt()))
                .orElse(null);
        boolean unpublished = last == null || (draftChanged != null && draftChanged.isAfter(last.publishedAt()));

        return new OverviewResponse(
                new Counts(projects.count(), projects.countByVisibleTrue()),
                skills.count(),
                skillCategories.count(),
                new SectionCounts(sections.countByVisible(true), sections.countByVisible(false)),
                new MessageCounts(messages.count(), messages.countByStatus(ContactMessageStatus.NEW)),
                draftChanged,
                last,
                unpublished);
    }
}
