package com.darshanpc.portfolio.controller;

import com.darshanpc.portfolio.service.github.GitHubActivity;
import com.darshanpc.portfolio.service.github.GitHubActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/github")
@RequiredArgsConstructor
@Tag(name = "Public portfolio")
public class GitHubController {

    private final GitHubActivityService service;

    @GetMapping
    @Operation(summary = "Public GitHub activity for the published GitHub username (cached)")
    public ResponseEntity<GitHubActivity> activity() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofMinutes(10)).cachePublic())
                .body(service.activity());
    }
}
