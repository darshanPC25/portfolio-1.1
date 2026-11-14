package com.darshanpc.portfolio.admin.projects;

import com.darshanpc.portfolio.admin.projects.ProjectAdminDtos.ProjectRequest;
import com.darshanpc.portfolio.admin.projects.ProjectAdminDtos.ProjectResponse;
import com.darshanpc.portfolio.admin.support.AdminSupport;
import com.darshanpc.portfolio.admin.support.AdminSupport.AssetResponse;
import com.darshanpc.portfolio.entity.Project;
import com.darshanpc.portfolio.entity.enums.AssetKind;
import com.darshanpc.portfolio.exception.ConflictException;
import com.darshanpc.portfolio.exception.ResourceNotFoundException;
import com.darshanpc.portfolio.repository.ProjectRepository;
import com.darshanpc.portfolio.service.DraftChangeTracker;
import com.darshanpc.portfolio.service.asset.AssetStorageService;
import com.darshanpc.portfolio.util.Texts;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ProjectAdminService {

    private final ProjectRepository projects;
    private final AssetStorageService storage;
    private final DraftChangeTracker draftChanges;

    @Transactional(readOnly = true)
    public List<ProjectResponse> list() {
        return projects.findAllByOrderByDisplayOrderAsc().stream().map(ProjectAdminService::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse get(UUID id) {
        return toResponse(find(id));
    }

    @Transactional
    public ProjectResponse create(ProjectRequest request) {
        Project project = new Project();
        project.setSlug(uniqueSlug(request, null));
        apply(project, request);
        project.setDisplayOrder(projects.maxDisplayOrder() + 1);
        projects.save(project);
        draftChanges.markChanged();
        return toResponse(project);
    }

    @Transactional
    public ProjectResponse update(UUID id, ProjectRequest request) {
        Project project = find(id);
        project.setSlug(uniqueSlug(request, project));
        apply(project, request);
        draftChanges.markChanged();
        return toResponse(project);
    }

    @Transactional
    public void delete(UUID id) {
        projects.delete(find(id));
        draftChanges.markChanged();
    }

    @Transactional
    public List<ProjectResponse> reorder(List<UUID> ids) {
        AdminSupport.reorder(projects.findAllByOrderByDisplayOrderAsc(), ids, Project::setDisplayOrder);
        draftChanges.markChanged();
        return list();
    }

    @Transactional
    public ProjectResponse setVisible(UUID id, boolean visible) {
        Project project = find(id);
        project.setVisible(visible);
        draftChanges.markChanged();
        return toResponse(project);
    }

    @Transactional
    public ProjectResponse replaceImage(UUID id, MultipartFile file) {
        Project project = find(id);
        project.setImage(storage.store(file, AssetKind.IMAGE, project.getImageAlt()));
        draftChanges.markChanged();
        return toResponse(project);
    }

    private void apply(Project project, ProjectRequest r) {
        project.setName(r.name());
        project.setSummary(r.summary());
        project.setDescription(r.description());
        project.getHighlights().clear();
        project.getHighlights().addAll(r.highlights());
        project.getTags().clear();
        project.getTags().addAll(r.tags());
        project.setImageAlt(r.imageAlt());
        project.setStatus(r.status());
        project.setRepoUrl(r.repoUrl());
        project.setDemoUrl(r.demoUrl());
        project.setFeatured(r.featured());
        project.setVisible(r.visible());
    }

    /**
     * An explicit slug must be free. A generated one gets a numeric suffix if
     * needed. Editing a project without a slug keeps its current one.
     */
    private String uniqueSlug(ProjectRequest request, Project existing) {
        if (request.slug() != null) {
            boolean taken = existing == null
                    ? projects.existsBySlug(request.slug())
                    : projects.existsBySlugAndIdNot(request.slug(), existing.getId());
            if (taken) {
                throw new ConflictException("Another project already uses this slug.", "slug");
            }
            return request.slug();
        }
        if (existing != null) {
            return existing.getSlug();
        }
        String base = Texts.slugify(request.name());
        String candidate = base;
        for (int n = 2; projects.existsBySlug(candidate); n++) {
            candidate = base + "-" + n;
        }
        return candidate;
    }

    private Project find(UUID id) {
        return projects.findById(id).orElseThrow(() -> new ResourceNotFoundException("Project", id.toString()));
    }

    private static ProjectResponse toResponse(Project p) {
        return new ProjectResponse(p.getId(), p.getSlug(), p.getName(), p.getSummary(), p.getDescription(),
                List.copyOf(p.getHighlights()), List.copyOf(p.getTags()), AssetResponse.of(p.getImage()),
                p.getImageAlt(), p.getStatus(), p.getRepoUrl(), p.getDemoUrl(), p.isFeatured(), p.isVisible(),
                p.getDisplayOrder(), p.getUpdatedAt());
    }
}
