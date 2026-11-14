package com.darshanpc.portfolio.admin.skills;

import com.darshanpc.portfolio.admin.skills.SkillAdminDtos.CategoryRequest;
import com.darshanpc.portfolio.admin.skills.SkillAdminDtos.CategoryResponse;
import com.darshanpc.portfolio.admin.skills.SkillAdminDtos.SkillRequest;
import com.darshanpc.portfolio.admin.skills.SkillAdminDtos.SkillResponse;
import com.darshanpc.portfolio.admin.support.AdminSupport;
import com.darshanpc.portfolio.entity.Skill;
import com.darshanpc.portfolio.entity.SkillCategory;
import com.darshanpc.portfolio.exception.ConflictException;
import com.darshanpc.portfolio.exception.ResourceNotFoundException;
import com.darshanpc.portfolio.repository.SkillCategoryRepository;
import com.darshanpc.portfolio.repository.SkillRepository;
import com.darshanpc.portfolio.service.DraftChangeTracker;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SkillAdminService {

    private final SkillCategoryRepository categories;
    private final SkillRepository skills;
    private final DraftChangeTracker draftChanges;

    @Transactional(readOnly = true)
    public List<CategoryResponse> list() {
        return categories.findAllByOrderByDisplayOrderAsc().stream().map(SkillAdminService::toResponse).toList();
    }

    // ---------------------------------------------------------- Categories

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        SkillCategory category = new SkillCategory();
        applyCategory(category, request);
        category.setDisplayOrder(categories.maxDisplayOrder() + 1);
        categories.save(category);
        draftChanges.markChanged();
        return toResponse(category);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID id, CategoryRequest request) {
        SkillCategory category = findCategory(id);
        applyCategory(category, request);
        draftChanges.markChanged();
        return toResponse(category);
    }

    /** Deletes the category and every skill in it. */
    @Transactional
    public void deleteCategory(UUID id) {
        categories.delete(findCategory(id));
        draftChanges.markChanged();
    }

    @Transactional
    public List<CategoryResponse> reorderCategories(List<UUID> ids) {
        AdminSupport.reorder(categories.findAllByOrderByDisplayOrderAsc(), ids, SkillCategory::setDisplayOrder);
        draftChanges.markChanged();
        return list();
    }

    // -------------------------------------------------------------- Skills

    @Transactional
    public CategoryResponse createSkill(UUID categoryId, SkillRequest request) {
        SkillCategory category = findCategory(categoryId);
        if (skills.existsByCategoryIdAndNameIgnoreCase(categoryId, request.name())) {
            throw duplicate();
        }
        Skill skill = new Skill();
        skill.setCategory(category);
        skill.setName(request.name());
        skill.setVisible(request.visible());
        skill.setDisplayOrder(skills.maxDisplayOrder(categoryId) + 1);
        category.getSkills().add(skill);
        skills.save(skill);
        draftChanges.markChanged();
        return toResponse(category);
    }

    /** Renames, shows/hides, or moves a skill to another category (appended at the end). */
    @Transactional
    public List<CategoryResponse> updateSkill(UUID id, SkillRequest request) {
        Skill skill = skills.findById(id).orElseThrow(() -> new ResourceNotFoundException("Skill", id.toString()));
        SkillCategory target = request.categoryId() == null ? skill.getCategory() : findCategory(request.categoryId());
        if (skills.existsByCategoryIdAndNameIgnoreCaseAndIdNot(target.getId(), request.name(), id)) {
            throw duplicate();
        }
        if (!target.getId().equals(skill.getCategory().getId())) {
            skill.getCategory().getSkills().remove(skill);
            skill.setDisplayOrder(skills.maxDisplayOrder(target.getId()) + 1);
            skill.setCategory(target);
            target.getSkills().add(skill);
        }
        skill.setName(request.name());
        skill.setVisible(request.visible());
        draftChanges.markChanged();
        return list();
    }

    @Transactional
    public void deleteSkill(UUID id) {
        Skill skill = skills.findById(id).orElseThrow(() -> new ResourceNotFoundException("Skill", id.toString()));
        skill.getCategory().getSkills().remove(skill);
        skills.delete(skill);
        draftChanges.markChanged();
    }

    @Transactional
    public CategoryResponse reorderSkills(UUID categoryId, List<UUID> ids) {
        SkillCategory category = findCategory(categoryId);
        AdminSupport.reorder(category.getSkills(), ids, Skill::setDisplayOrder);
        draftChanges.markChanged();
        category.getSkills().sort(java.util.Comparator.comparingInt(Skill::getDisplayOrder));
        return toResponse(category);
    }

    private void applyCategory(SkillCategory category, CategoryRequest request) {
        category.setTitle(request.title());
        category.setIcon(request.icon());
        category.setDescription(request.description());
        category.setVisible(request.visible());
    }

    private SkillCategory findCategory(UUID id) {
        return categories.findById(id).orElseThrow(() -> new ResourceNotFoundException("Skill category", id.toString()));
    }

    private static ConflictException duplicate() {
        return new ConflictException("This category already has a skill with that name.", "name");
    }

    private static CategoryResponse toResponse(SkillCategory c) {
        return new CategoryResponse(c.getId(), c.getTitle(), c.getIcon(), c.getDescription(), c.isVisible(),
                c.getDisplayOrder(),
                c.getSkills().stream()
                        .sorted(java.util.Comparator.comparingInt(Skill::getDisplayOrder))
                        .map(s -> new SkillResponse(s.getId(), s.getName(), s.isVisible(), s.getDisplayOrder()))
                        .toList());
    }
}
