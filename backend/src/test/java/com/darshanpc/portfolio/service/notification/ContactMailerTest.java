package com.darshanpc.portfolio.service.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import com.darshanpc.portfolio.security.PasswordAndHashingTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;

/** Unit tests for header safety and configuration checks of the mailer. */
class ContactMailerTest {

    @Test
    void headerValuesCannotSpanLines() {
        assertThat(ContactMailer.oneLine("Hi\r\nBcc: victim@example.com", 200)).isEqualTo("Hi Bcc: victim@example.com");
        assertThat(ContactMailer.oneLine("tab\tand\u0000null", 200)).isEqualTo("tab and null");
        assertThat(ContactMailer.oneLine("x".repeat(300), 10)).hasSize(10).endsWith("…");
        assertThat(ContactMailer.oneLine(null, 10)).isEmpty();
    }

    @Test
    void onlySingleStrictAddressesAreAccepted() {
        assertThat(ContactMailer.strictAddress("ada@example.com")).isPresent();
        assertThat(ContactMailer.strictAddress("a@b.com, c@d.com")).isEmpty();
        assertThat(ContactMailer.strictAddress("ada@example.com\r\nBcc: x@y.com")).isEmpty();
        assertThat(ContactMailer.strictAddress("not an address")).isEmpty();
        assertThat(ContactMailer.strictAddress(null)).isEmpty();
    }

    @Test
    @SuppressWarnings("unchecked")
    void configuredOnlyWithHostUsernameAndPassword() {
        ObjectProvider<JavaMailSender> provider = mock(ObjectProvider.class);
        org.mockito.Mockito.when(provider.getIfAvailable()).thenReturn(mock(JavaMailSender.class));
        var properties = PasswordAndHashingTest.properties("salt", "target/x");

        assertThat(new ContactMailer(provider, properties, "smtp.gmail.com", "me@gmail.com", "app-pass", "").isConfigured()).isTrue();
        assertThat(new ContactMailer(provider, properties, "", "me@gmail.com", "app-pass", "").isConfigured()).isFalse();
        assertThat(new ContactMailer(provider, properties, "smtp.gmail.com", "me@gmail.com", " ", "").isConfigured()).isFalse();

        ContactMailer withFrom = new ContactMailer(provider, properties, "smtp.example.com", "login", "p", "site@example.com");
        assertThat(withFrom.fromAddress()).isEqualTo("site@example.com");
        assertThat(new ContactMailer(provider, properties, "smtp.gmail.com", "me@gmail.com", "p", "").fromAddress())
                .isEqualTo("me@gmail.com");
    }
}
