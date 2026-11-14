package com.darshanpc.portfolio.admin.notifications;

import com.darshanpc.portfolio.entity.NotificationSettings;
import com.darshanpc.portfolio.exception.BadRequestException;
import com.darshanpc.portfolio.repository.NotificationSettingsRepository;
import com.darshanpc.portfolio.service.notification.ContactMailer;
import com.darshanpc.portfolio.service.notification.ContactNotificationService;
import com.darshanpc.portfolio.util.Texts;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Email notification settings for contact messages. Administrators choose whether
 * messages are emailed and to which address; the SMTP account itself (and its
 * password) is configured only in the server environment and never exposed here.
 */
@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
@Tag(name = "Studio: messages")
public class NotificationAdminController {

    private final NotificationSettingsRepository settings;
    private final ContactMailer mailer;
    private final ContactNotificationService notifications;

    /**
     * @param smtpConfigured  whether MAIL_HOST / MAIL_USERNAME / MAIL_PASSWORD are set on the server
     * @param fromAddress     the mailbox messages are sent from (null when not configured)
     * @param effectiveRecipient where notifications actually go
     */
    public record NotificationSettingsResponse(
            boolean emailEnabled,
            String recipientEmail,
            String effectiveRecipient,
            boolean smtpConfigured,
            String smtpHost,
            String fromAddress,
            Instant updatedAt) {
    }

    public record NotificationSettingsRequest(
            boolean emailEnabled,
            @Email(message = "Enter a valid email address.") @Size(max = 254) String recipientEmail) {
    }

    public record TestResult(String sentTo) {
    }

    @GetMapping
    @Transactional(readOnly = true)
    public NotificationSettingsResponse get() {
        return toResponse(row());
    }

    @PutMapping
    @Transactional
    @Operation(summary = "Turn email notifications on or off and choose the recipient")
    public NotificationSettingsResponse update(@Valid @RequestBody NotificationSettingsRequest request) {
        if (request.emailEnabled() && !mailer.isConfigured()) {
            throw new BadRequestException(
                    "Email sending is not set up on the server yet (MAIL_HOST, MAIL_USERNAME and MAIL_PASSWORD).",
                    "emailEnabled");
        }
        String recipient = Texts.blankToNull(Texts.strip(request.recipientEmail()));
        if (recipient != null && ContactMailer.strictAddress(recipient).isEmpty()) {
            throw new BadRequestException("Enter a valid email address.", "recipientEmail");
        }
        NotificationSettings row = row();
        row.setEmailEnabled(request.emailEnabled());
        row.setRecipientEmail(recipient);
        return toResponse(settings.saveAndFlush(row));
    }

    @PostMapping("/test")
    @Operation(summary = "Send a test email to the notification recipient")
    public TestResult sendTest() {
        if (!mailer.isConfigured()) {
            throw new BadRequestException("Email sending is not set up on the server yet.", "emailEnabled");
        }
        String to = notifications.recipient();
        mailer.sendTest(to);
        return new TestResult(to);
    }

    private NotificationSettings row() {
        return settings.findFirstBy().orElseThrow(() -> new IllegalStateException("No notification settings row"));
    }

    private NotificationSettingsResponse toResponse(NotificationSettings s) {
        boolean configured = mailer.isConfigured();
        String from = configured ? mailer.fromAddress() : null;
        String recipient = s.getRecipientEmail();
        return new NotificationSettingsResponse(
                s.isEmailEnabled(),
                recipient,
                recipient != null ? recipient : from,
                configured,
                configured ? mailer.host() : null,
                from,
                s.getUpdatedAt());
    }
}
