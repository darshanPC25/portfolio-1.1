package com.darshanpc.portfolio.admin.projects;

import com.darshanpc.portfolio.admin.projects.ProjectAdminDtos.ProjectRequest;
import com.darshanpc.portfolio.admin.projects.ProjectAdminDtos.ProjectResponse;
import com.darshanpc.portfolio.admin.support.AdminSupport.ReorderRequest;
import com.darshanpc.portfolio.admin.support.AdminSupport.VisibilityRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/projects")
@RequiredArgsConstructor
@Tag(name = "Studio: projects")
public class ProjectAdminController {

    private final ProjectAdminService service;

    @GetMapping
    @Operation(summary = "All projects, including unpublished ones, in display order")
    public List<ProjectResponse> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public ProjectResponse get(@PathVariable UUID id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectResponse create(@Valid @RequestBody ProjectRequest body) {
        return service.create(body);
    }

    @PutMapping("/{id}")
    public ProjectResponse update(@PathVariable UUID id, @Valid @RequestBody ProjectRequest body) {
        return service.update(id, body);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }

    @PutMapping("/order")
    @Operation(summary = "Reorder: send every project id, first to last")
    public List<ProjectResponse> reorder(@Valid @RequestBody ReorderRequest body) {
        return service.reorder(body.ids());
    }

    @PatchMapping("/{id}/visibility")
    @Operation(summary = "Publish (show) or unpublish (hide) a project")
    public ProjectResponse visibility(@PathVariable UUID id, @RequestBody VisibilityRequest body) {
        return service.setVisible(id, body.visible());
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Replace the project image (PNG, JPEG or WebP, up to 5 MB)")
    public ProjectResponse image(@PathVariable UUID id, @RequestPart("file") MultipartFile file) {
        return service.replaceImage(id, file);
    }
}
