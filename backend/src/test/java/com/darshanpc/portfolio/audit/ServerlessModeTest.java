package com.darshanpc.portfolio.audit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.darshanpc.portfolio.IntegrationTest;
import com.darshanpc.portfolio.admin.AdminSession;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.Map;
import javax.imageio.ImageIO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/**
 * The settings used on AWS Lambda: files, Studio sessions and rate limits all in
 * PostgreSQL. Requests carry only cookies (no server-side MockHttpSession), the
 * way separate Lambda instances see them.
 */
@IntegrationTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestPropertySource(properties = {
        "portfolio.storage.type=database",
        "portfolio.session-store=jdbc",
        "portfolio.rate-limit-store=jdbc",
        "portfolio.mail.async=false",
        "portfolio.contact.global-rate-limit.max-requests=4",
})
class ServerlessModeTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    @Autowired
    JdbcTemplate jdbc;

    /** A browser that only keeps cookies and the CSRF token. */
    final class Browser {
        Cookie session;
        String csrf;

        MockHttpServletRequestBuilder send(MockHttpServletRequestBuilder request) {
            if (session != null) {
                request.cookie(session);
            }
            if (csrf != null) {
                request.header("X-CSRF-TOKEN", csrf);
            }
            return request;
        }

        MvcResult perform(MockHttpServletRequestBuilder request) throws Exception {
            MvcResult result = mvc.perform(send(request)).andReturn();
            Cookie updated = result.getResponse().getCookie("PORTFOLIO_SESSION");
            if (updated != null) {
                session = updated.getMaxAge() == 0 ? null : updated;
            }
            return result;
        }

        void signIn() throws Exception {
            MvcResult token = perform(get("/api/v1/admin/auth/csrf"));
            csrf = json.readTree(token.getResponse().getContentAsString()).get("token").asText();
            MvcResult login = perform(post("/api/v1/admin/auth/login").contentType(MediaType.APPLICATION_JSON)
                    .content(json.writeValueAsString(Map.of("email", AdminSession.EMAIL, "password", AdminSession.PASSWORD))));
            assertThat(login.getResponse().getStatus()).isEqualTo(200);
            csrf = json.readTree(login.getResponse().getContentAsString()).get("csrfToken").asText();
        }
    }

    @Test
    void signInLivesInTheDatabaseAndSurvivesWithoutServerMemory() throws Exception {
        Browser browser = new Browser();
        browser.signIn();

        assertThat(browser.session).isNotNull();
        assertThat(browser.session.isHttpOnly()).isTrue();
        assertThat(jdbc.queryForObject("SELECT count(*) FROM spring_session WHERE principal_name IS NOT NULL", Integer.class))
                .isPositive();

        // Every request is independent (as on separate Lambda instances): only the cookie identifies the user.
        assertThat(browser.perform(get("/api/v1/admin/auth/me")).getResponse().getStatus()).isEqualTo(200);
        String setCookie = mvc.perform(get("/api/v1/admin/auth/csrf")).andReturn().getResponse().getHeader(HttpHeaders.SET_COOKIE);
        assertThat(setCookie).contains("SameSite=Strict").contains("HttpOnly");

        // Logout deletes the stored session: the old cookie no longer works.
        Cookie old = browser.session;
        assertThat(browser.perform(post("/api/v1/admin/auth/logout")).getResponse().getStatus()).isIn(200, 204);
        assertThat(mvc.perform(get("/api/v1/admin/auth/me").cookie(old)).andReturn().getResponse().getStatus()).isEqualTo(401);
    }

    @Test
    void uploadsAreStoredInTheDatabaseAndServedOnlyOncePublished() throws Exception {
        Browser browser = new Browser();
        browser.signIn();

        ByteArrayOutputStream png = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(40, 50, BufferedImage.TYPE_INT_RGB), "png", png);
        MvcResult upload = browser.perform(multipart("/api/v1/admin/profile/photo")
                .file(new MockMultipartFile("file", "me.png", "image/png", png.toByteArray())));
        assertThat(upload.getResponse().getStatus()).isEqualTo(200);
        JsonNode photo = json.readTree(upload.getResponse().getContentAsString()).get("photo");
        String url = photo.get("url").asText();

        String id = url.substring(url.lastIndexOf('/') + 1);
        assertThat(jdbc.queryForObject("SELECT storage_type FROM portfolio_asset WHERE id = ?::uuid", String.class, id))
                .isEqualTo("DATABASE");
        assertThat(jdbc.queryForObject("SELECT length(data) FROM portfolio_asset_content WHERE asset_id = ?::uuid",
                Integer.class, id)).isEqualTo(png.size());

        mvc.perform(get(url)).andExpect(status().isNotFound());   // draft only
        assertThat(browser.perform(post("/api/v1/admin/publications").contentType(MediaType.APPLICATION_JSON)
                .content("{\"note\":\"photo\"}")).getResponse().getStatus()).isEqualTo(201);

        byte[] served = mvc.perform(get(url))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "image/png"))
                .andReturn().getResponse().getContentAsByteArray();
        assertThat(served).isEqualTo(png.toByteArray());
    }

    @Test
    void rateLimitsAreSharedThroughTheDatabase() throws Exception {
        String body = json.writeValueAsString(Map.of("name", "Visitor", "email", "v@example.com", "subject", "Hello",
                "message", "A message that is long enough to pass validation.", "website", ""));
        int[] statuses = new int[5];
        for (int i = 0; i < 5; i++) {
            // Different addresses each time: only the overall cap (4 in this test) applies.
            String ip = "192.0.2." + (10 + i);
            statuses[i] = mvc.perform(post("/api/v1/contact").contentType(MediaType.APPLICATION_JSON).content(body)
                            .with(r -> {
                                r.setRemoteAddr(ip);
                                return r;
                            }))
                    .andReturn().getResponse().getStatus();
        }
        assertThat(statuses).containsExactly(202, 202, 202, 202, 429);
        assertThat(jdbc.queryForObject("SELECT hits FROM rate_limit_window WHERE bucket_key = 'contact-all:all'", Integer.class))
                .isEqualTo(5);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM rate_limit_window WHERE bucket_key LIKE 'contact:contact:192.0.2.%'",
                Integer.class)).isEqualTo(5);
    }

    @Test
    void failedSignInsAreCountedEvenThoughTheRequestFails() throws Exception {
        // Test profile: 20 sign-in attempts per address per minute.
        int last = 0;
        for (int i = 0; i < 21; i++) {
            Browser browser = new Browser();
            MvcResult token = browser.perform(get("/api/v1/admin/auth/csrf"));
            browser.csrf = json.readTree(token.getResponse().getContentAsString()).get("token").asText();
            String credentials = json.writeValueAsString(
                    Map.of("email", "nobody-" + i + "@test.local", "password", "wrong-password-123"));
            last = browser.perform(post("/api/v1/admin/auth/login").contentType(MediaType.APPLICATION_JSON)
                            .with(r -> {
                                r.setRemoteAddr("198.18.0.77");
                                return r;
                            })
                            .content(credentials))
                    .getResponse().getStatus();
        }
        assertThat(last).isEqualTo(429);
        assertThat(jdbc.queryForObject("SELECT hits FROM rate_limit_window WHERE bucket_key = 'login:login:198.18.0.77'",
                Integer.class)).isEqualTo(21);
    }

    @Test
    void anonymousStudioCallsAreStillRefused() throws Exception {
        mvc.perform(get("/api/v1/admin/overview")).andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }
}
