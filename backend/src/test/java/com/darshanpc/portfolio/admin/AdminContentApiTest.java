package com.darshanpc.portfolio.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.darshanpc.portfolio.IntegrationTest;
import com.darshanpc.portfolio.repository.ProjectRepository;
import com.darshanpc.portfolio.repository.SkillRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Every studio operation through the real HTTP API, signed in with a real
 * session and CSRF token. The context is discarded afterwards so other test
 * classes see the original seed data.
 */
@IntegrationTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AdminContentApiTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    @Autowired
    ProjectRepository projects;

    @Autowired
    SkillRepository skills;

    AdminSession admin;

    @BeforeAll
    void signIn() throws Exception {
        admin = AdminSession.signIn(mvc, json);
    }

    // ------------------------------------------------------------- Profile

    @Test
    void profileReadAndUpdate() throws Exception {
        Map<String, Object> profile = asMap(admin.body(admin.get("/api/v1/admin/profile").andExpect(status().isOk())));
        profile.put("location", "Bhubaneswar, India");
        profile.put("githubUsername", "darshan-dev");
        profile.put("publicEmail", "");

        admin.put("/api/v1/admin/profile", profile)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.location").value("Bhubaneswar, India"))
                .andExpect(jsonPath("$.githubUsername").value("darshan-dev"))
                .andExpect(jsonPath("$.publicEmail").doesNotExist());

        profile.put("fullName", "");
        profile.put("githubUsername", "not valid!");
        admin.put("/api/v1/admin/profile", profile)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.fullName").exists())
                .andExpect(jsonPath("$.errors.githubUsername").exists());
    }

    @Test
    void profilePhotoAcceptsImagesAndRefusesSvg() throws Exception {
        admin.upload("/api/v1/admin/profile/photo", png("file"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.photo.contentType").value("image/png"))
                .andExpect(jsonPath("$.photo.width").value(4))
                .andExpect(jsonPath("$.photo.url", startsWith("/api/v1/assets/")));

        MockMultipartFile svg = new MockMultipartFile("file", "x.svg", "image/svg+xml",
                "<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>".getBytes(StandardCharsets.UTF_8));
        admin.upload("/api/v1/admin/profile/photo", svg).andExpect(status().isUnsupportedMediaType());

        // A PNG name and type cannot smuggle in other content.
        MockMultipartFile fake = new MockMultipartFile("file", "photo.png", "image/png", "not an image".getBytes());
        admin.upload("/api/v1/admin/profile/photo", fake).andExpect(status().isUnsupportedMediaType());
    }

    // -------------------------------------------------------------- Resume

    @Test
    void resumeUploadPreviewDownloadReplaceRemove() throws Exception {
        admin.get("/api/v1/admin/resume").andExpect(status().isOk()).andExpect(jsonPath("$.resume").doesNotExist());

        JsonNode resume = admin.body(admin.upload("/api/v1/admin/resume", pdf("resume.pdf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contentType").value("application/pdf"))
                .andExpect(jsonPath("$.filename").value("resume.pdf")));
        String url = resume.get("url").asText();

        // Signed in: preview inline and download as attachment, even before publishing.
        mvc.perform(get(url).session(admin.session()))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Disposition", startsWith("inline")));
        mvc.perform(get(url + "?download=true").session(admin.session()))
                .andExpect(header().string("Content-Disposition", startsWith("attachment")));
        // Visitors cannot see an unpublished file.
        mvc.perform(get(url)).andExpect(status().isNotFound());

        admin.upload("/api/v1/admin/resume", png("file")).andExpect(status().isUnsupportedMediaType());
        admin.upload("/api/v1/admin/resume", pdf("resume-v2.pdf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.filename").value("resume-v2.pdf"));

        admin.delete("/api/v1/admin/resume").andExpect(status().isNoContent());
        admin.get("/api/v1/admin/resume").andExpect(jsonPath("$.resume").doesNotExist());
    }

    // ---------------------------------------------------- Hero, About, SEO

    @Test
    void heroUpdateWithValidation() throws Exception {
        Map<String, Object> hero = asMap(admin.body(admin.get("/api/v1/admin/hero")));
        hero.put("tagline", "Designing dependable APIs.");
        hero.put("focusAreas", List.of("Java", "  ", "Spring Boot"));
        admin.put("/api/v1/admin/hero", hero)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tagline").value("Designing dependable APIs."))
                .andExpect(jsonPath("$.focusAreas", hasSize(2)));

        hero.put("primaryCtaHref", "javascript:alert(1)");
        admin.put("/api/v1/admin/hero", hero)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.primaryCtaHref").exists());
    }

    @Test
    void aboutUpdateReplacesListsInOrder() throws Exception {
        Map<String, Object> about = new HashMap<>();
        about.put("paragraphs", List.of("First paragraph.", "Second paragraph."));
        about.put("facts", List.of(Map.of("label", "Based in", "value", "India")));
        about.put("approachHeading", "How I work");
        about.put("approach", List.of(Map.of("step", "01", "title", "Listen", "description", "Understand first.")));

        admin.put("/api/v1/admin/about", about)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paragraphs[1]").value("Second paragraph."))
                .andExpect(jsonPath("$.facts", hasSize(1)))
                .andExpect(jsonPath("$.approach[0].title").value("Listen"));

        about.put("paragraphs", List.of());
        admin.put("/api/v1/admin/about", about).andExpect(status().isBadRequest());
    }

    @Test
    void sectionsUpdateHideAndReorder() throws Exception {
        JsonNode sections = admin.body(admin.get("/api/v1/admin/sections").andExpect(jsonPath("$", hasSize(7))));
        Map<String, Object> contact = asMap(sections.get(6));
        assertThat(contact.get("key")).isEqualTo("CONTACT");
        contact.put("heading", "Say hello");
        contact.put("settings", Map.of("formHeading", "Write to me", "submitLabel", "Send"));
        admin.put("/api/v1/admin/sections/CONTACT", contact)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.settings.formHeading").value("Write to me"));

        contact.put("settings", Map.of("unknown", "x"));
        admin.put("/api/v1/admin/sections/CONTACT", contact).andExpect(status().isBadRequest());

        List<String> keys = new ArrayList<>();
        sections.forEach(s -> keys.add(s.get("key").asText()));
        java.util.Collections.reverse(keys);
        admin.put("/api/v1/admin/sections/order", Map.of("keys", keys))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].key").value("CONTACT"));
        admin.put("/api/v1/admin/sections/order", Map.of("keys", List.of("ABOUT"))).andExpect(status().isBadRequest());
    }

    @Test
    void appearanceAndSeo() throws Exception {
        admin.put("/api/v1/admin/appearance", Map.of("accentColor", "#5A7A3A", "backgroundStyle", "CREAM",
                        "headingFont", "SERIF", "heroSceneEnabled", false, "motionEnabled", true))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accentColor").value("#5a7a3a"))
                .andExpect(jsonPath("$.headingFont").value("SERIF"));
        admin.put("/api/v1/admin/appearance", Map.of("accentColor", "green", "backgroundStyle", "CREAM",
                        "headingFont", "SERIF", "heroSceneEnabled", false, "motionEnabled", true))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.accentColor").exists());

        admin.put("/api/v1/admin/seo", Map.of("title", "Darshan", "description", "Backend developer.",
                        "canonicalUrl", "https://example.com/", "allowIndexing", false))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowIndexing").value(false));
        admin.put("/api/v1/admin/seo", Map.of("title", "Darshan", "description", "x",
                        "canonicalUrl", "ftp://example.com", "allowIndexing", true))
                .andExpect(status().isBadRequest());
        admin.upload("/api/v1/admin/seo/og-image", png("file"))
                .andExpect(jsonPath("$.ogImage.contentType").value("image/png"));
        admin.delete("/api/v1/admin/seo/og-image").andExpect(jsonPath("$.ogImage").doesNotExist());
    }

    // ------------------------------------------------------------ Projects

    @Test
    void projectFullLifecycle() throws Exception {
        Map<String, Object> request = new HashMap<>(Map.of(
                "name", "Test Project Alpha",
                "summary", "A short summary.",
                "description", "A longer description.",
                "highlights", List.of("One", "Two"),
                "tags", List.of("Java"),
                "imageAlt", "Screenshot",
                "status", "PLANNED",
                "featured", false,
                "visible", false));

        // Create: slug generated from the name.
        JsonNode created = admin.body(admin.post("/api/v1/admin/projects", request)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("test-project-alpha"))
                .andExpect(jsonPath("$.visible").value(false)));
        String id = created.get("id").asText();

        // Read.
        admin.get("/api/v1/admin/projects/{id}", id).andExpect(jsonPath("$.name").value("Test Project Alpha"));

        // Update.
        request.put("summary", "Updated summary.");
        request.put("repoUrl", "https://github.com/example/alpha");
        admin.put("/api/v1/admin/projects/{id}", request, id)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.summary").value("Updated summary."))
                .andExpect(jsonPath("$.slug").value("test-project-alpha"));

        // Validation: unsafe URL and duplicate slug.
        request.put("demoUrl", "javascript:alert(1)");
        admin.put("/api/v1/admin/projects/{id}", request, id).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.demoUrl").exists());
        request.remove("demoUrl");
        request.put("slug", "reddit-sentiment-analysis");
        admin.put("/api/v1/admin/projects/{id}", request, id).andExpect(status().isConflict())
                .andExpect(jsonPath("$.errors.slug").exists());
        request.remove("slug");

        // Publish / unpublish.
        admin.patch("/api/v1/admin/projects/{id}/visibility", Map.of("visible", true), id)
                .andExpect(jsonPath("$.visible").value(true));
        admin.patch("/api/v1/admin/projects/{id}/visibility", Map.of("visible", false), id)
                .andExpect(jsonPath("$.visible").value(false));

        // Image.
        admin.upload("/api/v1/admin/projects/{id}/image", png("file"), id)
                .andExpect(jsonPath("$.image.contentType").value("image/png"));

        // Reorder: move the new project to the top.
        JsonNode all = admin.body(admin.get("/api/v1/admin/projects"));
        List<String> ids = new ArrayList<>();
        ids.add(id);
        all.forEach(p -> {
            if (!p.get("id").asText().equals(id)) {
                ids.add(p.get("id").asText());
            }
        });
        admin.put("/api/v1/admin/projects/order", Map.of("ids", ids))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(id))
                .andExpect(jsonPath("$[0].order").value(1));
        admin.put("/api/v1/admin/projects/order", Map.of("ids", List.of(id))).andExpect(status().isBadRequest());

        // Delete.
        admin.delete("/api/v1/admin/projects/{id}", id).andExpect(status().isNoContent());
        admin.get("/api/v1/admin/projects/{id}", id).andExpect(status().isNotFound());
    }

    // -------------------------------------------------------------- Skills

    @Test
    void skillsAndCategoriesLifecycle() throws Exception {
        JsonNode category = admin.body(admin.post("/api/v1/admin/skill-categories",
                        Map.of("title", "Tools", "icon", "TOOLS", "description", "Everyday tools.", "visible", true))
                .andExpect(status().isCreated()));
        String categoryId = category.get("id").asText();

        admin.put("/api/v1/admin/skill-categories/{id}", Map.of("title", "Tooling", "icon", "TOOLS",
                        "description", "Everyday tools.", "visible", true), categoryId)
                .andExpect(jsonPath("$.title").value("Tooling"));

        admin.post("/api/v1/admin/skill-categories/{id}/skills", Map.of("name", "Git", "visible", true), categoryId)
                .andExpect(status().isCreated());
        JsonNode withTwo = admin.body(admin.post("/api/v1/admin/skill-categories/{id}/skills",
                Map.of("name", "Docker", "visible", true), categoryId));
        assertThat(withTwo.get("skills")).hasSize(2);
        admin.post("/api/v1/admin/skill-categories/{id}/skills", Map.of("name", "git", "visible", true), categoryId)
                .andExpect(status().isConflict());

        String gitId = withTwo.get("skills").get(0).get("id").asText();
        String dockerId = withTwo.get("skills").get(1).get("id").asText();

        // Reorder skills inside the category.
        admin.put("/api/v1/admin/skill-categories/{id}/skills/order", Map.of("ids", List.of(dockerId, gitId)), categoryId)
                .andExpect(jsonPath("$.skills[0].name").value("Docker"));

        // Rename + move to another category.
        String otherCategory = admin.body(admin.get("/api/v1/admin/skill-categories")).get(0).get("id").asText();
        admin.put("/api/v1/admin/skills/{id}", Map.of("name", "Git & GitHub", "visible", true, "categoryId", otherCategory), gitId)
                .andExpect(status().isOk());
        assertThat(skills.findById(java.util.UUID.fromString(gitId)).orElseThrow().getCategory().getId().toString())
                .isEqualTo(otherCategory);

        // Reorder categories: new one first.
        JsonNode categories = admin.body(admin.get("/api/v1/admin/skill-categories"));
        List<String> order = new ArrayList<>();
        order.add(categoryId);
        categories.forEach(c -> {
            if (!c.get("id").asText().equals(categoryId)) {
                order.add(c.get("id").asText());
            }
        });
        admin.put("/api/v1/admin/skill-categories/order", Map.of("ids", order))
                .andExpect(jsonPath("$[0].id").value(categoryId));

        // Delete skill, then the category (with its remaining skill).
        admin.delete("/api/v1/admin/skills/{id}", gitId).andExpect(status().isNoContent());
        assertThat(skills.existsById(java.util.UUID.fromString(gitId))).isFalse();
        admin.delete("/api/v1/admin/skill-categories/{id}", categoryId).andExpect(status().isNoContent());
        assertThat(skills.existsById(java.util.UUID.fromString(dockerId))).isFalse();
    }

    // ------------------------------------------- Experience and education

    @Test
    void experienceLifecycle() throws Exception {
        Map<String, Object> entry = new HashMap<>(Map.of("period", "2025", "title", "Intern",
                "description", "Worked on APIs.", "visible", true));
        String id = admin.body(admin.post("/api/v1/admin/experience", entry).andExpect(status().isCreated()))
                .get("id").asText();

        entry.put("organisation", "Example Org");
        admin.put("/api/v1/admin/experience/{id}", entry, id).andExpect(jsonPath("$.organisation").value("Example Org"));

        entry.put("startDate", "2025-06-01");
        entry.put("endDate", "2025-01-01");
        admin.put("/api/v1/admin/experience/{id}", entry, id).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.endDate").exists());

        List<String> ids = new ArrayList<>();
        admin.body(admin.get("/api/v1/admin/experience")).forEach(e -> ids.add(0, e.get("id").asText()));
        admin.put("/api/v1/admin/experience/order", Map.of("ids", ids)).andExpect(jsonPath("$[0].id").value(id));

        admin.delete("/api/v1/admin/experience/{id}", id).andExpect(status().isNoContent());
        admin.delete("/api/v1/admin/experience/{id}", id).andExpect(status().isNotFound());
    }

    @Test
    void educationLifecycle() throws Exception {
        Map<String, Object> entry = new HashMap<>(Map.of("degree", "Diploma", "field", "Computing",
                "period", "2020", "description", "Foundations.", "visible", true));
        String id = admin.body(admin.post("/api/v1/admin/education", entry).andExpect(status().isCreated()))
                .get("id").asText();

        entry.put("institution", "Example Institute");
        admin.put("/api/v1/admin/education/{id}", entry, id)
                .andExpect(jsonPath("$.institution").value("Example Institute"));

        List<String> ids = new ArrayList<>();
        admin.body(admin.get("/api/v1/admin/education")).forEach(e -> ids.add(0, e.get("id").asText()));
        admin.put("/api/v1/admin/education/order", Map.of("ids", ids)).andExpect(jsonPath("$[0].id").value(id));

        admin.delete("/api/v1/admin/education/{id}", id).andExpect(status().isNoContent());
    }

    // -------------------------------------------------------- Social links

    @Test
    void socialLinksLifecycle() throws Exception {
        String id = admin.body(admin.post("/api/v1/admin/social-links",
                        Map.of("platform", "EMAIL", "label", "Email", "url", "me@example.com", "visible", true))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.url").value("mailto:me@example.com"))).get("id").asText();

        admin.put("/api/v1/admin/social-links/{id}",
                        Map.of("platform", "WEBSITE", "label", "Site", "url", "javascript:alert(1)", "visible", true), id)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.url").exists());
        admin.put("/api/v1/admin/social-links/{id}",
                        Map.of("platform", "WEBSITE", "label", "Site", "url", "https://example.com", "visible", true), id)
                .andExpect(jsonPath("$.url").value("https://example.com"));

        List<String> ids = new ArrayList<>();
        admin.body(admin.get("/api/v1/admin/social-links")).forEach(e -> ids.add(0, e.get("id").asText()));
        admin.put("/api/v1/admin/social-links/order", Map.of("ids", ids)).andExpect(jsonPath("$[0].id").value(id));

        admin.delete("/api/v1/admin/social-links/{id}", id).andExpect(status().isNoContent());
    }

    // ------------------------------------------------------------ Messages

    @Test
    void messagesListReadArchiveDelete() throws Exception {
        mvc.perform(post("/api/v1/contact").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Inbox Test\",\"email\":\"inbox@example.com\",\"subject\":\"Inbox check\","
                                + "\"message\":\"A message for the inbox test.\"}")
                        .with(r -> {
                            r.setRemoteAddr("198.51.100.200");
                            return r;
                        }))
                .andExpect(status().isAccepted());

        JsonNode page = admin.body(admin.get("/api/v1/admin/messages?status=NEW").andExpect(status().isOk()));
        String id = null;
        for (JsonNode m : page.get("items")) {
            if ("Inbox check".equals(m.get("subject").asText())) {
                id = m.get("id").asText();
            }
        }
        assertThat(id).isNotNull();

        admin.patch("/api/v1/admin/messages/{id}", Map.of("status", "READ"), id)
                .andExpect(jsonPath("$.status").value("READ"))
                .andExpect(jsonPath("$.readAt").isNotEmpty());
        admin.patch("/api/v1/admin/messages/{id}", Map.of("status", "ARCHIVED"), id)
                .andExpect(jsonPath("$.status").value("ARCHIVED"));
        admin.get("/api/v1/admin/messages?status=ARCHIVED").andExpect(jsonPath("$.total").value(1));
        admin.delete("/api/v1/admin/messages/{id}", id).andExpect(status().isNoContent());
        admin.get("/api/v1/admin/messages/{id}", id).andExpect(status().isNotFound());
    }

    // ------------------------------------------- Overview and publishing

    @Test
    void overviewCountsAndPublishingFlow() throws Exception {
        admin.post("/api/v1/admin/publications", Map.of("note", "baseline")).andExpect(status().isCreated());
        admin.get("/api/v1/admin/overview")
                .andExpect(jsonPath("$.hasUnpublishedChanges").value(false))
                .andExpect(jsonPath("$.projects.total").value((int) projects.count()))
                .andExpect(jsonPath("$.projects.published").value((int) projects.countByVisibleTrue()))
                .andExpect(jsonPath("$.skills").value((int) skills.count()))
                .andExpect(jsonPath("$.sections.visible").isNumber());

        // A draft change: visible in the studio, not on the public site until published.
        Map<String, Object> hero = asMap(admin.body(admin.get("/api/v1/admin/hero")));
        hero.put("role", "Backend Engineer");
        admin.put("/api/v1/admin/hero", hero).andExpect(status().isOk());
        admin.get("/api/v1/admin/overview").andExpect(jsonPath("$.hasUnpublishedChanges").value(true));
        mvc.perform(get("/api/v1/portfolio")).andExpect(jsonPath("$.hero.role").value(org.hamcrest.Matchers.not("Backend Engineer")));

        // Upload a photo; the public cannot fetch it until it is published.
        String photoUrl = admin.body(admin.upload("/api/v1/admin/profile/photo", png("file"))).get("photo").get("url").asText();
        mvc.perform(get(photoUrl)).andExpect(status().isNotFound());

        admin.post("/api/v1/admin/publications", Map.of("note", "Rename role"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.publishedBy").value("Test Admin"));

        mvc.perform(get("/api/v1/portfolio"))
                .andExpect(jsonPath("$.hero.role").value("Backend Engineer"))
                .andExpect(jsonPath("$.profile.photoUrl").value(photoUrl))
                .andExpect(jsonPath("$.appearance.accentColor").isNotEmpty());
        mvc.perform(get(photoUrl)).andExpect(status().isOk()).andExpect(header().string("Content-Type", "image/png"));
        admin.get("/api/v1/admin/overview").andExpect(jsonPath("$.hasUnpublishedChanges").value(false));
        admin.get("/api/v1/admin/publications").andExpect(jsonPath("$[0].note").value("Rename role"));
    }

    @Test
    void darkThemePhotoIsOptionalAndPublishedSeparately() throws Exception {
        admin.get("/api/v1/admin/profile").andExpect(jsonPath("$.photoDark").value(org.hamcrest.Matchers.nullValue()));

        String darkUrl = admin.body(admin.upload("/api/v1/admin/profile/photo-dark", png("file")))
                .get("photoDark").get("url").asText();
        mvc.perform(get(darkUrl)).andExpect(status().isNotFound());          // draft only
        mvc.perform(get("/api/v1/portfolio")).andExpect(jsonPath("$.profile.photoDarkUrl").value(org.hamcrest.Matchers.nullValue()));

        admin.post("/api/v1/admin/publications", Map.of("note", "Dark photo")).andExpect(status().isCreated());
        mvc.perform(get("/api/v1/portfolio")).andExpect(jsonPath("$.profile.photoDarkUrl").value(darkUrl));
        mvc.perform(get(darkUrl)).andExpect(status().isOk());

        // Only images are accepted.
        MockMultipartFile fake = new MockMultipartFile("file", "x.png", "image/png", "not an image".getBytes());
        admin.upload("/api/v1/admin/profile/photo-dark", fake).andExpect(status().isUnsupportedMediaType());

        // Removing it falls back to the regular photo in both themes.
        admin.delete("/api/v1/admin/profile/photo-dark")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.photoDark").value(org.hamcrest.Matchers.nullValue()));
        admin.post("/api/v1/admin/publications", Map.of("note", "No dark photo")).andExpect(status().isCreated());
        mvc.perform(get("/api/v1/portfolio")).andExpect(jsonPath("$.profile.photoDarkUrl").value(org.hamcrest.Matchers.nullValue()));
        mvc.perform(get(darkUrl)).andExpect(status().isNotFound());
    }

    // ---------------------------------------------------------------- helpers

    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(JsonNode node) {
        return new HashMap<>(json.convertValue(node, Map.class));
    }

    private static MockMultipartFile png(String field) throws Exception {
        BufferedImage image = new BufferedImage(4, 3, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        ImageIO.write(image, "png", out);
        return new MockMultipartFile(field, "photo.png", "image/png", out.toByteArray());
    }

    private static MockMultipartFile pdf(String name) {
        byte[] bytes = "%PDF-1.4\n1 0 obj << >> endobj\ntrailer << >>\n%%EOF\n".getBytes(StandardCharsets.US_ASCII);
        return new MockMultipartFile("file", name, "application/pdf", bytes);
    }
}
