package com.darshanpc.portfolio.controller;

import com.darshanpc.portfolio.dto.portfolio.PortfolioResponse;
import com.darshanpc.portfolio.service.PublishedPortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Read-only public endpoints. All responses come from the latest published snapshot. */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Public portfolio", description = "Published portfolio content")
public class PublicPortfolioController {

    private final PublishedPortfolioService portfolio;

    @GetMapping("/portfolio")
    @Operation(summary = "The complete published portfolio (used by the website)")
    public PortfolioResponse portfolio() {
        return portfolio.current();
    }

    @GetMapping("/profile")
    @Operation(summary = "Published profile")
    public PortfolioResponse.Profile profile() {
        return portfolio.profile();
    }

    @GetMapping("/projects")
    @Operation(summary = "Published projects in display order")
    public List<PortfolioResponse.ProjectItem> projects() {
        return portfolio.projects();
    }

    @GetMapping("/projects/{id}")
    @Operation(summary = "One published project, by id or slug")
    public PortfolioResponse.ProjectItem project(@PathVariable String id) {
        return portfolio.project(id);
    }

    @GetMapping("/skills")
    @Operation(summary = "Published skill groups in display order")
    public List<PortfolioResponse.SkillGroup> skills() {
        return portfolio.skills();
    }

    @GetMapping("/experience")
    @Operation(summary = "Published professional journey entries")
    public List<PortfolioResponse.JourneyEntry> experience() {
        return portfolio.experience();
    }

    @GetMapping("/education")
    @Operation(summary = "Published education entries")
    public List<PortfolioResponse.EducationEntry> education() {
        return portfolio.education();
    }

    @GetMapping("/social-links")
    @Operation(summary = "Published social links that have a URL")
    public List<PortfolioResponse.SocialLinkItem> socialLinks() {
        return portfolio.socialLinks();
    }
}
