package com.darshanpc.portfolio.admin.profile;

import com.darshanpc.portfolio.admin.profile.ProfileAdminDtos.ProfileRequest;
import com.darshanpc.portfolio.admin.profile.ProfileAdminDtos.ProfileResponse;
import com.darshanpc.portfolio.admin.profile.ProfileAdminDtos.ResumeResponse;
import com.darshanpc.portfolio.admin.support.AdminSupport.AssetResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Studio: profile and resume")
public class ProfileAdminController {

    private final ProfileAdminService service;

    @GetMapping("/profile")
    public ProfileResponse profile() {
        return service.get();
    }

    @PutMapping("/profile")
    @Operation(summary = "Update profile details (draft)")
    public ProfileResponse update(@Valid @RequestBody ProfileRequest request) {
        return service.update(request);
    }

    @PostMapping(value = "/profile/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Replace the profile photo (PNG, JPEG or WebP, up to 5 MB)")
    public ProfileResponse replacePhoto(@RequestPart("file") MultipartFile file) {
        return service.replacePhoto(file);
    }

    @GetMapping("/resume")
    public ResumeResponse resume() {
        return new ResumeResponse(service.resume());
    }

    @PostMapping(value = "/resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload or replace the resume (PDF, up to 10 MB)")
    public AssetResponse uploadResume(@RequestPart("file") MultipartFile file) {
        return service.replaceResume(file);
    }

    @DeleteMapping("/resume")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Remove the resume from the draft")
    public void removeResume() {
        service.removeResume();
    }
}
