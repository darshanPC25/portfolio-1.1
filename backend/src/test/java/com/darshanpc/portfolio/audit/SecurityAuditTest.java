package com.darshanpc.portfolio.audit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.darshanpc.portfolio.IntegrationTest;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

/**
 * Batch 6 security audit, as executable checks: every studio endpoint is
 * closed to anonymous callers, CORS only admits the configured origin, input
 * that looks like SQL is treated as data, and responses leak no internals.
 */
@IntegrationTest
class SecurityAuditTest {

    private static final Set<String> PUBLIC_ADMIN_PATHS = Set.of("/api/v1/admin/auth/csrf", "/api/v1/admin/auth/login");

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    @Qualifier("requestMappingHandlerMapping")
    RequestMappingHandlerMapping mappings;

    record Endpoint(HttpMethod method, String path) {
    }

    /** Every studio endpoint the application actually registers, with path variables filled in. */
    private List<Endpoint> adminEndpoints() {
        List<Endpoint> endpoints = new ArrayList<>();
        for (Map.Entry<RequestMappingInfo, ?> entry : mappings.getHandlerMethods().entrySet()) {
            RequestMappingInfo info = entry.getKey();
            for (String pattern : info.getPatternValues()) {
                if (!pattern.startsWith("/api/v1/admin/") || PUBLIC_ADMIN_PATHS.contains(pattern)) {
                    continue;
                }
                String path = pattern.replaceAll("\\{[^}]+}", "00000000-0000-4000-8000-000000000000");
                Set<RequestMethod> methods = info.getMethodsCondition().getMethods();
                if (methods.isEmpty()) {
                    endpoints.add(new Endpoint(HttpMethod.GET, path));
                }
                methods.forEach(m -> endpoints.add(new Endpoint(HttpMethod.valueOf(m.name()), path)));
            }
        }
        return endpoints;
    }

    @Test
    void everyStudioEndpointRejectsAnonymousCallersEvenWithAValidCsrfToken() throws Exception {
        List<Endpoint> endpoints = adminEndpoints();
        assertThat(endpoints).as("studio endpoints discovered").hasSizeGreaterThan(40);

        MvcResult csrf = mvc.perform(get("/api/v1/admin/auth/csrf")).andExpect(status().isOk()).andReturn();
        MockHttpSession session = (MockHttpSession) csrf.getRequest().getSession(false);
        String token = json.readTree(csrf.getResponse().getContentAsString()).get("token").asText();

        List<String> open = new ArrayList<>();
        for (Endpoint endpoint : endpoints) {
            int status = mvc.perform(request(endpoint.method(), endpoint.path())
                            .session(session)
                            .header("X-CSRF-TOKEN", token)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{}"))
                    .andReturn().getResponse().getStatus();
            if (status != 401) {
                open.add(endpoint + " -> " + status);
            }
        }
        assertThat(open).as("endpoints that did not answer 401").isEmpty();
    }

    @Test
    void stateChangingStudioCallsWithoutSessionOrCsrfAreRefused() throws Exception {
        for (Endpoint endpoint : adminEndpoints()) {
            int status = mvc.perform(request(endpoint.method(), endpoint.path())
                            .contentType(MediaType.APPLICATION_JSON).content("{}"))
                    .andReturn().getResponse().getStatus();
            assertThat(status).as(endpoint.toString()).isIn(401, 403);
        }
    }

    @Test
    void corsAdmitsOnlyTheConfiguredFrontendOrigin() throws Exception {
        mvc.perform(options("/api/v1/portfolio")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"));

        mvc.perform(options("/api/v1/admin/auth/login")
                        .header(HttpHeaders.ORIGIN, "https://evil.example")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));

        mvc.perform(get("/api/v1/portfolio").header(HttpHeaders.ORIGIN, "https://evil.example"))
                .andExpect(status().isForbidden());
    }

    @Test
    void sqlLikeInputIsTreatedAsPlainData() throws Exception {
        for (String probe : List.of("' OR '1'='1", "1; DROP TABLE project;--", "x' UNION SELECT password_hash FROM admin_user--")) {
            // 404 (no such project) or 400 (the firewall rejects ';' in URLs); never data or a 500.
            MvcResult result = mvc.perform(get("/api/v1/projects/{id}", probe))
                    .andExpect(content().string(not(containsString("SQL"))))
                    .andReturn();
            assertThat(result.getResponse().getStatus()).as(probe).isIn(400, 404);
        }

        String name = "Robert'); DROP TABLE contact_message;--";
        String body = json.writeValueAsString(Map.of(
                "name", name,
                "email", "robert@example.com",
                "subject", "Hello'; DELETE FROM project;--",
                "message", "A message that is long enough to pass validation.",
                "website", ""));
        mvc.perform(post("/api/v1/contact").contentType(MediaType.APPLICATION_JSON).content(body)
                        .with(r -> {
                            r.setRemoteAddr("198.51.100.66");
                            return r;
                        }))
                .andExpect(status().isAccepted());

        assertThat(jdbc.queryForObject("SELECT count(*) FROM contact_message WHERE name = ?", Integer.class, name))
                .isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT count(*) FROM project", Integer.class)).isPositive();
        jdbc.update("DELETE FROM contact_message WHERE name = ?", name);
    }

    @Test
    void errorsAndOperationalEndpointsExposeNoInternals() throws Exception {
        mvc.perform(get("/api/v1/projects/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON))
                .andExpect(jsonPath("$.trace").doesNotExist())
                .andExpect(jsonPath("$.exception").doesNotExist());

        mvc.perform(post("/api/v1/contact").contentType(MediaType.APPLICATION_JSON).content("{\"name\": [")
                        .with(r -> {
                            r.setRemoteAddr("198.51.100.67");
                            return r;
                        }))
                .andExpect(status().isBadRequest())
                .andExpect(content().string(not(containsString("com.fasterxml"))))
                .andExpect(content().string(not(containsString("Exception"))));

        mvc.perform(get("/actuator/health")).andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components").doesNotExist());
        for (String hidden : List.of("/actuator/env", "/actuator/beans", "/actuator/configprops", "/actuator/heapdump")) {
            assertThat(mvc.perform(get(hidden)).andReturn().getResponse().getStatus()).as(hidden).isEqualTo(404);
        }
    }

    @Test
    void responsesCarrySecurityHeaders() throws Exception {
        mvc.perform(get("/api/v1/portfolio"))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"))
                .andExpect(header().string("Content-Security-Policy", containsString("frame-ancestors 'self'")));

        mvc.perform(get("/api/v1/admin/auth/csrf"))
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("no-store")));
    }

    @Test
    void passwordHashesAreNeverReturnedByTheApi() throws Exception {
        var admin = com.darshanpc.portfolio.admin.AdminSession.signIn(mvc, json);
        for (String path : List.of("/api/v1/admin/auth/me", "/api/v1/admin/overview")) {
            String body = admin.get(path).andReturn().getResponse().getContentAsString();
            assertThat(body).as(path).doesNotContain("$2a$").doesNotContainIgnoringCase("passwordHash");
        }
    }
}
