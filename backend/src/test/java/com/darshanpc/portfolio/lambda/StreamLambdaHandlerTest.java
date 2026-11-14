package com.darshanpc.portfolio.lambda;

import static org.assertj.core.api.Assertions.assertThat;

import com.amazonaws.services.lambda.runtime.ClientContext;
import com.amazonaws.services.lambda.runtime.CognitoIdentity;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.LambdaLogger;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;

/**
 * Runs the real Lambda entry point with the production settings
 * ({@code SPRING_PROFILES_ACTIVE=prod,lambda}) against PostgreSQL, feeding it API
 * Gateway HTTP API (payload 2.0) events exactly as AWS would.
 */
class StreamLambdaHandlerTest {

    private static final ObjectMapper JSON = new ObjectMapper();
    private static final String SALT = "lambda-test-salt";
    private static final Map<String, String> SETTINGS = new java.util.LinkedHashMap<>();

    static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:17-alpine");
    static StreamLambdaHandler handler;

    @BeforeAll
    static void start() {
        db.start();
        SETTINGS.put("spring.profiles.active", "prod,lambda");
        SETTINGS.put("DB_URL", db.getJdbcUrl());
        SETTINGS.put("DB_USERNAME", db.getUsername());
        SETTINGS.put("DB_PASSWORD", db.getPassword());
        SETTINGS.put("CORS_ALLOWED_ORIGINS", "https://portfolio.example");
        SETTINGS.put("CONTACT_IP_HASH_SALT", SALT);
        SETTINGS.put("ADMIN_EMAIL", "lambda-admin@test.local");
        SETTINGS.put("ADMIN_PASSWORD", "lambda-test-password-1");
        SETTINGS.forEach(System::setProperty);
        handler = new StreamLambdaHandler();   // starts Spring Boot, runs Flyway, seeds and publishes
    }

    @AfterAll
    static void stop() {
        SETTINGS.keySet().forEach(System::clearProperty);
        db.stop();
    }

    /** One API Gateway HTTP API request through the handler; returns the Lambda response JSON. */
    private static JsonNode call(String method, String path, Map<String, String> headers, List<String> cookies, String body)
            throws Exception {
        ObjectNode event = JSON.createObjectNode();
        event.put("version", "2.0");
        event.put("routeKey", "$default");
        event.put("rawPath", path);
        event.put("rawQueryString", "");
        ObjectNode h = event.putObject("headers");
        h.put("host", "abc123.execute-api.ap-south-1.amazonaws.com");
        h.put("x-forwarded-proto", "https");
        h.put("x-forwarded-port", "443");
        headers.forEach(h::put);
        if (!cookies.isEmpty()) {
            ArrayNode c = event.putArray("cookies");
            cookies.forEach(c::add);
        }
        ObjectNode ctx = event.putObject("requestContext");
        ctx.put("accountId", "123456789012");
        ctx.put("apiId", "abc123");
        ctx.put("domainName", "abc123.execute-api.ap-south-1.amazonaws.com");
        ctx.put("requestId", "req-" + System.nanoTime());
        ctx.put("routeKey", "$default");
        ctx.put("stage", "$default");
        ctx.put("timeEpoch", System.currentTimeMillis());
        ObjectNode http = ctx.putObject("http");
        http.put("method", method);
        http.put("path", path);
        http.put("protocol", "HTTP/1.1");
        http.put("sourceIp", "76.76.21.21");   // the Vercel proxy
        http.put("userAgent", "vercel-proxy");
        if (body != null) {
            event.put("body", body);
        }
        event.put("isBase64Encoded", false);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        handler.handleRequest(new ByteArrayInputStream(JSON.writeValueAsBytes(event)), out, new TestContext());
        return JSON.readTree(out.toByteArray());
    }

    private static String body(JsonNode response) {
        String body = response.path("body").asText();
        return response.path("isBase64Encoded").asBoolean()
                ? new String(java.util.Base64.getDecoder().decode(body), StandardCharsets.UTF_8)
                : body;
    }

    /** Set-Cookie values wherever the adapter puts them (cookies, headers or multiValueHeaders). */
    private static List<String> setCookies(JsonNode response) {
        List<String> values = new ArrayList<>();
        response.path("cookies").forEach(c -> values.add(c.asText()));
        response.path("multiValueHeaders").fields().forEachRemaining(e -> {
            if (e.getKey().equalsIgnoreCase("set-cookie")) {
                e.getValue().forEach(v -> values.add(v.asText()));
            }
        });
        response.path("headers").fields().forEachRemaining(e -> {
            if (e.getKey().equalsIgnoreCase("set-cookie")) {
                values.add(e.getValue().asText());
            }
        });
        return values;
    }

    @Test
    void servesThePublishedPortfolio() throws Exception {
        JsonNode response = call("GET", "/api/v1/portfolio", Map.of("accept", "application/json"), List.of(), null);

        assertThat(response.path("statusCode").asInt()).isEqualTo(200);
        JsonNode portfolio = JSON.readTree(body(response));
        assertThat(portfolio.path("profile").path("fullName").asText()).isEqualTo("Paridarshan Sahoo");
        assertThat(portfolio.path("version").asInt()).isPositive();
    }

    @Test
    void studioSessionCookieIsSecureAndReachesApiGateway() throws Exception {
        JsonNode csrf = call("GET", "/api/v1/admin/auth/csrf", Map.of(), List.of(), null);
        assertThat(csrf.path("statusCode").asInt()).isEqualTo(200);

        List<String> cookies = setCookies(csrf);
        assertThat(cookies).anySatisfy(c -> assertThat(c)
                .startsWith("PORTFOLIO_SESSION=").contains("Secure").contains("HttpOnly").contains("SameSite=Strict"));

        // Sign in with the session cookie and the CSRF token, as the Studio does through the proxy.
        String sessionCookie = cookies.stream().filter(c -> c.startsWith("PORTFOLIO_SESSION=")).findFirst().orElseThrow()
                .split(";")[0];
        String token = JSON.readTree(body(csrf)).path("token").asText();
        JsonNode login = call("POST", "/api/v1/admin/auth/login",
                Map.of("content-type", "application/json", "x-csrf-token", token, "origin", "https://portfolio.example"),
                List.of(sessionCookie),
                "{\"email\":\"lambda-admin@test.local\",\"password\":\"lambda-test-password-1\"}");
        assertThat(login.path("statusCode").asInt()).as(body(login)).isEqualTo(200);

        String signedIn = setCookies(login).stream().filter(c -> c.startsWith("PORTFOLIO_SESSION=")).findFirst()
                .map(c -> c.split(";")[0]).orElse(sessionCookie);
        JsonNode me = call("GET", "/api/v1/admin/auth/me", Map.of(), List.of(signedIn), null);
        assertThat(me.path("statusCode").asInt()).isEqualTo(200);
        assertThat(body(me)).contains("lambda-admin@test.local");
    }

    @Test
    void contactUsesTheVisitorAddressForwardedByTheProxy() throws Exception {
        JsonNode response = call("POST", "/api/v1/contact",
                Map.of("content-type", "application/json", "origin", "https://portfolio.example",
                        "x-forwarded-for", "203.0.113.9, 76.76.21.21"),
                List.of(),
                "{\"name\":\"Lambda Visitor\",\"email\":\"visitor@example.com\",\"subject\":\"Hello\","
                        + "\"message\":\"Sent through the Lambda handler test.\",\"website\":\"\"}");
        assertThat(response.path("statusCode").asInt()).as(body(response)).isEqualTo(202);

        MessageDigest sha = MessageDigest.getInstance("SHA-256");
        sha.update(SALT.getBytes(StandardCharsets.UTF_8));
        String visitorHash = HexFormat.of().formatHex(sha.digest("203.0.113.9".getBytes(StandardCharsets.UTF_8)));
        try (var connection = java.sql.DriverManager.getConnection(db.getJdbcUrl(), db.getUsername(), db.getPassword());
             var statement = connection.prepareStatement("SELECT ip_hash FROM contact_message WHERE email = ?")) {
            statement.setString(1, "visitor@example.com");
            try (var rs = statement.executeQuery()) {
                assertThat(rs.next()).isTrue();
                assertThat(rs.getString(1)).isEqualTo(visitorHash);
            }
        }
    }

    @Test
    void unknownRoutesAndStudioWithoutSessionAreRefused() throws Exception {
        assertThat(call("GET", "/api/v1/admin/overview", Map.of(), List.of(), null).path("statusCode").asInt()).isEqualTo(401);
        assertThat(call("GET", "/api/v1/projects/nope", Map.of(), List.of(), null).path("statusCode").asInt()).isEqualTo(404);
    }

    /** Minimal Lambda context. */
    static final class TestContext implements Context {
        public String getAwsRequestId() { return "test"; }
        public String getLogGroupName() { return "test"; }
        public String getLogStreamName() { return "test"; }
        public String getFunctionName() { return "portfolio-backend"; }
        public String getFunctionVersion() { return "1"; }
        public String getInvokedFunctionArn() { return "arn:aws:lambda:ap-south-1:123456789012:function:portfolio-backend"; }
        public CognitoIdentity getIdentity() { return null; }
        public ClientContext getClientContext() { return null; }
        public int getRemainingTimeInMillis() { return 30_000; }
        public int getMemoryLimitInMB() { return 2048; }
        public LambdaLogger getLogger() {
            return new LambdaLogger() {
                public void log(String message) { System.out.print(message); }
                public void log(byte[] message) { System.out.print(new String(message, StandardCharsets.UTF_8)); }
            };
        }
    }
}
