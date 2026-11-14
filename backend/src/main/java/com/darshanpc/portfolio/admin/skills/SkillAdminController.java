package com.darshanpc.portfolio.admin.skills;

import com.darshanpc.portfolio.admin.skills.SkillAdminDtos.CategoryRequest;
import com.darshanpc.portfolio.admin.skills.SkillAdminDtos.CategoryResponse;
import com.darshanpc.portfolio.admin.skills.SkillAdminDtos.SkillRequest;
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
@Tag(name = "Studio: skills")
public class SkillAdminController {

    private final SkillAdminService service;

    @GetMapping("/skill-categories")
    public List<CategoryResponse> list() {
        return service.list();
    }

    @PostMapping("/skill-categories")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse createCategory(@Valid @RequestBody CategoryRequest body) {
        return service.createCategory(body);
    }

    @PutMapping("/skill-categories/{id}")
    public CategoryResponse updateCategory(@PathVariable UUID id, @Valid @RequestBody CategoryRequest body) {
        return service.updateCategory(id, body);
    }

    @DeleteMapping("/skill-categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable UUID id) {
        service.deleteCategory(id);
    }

    @PutMapping("/skill-categories/order")
    public List<CategoryResponse> reorderCategories(@Valid @RequestBody ReorderRequest body) {
        return service.reorderCategories(body.ids());
    }

    @PostMapping("/skill-categories/{id}/skills")
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse createSkill(@PathVariable UUID id, @Valid @RequestBody SkillRequest body) {
        return service.createSkill(id, body);
    }

    @PutMapping("/skill-categories/{id}/skills/order")
    public CategoryResponse reorderSkills(@PathVariable UUID id, @Valid @RequestBody ReorderRequest body) {
        return service.reorderSkills(id, body.ids());
    }

    @PutMapping("/skills/{id}")
    public List<CategoryResponse> updateSkill(@PathVariable UUID id, @Valid @RequestBody SkillRequest body) {
        return service.updateSkill(id, body);
    }

    @DeleteMapping("/skills/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSkill(@PathVariable UUID id) {
        service.deleteSkill(id);
    }
}
