package com.darshanpc.portfolio.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.darshanpc.portfolio.IntegrationTest;
import com.darshanpc.portfolio.entity.ContactMessage;
import com.darshanpc.portfolio.entity.enums.ContactMessageStatus;
import com.darshanpc.portfolio.repository.ContactMessageRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@IntegrationTest
class ContactApiTest {

    private static final String VALID = """
            {"name":"  Test Visitor ","email":"visitor@example.com","subject":"Hello there",
             "message":"This is a test message from the integration test."}
            """;

    @Autowired
    MockMvc mvc;

    @Autowired
    ContactMessageRepository messages;

    @Test
    void validMessageIsStoredWithHashedIp() throws Exception {
        long before = messages.count();

        mvc.perform(contact(VALID, "198.51.100.10"))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.message").value("Thank you — your message has been received."));

        assertThat(messages.count()).isEqualTo(before + 1);
        ContactMessage stored = messages.findAll().stream()
                .filter(m -> "Hello there".equals(m.getSubject()))
                .findFirst()
                .orElseThrow();
        assertThat(stored.getName()).isEqualTo("Test Visitor");
        assertThat(stored.getStatus()).isEqualTo(ContactMessageStatus.NEW);
        assertThat(stored.getIpHash()).hasSize(64).doesNotContain("198.51.100.10");
        assertThat(stored.getUserAgent()).isEqualTo("JUnit");
        assertThat(stored.getCreatedAt()).isNotNull();
    }

    @Test
    void invalidFieldsReturnFieldErrors() throws Exception {
        String invalid = """
                {"name":"","email":"not-an-email","subject":"Hi\\nBcc: x@example.com","message":"short"}
                """;
        long before = messages.count();

        mvc.perform(contact(invalid, "198.51.100.11"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.title").value("Validation failed"))
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.errors.email").value("Please enter a valid email address."))
                .andExpect(jsonPath("$.errors.subject").value("Subject must be a single line."))
                .andExpect(jsonPath("$.errors.message").exists());

        assertThat(messages.count()).isEqualTo(before);
    }

    @Test
    void malformedJsonIsBadRequest() throws Exception {
        mvc.perform(contact("{not json", "198.51.100.12")).andExpect(status().isBadRequest());
    }

    @Test
    void honeypotSubmissionIsAcceptedButNotStored() throws Exception {
        String bot = """
                {"name":"Bot","email":"bot@example.com","subject":"Buy now",
                 "message":"Automated message that fills every field.","website":"http://spam.example"}
                """;
        long before = messages.count();

        mvc.perform(contact(bot, "198.51.100.13")).andExpect(status().isAccepted());

        assertThat(messages.count()).isEqualTo(before);
    }

    @Test
    void fourthMessageWithinWindowIsRateLimited() throws Exception {
        String ip = "198.51.100.14";
        for (int i = 0; i < 3; i++) {
            mvc.perform(contact(VALID, ip)).andExpect(status().isAccepted());
        }
        mvc.perform(contact(VALID, ip))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.title").value("Too many requests"));

        // A different sender is unaffected.
        mvc.perform(contact(VALID, "198.51.100.15")).andExpect(status().isAccepted());
    }

    private static MockHttpServletRequestBuilder contact(String body, String remoteAddress) {
        return post("/api/v1/contact")
                .contentType(MediaType.APPLICATION_JSON)
                .header("User-Agent", "JUnit")
                .content(body)
                .with(request -> {
                    request.setRemoteAddr(remoteAddress);
                    return request;
                });
    }
}
