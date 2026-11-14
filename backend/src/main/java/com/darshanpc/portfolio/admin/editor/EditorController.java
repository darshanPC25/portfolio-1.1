package com.darshanpc.portfolio.admin.editor;

import com.darshanpc.portfolio.dto.portfolio.PortfolioResponse;
import com.darshanpc.portfolio.service.publication.PortfolioSnapshotAssembler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Clock;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Endpoints used by the visual website editor. Administrator only (see SecurityConfig). */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@Tag(name = "Studio: visual editor")
public class EditorController {

    private final PortfolioSnapshotAssembler assembler;
    private final ElementStyleAdminService styles;
    private final Clock clock;

    /**
     * The current draft in exactly the shape visitors receive after publishing
     * (version 0 marks a draft). The editor renders the real site from it.
     */
    @GetMapping("/preview")
    @Operation(summary = "Draft portfolio, as it would look if published now")
    public PortfolioResponse preview() {
        return assembler.assemble(0, clock.instant());
    }

    @GetMapping("/element-styles")
    @Operation(summary = "Draft formatting of individual elements, keyed by editor id")
    public Map<String, PortfolioResponse.ElementStyle> elementStyles() {
        return styles.all();
    }

    @PutMapping("/element-styles/{key}")
    @Operation(summary = "Set the formatting of one element (all fields empty = reset)")
    public ResponseEntity<PortfolioResponse.ElementStyle> putElementStyle(
            @PathVariable String key, @RequestBody ElementStyleAdminService.StyleRequest body) {
        PortfolioResponse.ElementStyle saved = styles.put(key, body);
        return saved == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(saved);
    }

    @DeleteMapping("/element-styles/{key}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Reset the formatting of one element to the design default")
    public void deleteElementStyle(@PathVariable String key) {
        styles.delete(key);
    }
}
