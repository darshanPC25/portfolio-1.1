package com.darshanpc.portfolio.admin;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.darshanpc.portfolio.IntegrationTest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.Map;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

/** Visual editor APIs: draft preview, element formatting, extended appearance. */
@IntegrationTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class EditorApiTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    AdminSession admin;

    @BeforeAll
    void signIn() throws Exception {
        admin = AdminSession.signIn(mvc, json);
    }

    @Test
    void editorEndpointsAreAdminOnly() throws Exception {
        mvc.perform(get("/api/v1/admin/preview")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/v1/admin/element-styles")).andExpect(status().isUnauthorized());
        mvc.perform(put("/api/v1/admin/element-styles/hero.greeting")
                        .contentType(MediaType.APPLICATION_JSON).content("{\"color\":\"#000000\"}"))
                .andExpect(status().isForbidden()); // no session → no CSRF token
    }

    @Test
    void previewShowsTheDraftWhileThePublicSiteKeepsThePublishedVersion() throws Exception {
        Map<String, Object> hero = asMap(admin.get("/api/v1/admin/hero"));
        hero.put("tagline", "Draft tagline from the editor.");
        admin.put("/api/v1/admin/hero", hero).andExpect(status().isOk());

        admin.get("/api/v1/admin/preview")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.version").value(0))
                .andExpect(jsonPath("$.hero.tagline").value("Draft tagline from the editor."))
                // Same shape as the public endpoint (the editor renders the real site from it).
                .andExpect(jsonPath("$.projects.items").isArray())
                .andExpect(jsonPath("$.footer.loginLabel").value("Login"));
        mvc.perform(get("/api/v1/portfolio"))
                .andExpect(jsonPath("$.hero.tagline").value(Matchers.not("Draft tagline from the editor.")));

        admin.post("/api/v1/admin/publications", Map.of("note", "editor test")).andExpect(status().isCreated());
        mvc.perform(get("/api/v1/portfolio")).andExpect(jsonPath("$.hero.tagline").value("Draft tagline from the editor."));
    }

    @Test
    void elementStylesAreValidatedSavedResetAndPublished() throws Exception {
        admin.put("/api/v1/admin/element-styles/hero.role",
                        Map.of("color", "#3A4F25", "fontScale", 1.2, "fontWeight", 600, "textAlign", "center", "fontFamily", "serif"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.color").value("#3a4f25"))
                .andExpect(jsonPath("$.fontScale").value(1.2));

        admin.get("/api/v1/admin/element-styles").andExpect(jsonPath("$['hero.role'].fontWeight").value(600));
        admin.get("/api/v1/admin/preview").andExpect(jsonPath("$.styles['hero.role'].textAlign").value("center"));

        // Validation
        admin.put("/api/v1/admin/element-styles/hero.role", Map.of("color", "red"))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.color").exists());
        admin.put("/api/v1/admin/element-styles/hero.role", Map.of("fontScale", 3))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.fontScale").exists());
        admin.put("/api/v1/admin/element-styles/hero.role", Map.of("fontWeight", 450))
                .andExpect(status().isBadRequest());
        admin.put("/api/v1/admin/element-styles/hero.role", Map.of("textAlign", "justify"))
                .andExpect(status().isBadRequest());
        admin.put("/api/v1/admin/element-styles/{key}", Map.of("color", "#000000"), "Bad Key!")
                .andExpect(status().isBadRequest());

        // Published with the snapshot.
        admin.post("/api/v1/admin/publications", Map.of()).andExpect(status().isCreated());
        mvc.perform(get("/api/v1/portfolio")).andExpect(jsonPath("$.styles['hero.role'].fontFamily").value("serif"));

        // All-empty body resets; DELETE also resets.
        admin.put("/api/v1/admin/element-styles/hero.role", Map.of()).andExpect(status().isNoContent());
        admin.get("/api/v1/admin/element-styles").andExpect(jsonPath("$['hero.role']").doesNotExist());
        admin.put("/api/v1/admin/element-styles/section.about.heading", Map.of("textAlign", "end")).andExpect(status().isOk());
        admin.delete("/api/v1/admin/element-styles/section.about.heading").andExpect(status().isNoContent());
        admin.get("/api/v1/admin/element-styles").andExpect(jsonPath("$['section.about.heading']").doesNotExist());
    }

    @Test
    void appearanceSupportsCustomColoursFontsAndCorners() throws Exception {
        Map<String, Object> appearance = asMap(admin.get("/api/v1/admin/appearance"));
        appearance.put("backgroundColor", "#F4EFE2");
        appearance.put("textColor", "#1F2A18");
        appearance.put("bodyFont", "SERIF");
        appearance.put("cornerStyle", "ROUND");
        admin.put("/api/v1/admin/appearance", appearance)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.backgroundColor").value("#f4efe2"))
                .andExpect(jsonPath("$.cornerStyle").value("ROUND"));

        admin.get("/api/v1/admin/preview")
                .andExpect(jsonPath("$.appearance.textColor").value("#1f2a18"))
                .andExpect(jsonPath("$.appearance.bodyFont").value("serif"))
                .andExpect(jsonPath("$.appearance.cornerStyle").value("round"));

        appearance.put("textColor", "dark green");
        admin.put("/api/v1/admin/appearance", appearance)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.textColor").exists());

        // Clearing the custom background falls back to the preset.
        appearance.put("textColor", "");
        appearance.put("backgroundColor", "");
        admin.put("/api/v1/admin/appearance", appearance)
                .andExpect(jsonPath("$.backgroundColor").doesNotExist())
                .andExpect(jsonPath("$.textColor").doesNotExist());
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(org.springframework.test.web.servlet.ResultActions actions) throws Exception {
        return new HashMap<>(json.convertValue(admin.body(actions.andExpect(status().isOk())), Map.class));
    }
}
