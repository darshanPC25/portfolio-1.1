package com.darshanpc.portfolio.controller;

import com.darshanpc.portfolio.dto.portfolio.PortfolioResponse;
import com.darshanpc.portfolio.service.PublishedPortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Read-only public endpoints. All responses come from the latest published snapshot.
 *
 * <p>Every response carries the publication version as its ETag and
 * {@code Cache-Control: no-cache}: browsers and proxies keep a copy but check it
 * on each visit, getting a body-less 304 until something new is published. A
 * publish is therefore visible on the next page load, with no redeploy.
 */
@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Public portfolio", description = "Published portfolio content")
public class PublicPortfolioController {

    private final PublishedPortfolioService portfolio;

    @GetMapping("/portfolio")
    @Operation(summary = "The complete published portfolio (used by the website)")
    public ResponseEntity<PortfolioResponse> portfolio() {
        return cached(portfolio::current);
    }

    @GetMapping("/profile")
    @Operation(summary = "Published profile")
    public ResponseEntity<PortfolioResponse.Profile> profile() {
        return cached(portfolio::profile);
    }

    @GetMapping("/projects")
    @Operation(summary = "Published projects in display order")
    public ResponseEntity<List<PortfolioResponse.ProjectItem>> projects() {
        return cached(portfolio::projects);
    }

    @GetMapping("/projects/{id}")
    @Operation(summary = "One published project, by id or slug")
    public ResponseEntity<PortfolioResponse.ProjectItem> project(@PathVariable String id) {
        return cached(() -> portfolio.project(id));
    }

    @GetMapping("/skills")
    @Operation(summary = "Published skill groups in display order")
    public ResponseEntity<List<PortfolioResponse.SkillGroup>> skills() {
        return cached(portfolio::skills);
    }

    @GetMapping("/experience")
    @Operation(summary = "Published professional journey entries")
    public ResponseEntity<List<PortfolioResponse.JourneyEntry>> experience() {
        return cached(portfolio::experience);
    }

    @GetMapping("/education")
    @Operation(summary = "Published education entries")
    public ResponseEntity<List<PortfolioResponse.EducationEntry>> education() {
        return cached(portfolio::education);
    }

    @GetMapping("/social-links")
    @Operation(summary = "Published social links that have a URL")
    public ResponseEntity<List<PortfolioResponse.SocialLinkItem>> socialLinks() {
        return cached(portfolio::socialLinks);
    }

    /**
     * Wraps a body with the version ETag. Spring answers 304 Not Modified by
     * itself when the request's If-None-Match matches.
     */
    private <T> ResponseEntity<T> cached(Supplier<T> body) {
        int version = portfolio.currentVersion();
        return ResponseEntity.ok()
                // Weak validator: Tomcat does not gzip responses that carry a strong ETag.
                .eTag("W/\"v" + version + "\"")
                .cacheControl(CacheControl.noCache().cachePublic())
                .body(body.get());
    }
}
