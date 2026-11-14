package com.darshanpc.portfolio.admin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.darshanpc.portfolio.IntegrationTest;
import com.darshanpc.portfolio.entity.AdminUser;
import com.darshanpc.portfolio.repository.AdminUserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@IntegrationTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class AuthApiTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    @Autowired
    AdminUserRepository admins;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Test
    void firstAdministratorIsProvisionedWithHashedPassword() {
        AdminUser admin = admins.findByEmailIgnoreCase(AdminSession.EMAIL).orElseThrow();
        assertThat(admin.getDisplayName()).isEqualTo("Test Admin");
        assertThat(admin.getPasswordHash()).startsWith("$2").isNotEqualTo(AdminSession.PASSWORD);
        assertThat(passwordEncoder.matches(AdminSession.PASSWORD, admin.getPasswordHash())).isTrue();
        assertThat(admins.count()).isGreaterThanOrEqualTo(1);
    }

    @Test
    void adminEndpointsRequireSignIn() throws Exception {
        mvc.perform(get("/api/v1/admin/overview"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.title").value("Not signed in"));
        mvc.perform(get("/api/v1/admin/projects")).andExpect(status().isUnauthorized());
    }

    @Test
    void loginWithoutCsrfTokenIsRejected() throws Exception {
        mvc.perform(post("/api/v1/admin/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(Map.of("email", AdminSession.EMAIL, "password", AdminSession.PASSWORD))))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("csrf"));
    }

    @Test
    void wrongPasswordAndUnknownEmailGiveTheSameAnswer() throws Exception {
        Csrf csrf = csrf();
        mvc.perform(login(csrf, AdminSession.EMAIL, "wrong-password-0000"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Invalid email or password."));
        mvc.perform(login(csrf, "nobody@test.local", "whatever-password-1"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Invalid email or password."));
    }

    @Test
    void loginValidationErrors() throws Exception {
        Csrf csrf = csrf();
        mvc.perform(login(csrf, "not-an-email", ""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    void signedInSessionWorksAndNeedsCsrfForChanges() throws Exception {
        AdminSession admin = AdminSession.signIn(mvc, json);

        admin.get("/api/v1/admin/auth/me")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(AdminSession.EMAIL))
                .andExpect(jsonPath("$.lastLoginAt").isNotEmpty());

        // Same session, but no CSRF header → refused.
        mvc.perform(post("/api/v1/admin/publications").session(admin.session()))
                .andExpect(status().isForbidden());
        admin.post("/api/v1/admin/publications", Map.of()).andExpect(status().isCreated());
    }

    @Test
    void logoutInvalidatesTheSession() throws Exception {
        AdminSession admin = AdminSession.signIn(mvc, json);
        MockHttpSession session = admin.session();

        admin.post("/api/v1/admin/auth/logout", Map.of()).andExpect(status().isNoContent());

        assertThat(session.isInvalid()).isTrue();
        mvc.perform(get("/api/v1/admin/auth/me").session(new MockHttpSession()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void accountLocksAfterRepeatedFailures() throws Exception {
        AdminUser second = new AdminUser();
        second.setEmail("locked@test.local");
        second.setDisplayName("Second");
        second.setPasswordHash(passwordEncoder.encode("right-password-12345"));
        admins.save(second);

        Csrf csrf = csrf();
        for (int i = 0; i < 5; i++) {
            mvc.perform(login(csrf, "locked@test.local", "wrong-password-" + i)).andExpect(status().isUnauthorized());
        }
        // Even the right password is refused while locked, with the same generic message.
        mvc.perform(login(csrf, "locked@test.local", "right-password-12345"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Invalid email or password."));
        assertThat(admins.findByEmailIgnoreCase("locked@test.local").orElseThrow().getLockedUntil()).isNotNull();
    }

    @Test
    void loginAttemptsAreRateLimitedPerAddress() throws Exception {
        Csrf csrf = csrf();
        int lastStatus = 0;
        for (int i = 0; i < 21; i++) {
            lastStatus = mvc.perform(login(csrf, "nobody@test.local", "attempt-password-" + i)
                            .with(r -> {
                                r.setRemoteAddr("203.0.113.77");
                                return r;
                            }))
                    .andReturn().getResponse().getStatus();
        }
        assertThat(lastStatus).isEqualTo(429);
    }

    @Test
    void passwordChangeChecksCurrentPasswordAndPolicy() throws Exception {
        AdminUser third = new AdminUser();
        third.setEmail("changer@test.local");
        third.setDisplayName("Changer");
        third.setPasswordHash(passwordEncoder.encode("original-password-1"));
        admins.save(third);
        AdminSession admin = AdminSession.signIn(mvc, json, "changer@test.local", "original-password-1");

        admin.put("/api/v1/admin/account/password", Map.of("currentPassword", "nope-nope-nope", "newPassword", "another-password-2"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.currentPassword").exists());
        admin.put("/api/v1/admin/account/password", Map.of("currentPassword", "original-password-1", "newPassword", "short"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.newPassword").exists());
        admin.put("/api/v1/admin/account/password", Map.of("currentPassword", "original-password-1", "newPassword", "another-password-2"))
                .andExpect(status().isNoContent());

        AdminSession.signIn(mvc, json, "changer@test.local", "another-password-2");
    }

    @Test
    void accountDetailsCanBeUpdatedButEmailsStayUnique() throws Exception {
        AdminUser fourth = new AdminUser();
        fourth.setEmail("renamer@test.local");
        fourth.setDisplayName("Renamer");
        fourth.setPasswordHash(passwordEncoder.encode("renamer-password-1"));
        admins.save(fourth);
        AdminSession admin = AdminSession.signIn(mvc, json, "renamer@test.local", "renamer-password-1");

        admin.put("/api/v1/admin/account", Map.of("displayName", "Renamed", "email", AdminSession.EMAIL,
                        "currentPassword", "renamer-password-1"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errors.email").exists());
        admin.put("/api/v1/admin/account", Map.of("displayName", "Renamed", "email", "renamed@test.local",
                        "currentPassword", "renamer-password-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Renamed"));
        admin.get("/api/v1/admin/auth/me").andExpect(jsonPath("$.email").value("renamed@test.local"));
    }

    // ---------------------------------------------------------------- helpers

    private record Csrf(MockHttpSession session, String token) {
    }

    private Csrf csrf() throws Exception {
        MvcResult result = mvc.perform(get("/api/v1/admin/auth/csrf")).andExpect(status().isOk()).andReturn();
        String token = json.readTree(result.getResponse().getContentAsString()).get("token").asText();
        return new Csrf((MockHttpSession) result.getRequest().getSession(false), token);
    }

    private MockHttpServletRequestBuilder login(Csrf csrf, String email, String password) throws Exception {
        return post("/api/v1/admin/auth/login")
                .session(csrf.session())
                .header("X-CSRF-TOKEN", csrf.token())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsString(Map.of("email", email, "password", password)));
    }
}
