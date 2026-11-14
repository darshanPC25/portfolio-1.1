package com.darshanpc.portfolio.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.darshanpc.portfolio.IntegrationTest;
import com.darshanpc.portfolio.admin.AdminSession;
import com.darshanpc.portfolio.entity.ContactMessage;
import com.darshanpc.portfolio.entity.enums.EmailDeliveryStatus;
import com.darshanpc.portfolio.repository.ContactMessageRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.icegreen.greenmail.configuration.GreenMailConfiguration;
import com.icegreen.greenmail.junit5.GreenMailExtension;
import com.icegreen.greenmail.util.ServerSetupTest;
import jakarta.mail.Address;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.function.Supplier;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.RegisterExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Contact form → email to the owner, against a real (in-process) SMTP server
 * that requires the configured username and password.
 */
@IntegrationTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestPropertySource(properties = {
        "spring.mail.host=127.0.0.1",
        "spring.mail.port=3025",
        "spring.mail.username=owner@test.local",
        "spring.mail.password=smtp-test-secret",
        // The test server speaks plain SMTP; production requires STARTTLS.
        "spring.mail.properties.mail.smtp.starttls.enable=false",
        "spring.mail.properties.mail.smtp.starttls.required=false",
})
class ContactEmailNotificationTest {

    @RegisterExtension
    static GreenMailExtension smtp = new GreenMailExtension(ServerSetupTest.SMTP)
            .withConfiguration(GreenMailConfiguration.aConfig().withUser("owner@test.local", "owner@test.local", "smtp-test-secret"));

    @Autowired
    MockMvc mvc;

    @Autowired
    ObjectMapper json;

    @Autowired
    ContactMessageRepository messages;

    AdminSession admin;

    @BeforeEach
    void signIn() throws Exception {
        admin = AdminSession.signIn(mvc, json);
    }

    @AfterEach
    void turnOff() throws Exception {
        admin.put("/api/v1/admin/notifications", Map.of("emailEnabled", false)).andExpect(status().isOk());
    }

    private void submit(String name, String email, String subject, String ip) throws Exception {
        String body = json.writeValueAsString(Map.of(
                "name", name, "email", email, "subject", subject,
                "message", "Hello Darshan,\nI'd like to talk about a backend role.\n<script>alert(1)</script>",
                "website", ""));
        mvc.perform(post("/api/v1/contact").contentType(MediaType.APPLICATION_JSON).content(body)
                        .with(r -> {
                            r.setRemoteAddr(ip);
                            return r;
                        }))
                .andExpect(status().isAccepted());
    }

    private ContactMessage stored(String email) {
        return messages.findAll().stream().filter(m -> m.getEmail().equals(email)).findFirst().orElseThrow();
    }

    private static <T> T await(Supplier<T> value, java.util.function.Predicate<T> done) throws InterruptedException {
        Instant end = Instant.now().plus(Duration.ofSeconds(10));
        T current = value.get();
        while (!done.test(current) && Instant.now().isBefore(end)) {
            Thread.sleep(100);
            current = value.get();
        }
        return current;
    }

    @Test
    void settingsShowTheMailboxButNeverTheCredentials() throws Exception {
        String body = admin.get("/api/v1/admin/notifications")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.smtpConfigured").value(true))
                .andExpect(jsonPath("$.fromAddress").value("owner@test.local"))
                .andExpect(jsonPath("$.effectiveRecipient").value("owner@test.local"))
                .andExpect(jsonPath("$.emailEnabled").value(false))
                .andReturn().getResponse().getContentAsString();
        assertThat(body).doesNotContain("smtp-test-secret").doesNotContainIgnoringCase("password");

        admin.put("/api/v1/admin/notifications", Map.of("emailEnabled", true, "recipientEmail", "not an email"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.recipientEmail").exists());
    }

    @Test
    void messagesAreOnlyStoredWhileNotificationsAreOff() throws Exception {
        submit("Quiet Visitor", "quiet@example.com", "No email please", "203.0.113.11");

        assertThat(stored("quiet@example.com").getEmailStatus()).isEqualTo(EmailDeliveryStatus.NOT_SENT);
        Thread.sleep(500);
        assertThat(smtp.getReceivedMessages()).isEmpty();
    }

    @Test
    void newMessageIsEmailedToTheOwnerWithReplyToTheVisitor() throws Exception {
        admin.put("/api/v1/admin/notifications", Map.of("emailEnabled", true, "recipientEmail", "darshan@test.local"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.effectiveRecipient").value("darshan@test.local"));

        submit("Ada Lovelace", "ada@example.com", "Backend role", "203.0.113.12");

        assertThat(smtp.waitForIncomingEmail(10_000, 1)).isTrue();
        MimeMessage mail = smtp.getReceivedMessages()[0];
        assertThat(((InternetAddress) mail.getFrom()[0]).getAddress()).isEqualTo("owner@test.local");
        assertThat(mail.getAllRecipients()).extracting(Address::toString).containsExactly("darshan@test.local");
        assertThat(((InternetAddress) mail.getReplyTo()[0]).getAddress()).isEqualTo("ada@example.com");
        assertThat(mail.getSubject()).isEqualTo("New message from your portfolio: Backend role");
        assertThat(mail.getContentType()).startsWith("text/plain");
        String text = (String) mail.getContent();
        assertThat(text).contains("Ada Lovelace <ada@example.com>", "I'd like to talk about a backend role.",
                "<script>alert(1)</script>");   // shown as plain text, never rendered
        assertThat(mail.getHeader("Auto-Submitted")[0]).isEqualTo("auto-generated");

        ContactMessage message = await(() -> stored("ada@example.com"), m -> m.getEmailStatus() == EmailDeliveryStatus.SENT);
        assertThat(message.getEmailStatus()).isEqualTo(EmailDeliveryStatus.SENT);
        assertThat(message.getEmailedAt()).isNotNull();
        admin.get("/api/v1/admin/messages/{id}", message.getId()).andExpect(jsonPath("$.emailStatus").value("SENT"));
    }

    @Test
    void testEmailGoesToTheMailboxWhenNoRecipientIsSet() throws Exception {
        admin.post("/api/v1/admin/notifications/test", Map.of())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sentTo").value("owner@test.local"));
        assertThat(smtp.waitForIncomingEmail(5_000, 1)).isTrue();
        assertThat(smtp.getReceivedMessages()[0].getSubject()).isEqualTo("Test email from your portfolio");
    }

    @Test
    void failedDeliveryIsRecordedAndCanBeRetried() throws Exception {
        admin.put("/api/v1/admin/notifications", Map.of("emailEnabled", true)).andExpect(status().isOk());
        smtp.stop();   // mail server down

        submit("Grace Hopper", "grace@example.com", "Hello", "203.0.113.13");
        ContactMessage failed = await(() -> stored("grace@example.com"), m -> m.getEmailStatus() == EmailDeliveryStatus.FAILED);
        assertThat(failed.getEmailStatus()).isEqualTo(EmailDeliveryStatus.FAILED);
        assertThat(failed.getEmailError()).contains("Could not connect to the mail server");
        UUID id = failed.getId();

        // The message itself is safe in the inbox; a retry still fails while the server is down.
        admin.post("/api/v1/admin/messages/{id}/email", Map.of(), id)
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.detail").value(org.hamcrest.Matchers.containsString("Could not connect")));

        smtp.start();
        admin.post("/api/v1/admin/messages/{id}/email", Map.of(), id)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.emailStatus").value("SENT"))
                .andExpect(jsonPath("$.emailError").doesNotExist());
        assertThat(smtp.waitForIncomingEmail(5_000, 1)).isTrue();
    }

    @Test
    void wrongSmtpPasswordIsReportedPlainly() {
        assertThat(com.darshanpc.portfolio.service.notification.ContactMailer.describe(
                new org.springframework.mail.MailAuthenticationException("535 bad credentials")))
                .contains("rejected the username or password");
    }
}
