package com.darshanpc.portfolio.service.notification;

import com.darshanpc.portfolio.config.PortfolioProperties;
import com.darshanpc.portfolio.entity.ContactMessage;
import jakarta.mail.AuthenticationFailedException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.net.ConnectException;
import java.net.SocketTimeoutException;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

/**
 * Sends notification emails through the owner's own SMTP mailbox
 * ({@code MAIL_HOST}, {@code MAIL_USERNAME}, {@code MAIL_PASSWORD} — environment only).
 *
 * <p>Security:
 * <ul>
 *   <li>"From" is always the owner's address (sending as the visitor would fail SPF/DMARC and
 *       could be abused); the visitor's address goes in "Reply-To", parsed strictly.</li>
 *   <li>Plain text only, so nothing a visitor typed can render as HTML or load remote content.</li>
 *   <li>Header values are reduced to one line, so no extra headers can be injected.</li>
 *   <li>TLS is required and timeouts are short (see {@code spring.mail.*} in application.yml).</li>
 * </ul>
 */
@Component
public class ContactMailer {

    private static final DateTimeFormatter RECEIVED =
            DateTimeFormatter.ofPattern("d MMM yyyy, HH:mm 'UTC'").withZone(ZoneOffset.UTC);

    private final ObjectProvider<JavaMailSender> senders;
    private final String host;
    private final String username;
    private final String password;
    private final String from;
    private final String studioUrl;

    public ContactMailer(
            ObjectProvider<JavaMailSender> senders,
            PortfolioProperties properties,
            @Value("${spring.mail.host:}") String host,
            @Value("${spring.mail.username:}") String username,
            @Value("${spring.mail.password:}") String password,
            @Value("${portfolio.mail.from:}") String from) {
        this.senders = senders;
        this.host = host == null ? "" : host.strip();
        this.username = username == null ? "" : username.strip();
        this.password = password == null ? "" : password;
        this.from = from == null ? "" : from.strip();
        String site = properties.cors().allowedOrigins().isEmpty() ? "" : properties.cors().allowedOrigins().get(0);
        this.studioUrl = site.replaceAll("/+$", "") + "/admin/messages";
    }

    /** True when SMTP host, username and password are all set. */
    public boolean isConfigured() {
        return !host.isEmpty() && !username.isEmpty() && !password.isBlank() && senders.getIfAvailable() != null;
    }

    /** The address notifications are sent from (MAIL_FROM, else MAIL_USERNAME). */
    public String fromAddress() {
        return from.isEmpty() ? username : from;
    }

    public String host() {
        return host;
    }

    /** Emails a received contact message to {@code to}. */
    public void sendNotification(ContactMessage message, String to) {
        String subject = "New message from your portfolio: " + oneLine(message.getSubject(), 120);
        String body = """
                You have a new message from the contact form on your portfolio.

                From:     %s <%s>
                Subject:  %s
                Received: %s

                ----------------------------------------------------------------
                %s
                ----------------------------------------------------------------

                Reply to this email to answer %s directly.
                All messages: %s
                """.formatted(
                oneLine(message.getName(), 80),
                message.getEmail(),
                oneLine(message.getSubject(), 120),
                message.getCreatedAt() == null ? "just now" : RECEIVED.format(message.getCreatedAt()),
                message.getMessage(),
                oneLine(message.getName(), 80),
                studioUrl);
        send(to, subject, body, replyTo(message));
    }

    /** A short email that proves the settings work. */
    public void sendTest(String to) {
        send(to, "Test email from your portfolio",
                """
                This is a test from Portfolio Studio.

                If you can read this, new contact form messages will be emailed to %s.
                """.formatted(to),
                Optional.empty());
    }

    private void send(String to, String subject, String body, Optional<InternetAddress> replyTo) {
        JavaMailSender sender = senders.getIfAvailable();
        if (!isConfigured() || sender == null) {
            throw new MailDeliveryException("Email sending is not configured on the server.");
        }
        try {
            MimeMessage mime = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mime, false, StandardCharsets.UTF_8.name());
            helper.setFrom(new InternetAddress(fromAddress(), "Portfolio contact form", StandardCharsets.UTF_8.name()));
            helper.setTo(strictAddress(to).orElseThrow(() -> new MailDeliveryException("The recipient address is not valid.")));
            if (replyTo.isPresent()) {
                helper.setReplyTo(replyTo.get());
            }
            helper.setSubject(subject);
            helper.setText(body, false);
            // Tell mail servers and auto-responders this is machine-generated.
            mime.setHeader("Auto-Submitted", "auto-generated");
            mime.setHeader("X-Auto-Response-Suppress", "All");
            sender.send(mime);
        } catch (MailException | MessagingException | UnsupportedEncodingException e) {
            throw new MailDeliveryException(describe(e), e);
        }
    }

    /** The visitor's address (with their name) for Reply-To, only if it parses strictly. */
    private static Optional<InternetAddress> replyTo(ContactMessage message) {
        return strictAddress(message.getEmail()).map(address -> {
            try {
                return new InternetAddress(address.getAddress(), oneLine(message.getName(), 80), StandardCharsets.UTF_8.name());
            } catch (UnsupportedEncodingException e) {
                return address;
            }
        });
    }

    /** The address if it parses strictly as a single mailbox (no display names, no control characters). */
    public static Optional<InternetAddress> strictAddress(String value) {
        if (value == null || value.isBlank() || value.chars().anyMatch(Character::isISOControl)) {
            return Optional.empty();
        }
        try {
            InternetAddress address = new InternetAddress(value.strip(), true);
            address.validate();
            return address.getAddress().contains("@") ? Optional.of(address) : Optional.empty();
        } catch (AddressException e) {
            return Optional.empty();
        }
    }

    /** One line of text: control characters (CR, LF, tabs …) become spaces, then trimmed and shortened. */
    public static String oneLine(String value, int max) {
        if (value == null) {
            return "";
        }
        String line = value.replaceAll("\\p{Cntrl}+", " ").replaceAll(" {2,}", " ").strip();
        return line.length() > max ? line.substring(0, max - 1) + "…" : line;
    }

    /** A short, credential-free reason an administrator can act on. */
    public static String describe(Throwable error) {
        for (Throwable t = error; t != null; t = t.getCause()) {
            if (t instanceof AuthenticationFailedException
                    || t instanceof org.springframework.mail.MailAuthenticationException) {
                return "The mail server rejected the username or password (for Gmail, use an app password).";
            }
            if (t instanceof UnknownHostException) {
                return "The mail server address could not be found (check MAIL_HOST).";
            }
            if (t instanceof ConnectException || t instanceof SocketTimeoutException) {
                return "Could not connect to the mail server (check MAIL_HOST and MAIL_PORT).";
            }
        }
        Throwable root = error;
        while (root.getCause() != null && root.getCause() != root) {
            root = root.getCause();
        }
        String detail = root.getMessage() == null ? root.getClass().getSimpleName() : oneLine(root.getMessage(), 200);
        return "The email could not be sent: " + detail;
    }

    /** Sending failed; the message is safe to show to an administrator. */
    public static class MailDeliveryException extends RuntimeException {
        public MailDeliveryException(String message) {
            super(message);
        }

        public MailDeliveryException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
