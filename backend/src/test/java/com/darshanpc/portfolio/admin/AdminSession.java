package com.darshanpc.portfolio.admin;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

/**
 * A real signed-in browser session for tests: fetches a CSRF token, signs in
 * through the login endpoint, then sends the session cookie and token on
 * every request, exactly as the studio does.
 */
public final class AdminSession {

    public static final String EMAIL = "admin@test.local";
    public static final String PASSWORD = "test-only-password-123";

    private final MockMvc mvc;
    private final ObjectMapper json;
    private MockHttpSession session;
    private String csrf;

    private AdminSession(MockMvc mvc, ObjectMapper json) {
        this.mvc = mvc;
        this.json = json;
    }

    public static AdminSession signIn(MockMvc mvc, ObjectMapper json) throws Exception {
        return signIn(mvc, json, EMAIL, PASSWORD);
    }

    public static AdminSession signIn(MockMvc mvc, ObjectMapper json, String email, String password) throws Exception {
        AdminSession s = new AdminSession(mvc, json);
        s.fetchCsrf();
        MvcResult result = mvc.perform(MockMvcRequestBuilders.post("/api/v1/admin/auth/login")
                        .session(s.session)
                        .header("X-CSRF-TOKEN", s.csrf)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json.writeValueAsString(new Login(email, password))))
                .andExpect(status().isOk())
                .andReturn();
        s.session = (MockHttpSession) result.getRequest().getSession(false);
        s.csrf = json.readTree(result.getResponse().getContentAsString()).get("csrfToken").asText();
        return s;
    }

    private void fetchCsrf() throws Exception {
        MvcResult result = mvc.perform(MockMvcRequestBuilders.get("/api/v1/admin/auth/csrf")).andExpect(status().isOk()).andReturn();
        session = (MockHttpSession) result.getRequest().getSession(false);
        csrf = json.readTree(result.getResponse().getContentAsString()).get("token").asText();
    }

    record Login(String email, String password) {
    }

    public MockHttpSession session() {
        return session;
    }

    public String csrf() {
        return csrf;
    }

    public ResultActions get(String url, Object... vars) throws Exception {
        return mvc.perform(with(MockMvcRequestBuilders.get(url, vars)));
    }

    public ResultActions post(String url, Object body, Object... vars) throws Exception {
        return mvc.perform(withBody(MockMvcRequestBuilders.post(url, vars), body));
    }

    public ResultActions put(String url, Object body, Object... vars) throws Exception {
        return mvc.perform(withBody(MockMvcRequestBuilders.put(url, vars), body));
    }

    public ResultActions patch(String url, Object body, Object... vars) throws Exception {
        return mvc.perform(withBody(MockMvcRequestBuilders.patch(url, vars), body));
    }

    public ResultActions delete(String url, Object... vars) throws Exception {
        return mvc.perform(with(MockMvcRequestBuilders.delete(url, vars)));
    }

    public ResultActions upload(String url, MockMultipartFile file, Object... vars) throws Exception {
        return mvc.perform(with(MockMvcRequestBuilders.multipart(url, vars).file(file)));
    }

    /** Reads a JSON response body. */
    public JsonNode body(ResultActions actions) throws Exception {
        return json.readTree(actions.andReturn().getResponse().getContentAsString());
    }

    private MockHttpServletRequestBuilder with(MockHttpServletRequestBuilder builder) {
        return builder.session(session).header("X-CSRF-TOKEN", csrf);
    }

    private MockHttpServletRequestBuilder withBody(MockHttpServletRequestBuilder builder, Object body) throws Exception {
        return with(builder).contentType(MediaType.APPLICATION_JSON)
                .content(body instanceof String s ? s : json.writeValueAsString(body));
    }
}
