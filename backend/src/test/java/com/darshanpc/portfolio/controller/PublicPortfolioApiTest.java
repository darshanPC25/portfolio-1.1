package com.darshanpc.portfolio.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.darshanpc.portfolio.IntegrationTest;
import com.darshanpc.portfolio.entity.Project;
import com.darshanpc.portfolio.repository.ProjectRepository;
import com.darshanpc.portfolio.service.publication.PublicationService;
import java.util.UUID;
import java.util.function.Consumer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.support.TransactionTemplate;

@IntegrationTest
class PublicPortfolioApiTest {

    private static final UUID FEATURED_PROJECT = UUID.fromString("e0000000-0000-4000-8000-000000000001");
    private static final UUID LAST_PROJECT = UUID.fromString("e0000000-0000-4000-8000-000000000004");

    @Autowired
    MockMvc mvc;

    @Autowired
    ProjectRepository projects;

    @Autowired
    PublicationService publicationService;

    @Autowired
    TransactionTemplate tx;

    @Test
    void portfolioReturnsPublishedSeedContent() throws Exception {
        mvc.perform(get("/api/v1/portfolio"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.version").isNumber())
                .andExpect(jsonPath("$.profile.fullName").value("Paridarshan Sahoo"))
                .andExpect(jsonPath("$.profile.photoUrl").value("/images/profile-placeholder.svg"))
                .andExpect(jsonPath("$.profile.resumeUrl").value(nullValue()))
                .andExpect(jsonPath("$.hero.greeting").value("Hi, I'm Darshan"))
                .andExpect(jsonPath("$.hero.role").value("Software Developer"))
                .andExpect(jsonPath("$.hero.tagline")
                        .value("Building scalable backend systems and meaningful digital experiences."))
                .andExpect(jsonPath("$.navigation", hasSize(7)))
                .andExpect(jsonPath("$.navigation[0].id").value("about"))
                .andExpect(jsonPath("$.about.facts", hasSize(4)))
                .andExpect(jsonPath("$.skills.groups", hasSize(4)))
                .andExpect(jsonPath("$.projects.items", hasSize(4)))
                .andExpect(jsonPath("$.projects.items[0].status").value("in-development"))
                .andExpect(jsonPath("$.projects.items[0].repoUrl").value(nullValue()))
                .andExpect(jsonPath("$.contact.formHeading").value("Send a message"))
                .andExpect(jsonPath("$.github.username").value(nullValue()))
                // Seeded social links have no URL yet, so none are published.
                .andExpect(jsonPath("$.socialLinks", hasSize(0)))
                .andExpect(jsonPath("$.footer.copyright").value("© 2026 Paridarshan Sahoo. All rights reserved."))
                .andExpect(jsonPath("$.footer.loginLabel").value("Login"))
                .andExpect(jsonPath("$.footer.loginHref").value("/admin/login"))
                .andExpect(jsonPath("$.appearance.heroSceneEnabled").value(true))
                .andExpect(jsonPath("$.seo.title").value("Darshan — Software Developer"));
    }

    @Test
    void narrowEndpointsReturnTheirSlice() throws Exception {
        mvc.perform(get("/api/v1/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.preferredName").value("Darshan"));
        mvc.perform(get("/api/v1/projects")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(4)));
        mvc.perform(get("/api/v1/skills")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(4)));
        mvc.perform(get("/api/v1/experience")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(2)));
        mvc.perform(get("/api/v1/education"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].field").value("Computer Science and Engineering (Data Science)"));
        mvc.perform(get("/api/v1/social-links")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void projectIsFoundByIdOrSlug() throws Exception {
        mvc.perform(get("/api/v1/projects/{id}", FEATURED_PROJECT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Secure Digital Document Management System"))
                .andExpect(jsonPath("$.featured").value(true));
        mvc.perform(get("/api/v1/projects/{id}", "reddit-sentiment-analysis"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(LAST_PROJECT.toString()));
    }

    @Test
    void unknownProjectIsProblem404() throws Exception {
        mvc.perform(get("/api/v1/projects/{id}", "does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.title").value("Not found"));
    }

    @Test
    void draftChangesStayPrivateUntilPublished() throws Exception {
        String original = "Reddit Sentiment Analysis";
        try {
            editProject(LAST_PROJECT, p -> p.setName("Renamed in draft"));

            // Still the published name: drafts are never served.
            mvc.perform(get("/api/v1/projects/{id}", LAST_PROJECT))
                    .andExpect(jsonPath("$.name").value(original));

            publicationService.publish("test publish", null);

            mvc.perform(get("/api/v1/projects/{id}", LAST_PROJECT))
                    .andExpect(jsonPath("$.name").value("Renamed in draft"));
        } finally {
            editProject(LAST_PROJECT, p -> p.setName(original));
            publicationService.publish("test restore", null);
        }
    }

    @Test
    void unpublishedProjectDisappearsAfterPublishing() throws Exception {
        try {
            editProject(LAST_PROJECT, p -> p.setVisible(false));
            publicationService.publish("hide project", null);

            mvc.perform(get("/api/v1/projects")).andExpect(jsonPath("$", hasSize(3)));
            mvc.perform(get("/api/v1/projects/{id}", LAST_PROJECT)).andExpect(status().isNotFound());
        } finally {
            editProject(LAST_PROJECT, p -> p.setVisible(true));
            publicationService.publish("test restore", null);
        }
        mvc.perform(get("/api/v1/projects")).andExpect(jsonPath("$", hasSize(4)));
    }

    @Test
    void apiDocsAreDisabledOutsideDev() throws Exception {
        mvc.perform(get("/v3/api-docs")).andExpect(status().isNotFound());
    }

    private void editProject(UUID id, Consumer<Project> change) {
        tx.executeWithoutResult(status -> change.accept(projects.findById(id).orElseThrow()));
    }
}
