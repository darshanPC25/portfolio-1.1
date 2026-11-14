package com.darshanpc.portfolio.admin.site;

import com.darshanpc.portfolio.admin.site.SiteAdminDtos.AboutDto;
import com.darshanpc.portfolio.admin.site.SiteAdminDtos.AppearanceDto;
import com.darshanpc.portfolio.admin.site.SiteAdminDtos.HeroDto;
import com.darshanpc.portfolio.admin.site.SiteAdminDtos.SectionOrderRequest;
import com.darshanpc.portfolio.admin.site.SiteAdminDtos.SectionRequest;
import com.darshanpc.portfolio.admin.site.SiteAdminDtos.SectionResponse;
import com.darshanpc.portfolio.admin.site.SiteAdminDtos.SeoRequest;
import com.darshanpc.portfolio.admin.site.SiteAdminDtos.SeoResponse;
import com.darshanpc.portfolio.entity.enums.SectionKey;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Studio: site content")
public class SiteAdminController {

    private final SiteAdminService service;

    @GetMapping("/hero")
    public HeroDto hero() {
        return service.hero();
    }

    @PutMapping("/hero")
    public HeroDto updateHero(@Valid @RequestBody HeroDto body) {
        return service.updateHero(body);
    }

    @GetMapping("/about")
    public AboutDto about() {
        return service.about();
    }

    @PutMapping("/about")
    public AboutDto updateAbout(@Valid @RequestBody AboutDto body) {
        return service.updateAbout(body);
    }

    @GetMapping("/sections")
    public List<SectionResponse> sections() {
        return service.sections();
    }

    @PutMapping("/sections/{key}")
    public SectionResponse updateSection(@PathVariable SectionKey key, @Valid @RequestBody SectionRequest body) {
        return service.updateSection(key, body);
    }

    @PutMapping("/sections/order")
    public List<SectionResponse> reorderSections(@Valid @RequestBody SectionOrderRequest body) {
        return service.reorderSections(body.keys());
    }

    @GetMapping("/appearance")
    public AppearanceDto appearance() {
        return service.appearance();
    }

    @PutMapping("/appearance")
    public AppearanceDto updateAppearance(@Valid @RequestBody AppearanceDto body) {
        return service.updateAppearance(body);
    }

    @GetMapping("/seo")
    public SeoResponse seo() {
        return service.seo();
    }

    @PutMapping("/seo")
    public SeoResponse updateSeo(@Valid @RequestBody SeoRequest body) {
        return service.updateSeo(body);
    }

    @PostMapping(value = "/seo/og-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SeoResponse replaceOgImage(@RequestPart("file") MultipartFile file) {
        return service.replaceOgImage(file);
    }

    @DeleteMapping("/seo/og-image")
    public SeoResponse removeOgImage() {
        return service.removeOgImage();
    }
}
