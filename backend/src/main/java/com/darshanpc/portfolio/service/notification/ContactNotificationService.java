package com.darshanpc.portfolio.service.notification;

import com.darshanpc.portfolio.entity.ContactMessage;
import com.darshanpc.portfolio.entity.NotificationSettings;
import com.darshanpc.portfolio.entity.enums.EmailDeliveryStatus;
import com.darshanpc.portfolio.exception.ResourceNotFoundException;
import com.darshanpc.portfolio.repository.ContactMessageRepository;
import com.darshanpc.portfolio.repository.NotificationSettingsRepository;
import java.time.Clock;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Emails new contact messages to the owner.
 *
 * <p>The message is always stored first. Only after that transaction commits is the
 * email sent, on a background thread, so a slow or failing mail server never delays
 * the visitor or loses a message. The outcome (SENT / FAILED + reason) is recorded on
 * the message and shown in Portfolio Studio, where a failed email can be sent again.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContactNotificationService {

    private final ContactMessageRepository messages;
    private final NotificationSettingsRepository settingsRepository;
    private final ContactMailer mailer;
    private final ApplicationEventPublisher events;
    private final PlatformTransactionManager transactionManager;
    private final Clock clock;

    /** Published inside the transaction that stored the message. */
    public record MessageStored(UUID messageId) {
    }

    /** Called by ContactService in the same transaction that stores {@code message}. */
    public void messageStored(ContactMessage message) {
        NotificationSettings settings = settings();
        if (!settings.isEmailEnabled() || !mailer.isConfigured()) {
            return;   // stays NOT_SENT
        }
        message.setEmailStatus(EmailDeliveryStatus.PENDING);
        events.publishEvent(new MessageStored(message.getId()));
    }

    @Async("mailExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMessageStored(MessageStored event) {
        try {
            deliver(event.messageId());
        } catch (RuntimeException e) {
            log.warn("Notification for message {} failed: {}", event.messageId(), e.getMessage());
        }
    }

    /**
     * Sends (or re-sends) the notification for one message and records the outcome.
     * Returns the updated message; throws {@link ContactMailer.MailDeliveryException} on failure.
     */
    public ContactMessage deliver(UUID messageId) {
        TransactionTemplate tx = new TransactionTemplate(transactionManager);
        ContactMessage message = tx.execute(status -> messages.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message", messageId.toString())));
        String recipient = recipient();
        try {
            mailer.sendNotification(message, recipient);
            return tx.execute(status -> record(messageId, EmailDeliveryStatus.SENT, null));
        } catch (ContactMailer.MailDeliveryException e) {
            tx.executeWithoutResult(status -> record(messageId, EmailDeliveryStatus.FAILED, e.getMessage()));
            throw e;
        }
    }

    /** Where notifications go: the configured recipient, else the sending mailbox. */
    public String recipient() {
        String configured = settings().getRecipientEmail();
        return configured == null || configured.isBlank() ? mailer.fromAddress() : configured;
    }

    private ContactMessage record(UUID id, EmailDeliveryStatus status, String error) {
        ContactMessage message = messages.findById(id).orElseThrow(() -> new ResourceNotFoundException("Message", id.toString()));
        message.setEmailStatus(status);
        message.setEmailError(error == null ? null : ContactMailer.oneLine(error, 300));
        if (status == EmailDeliveryStatus.SENT) {
            message.setEmailedAt(clock.instant());
        }
        return messages.save(message);
    }

    private NotificationSettings settings() {
        return settingsRepository.findFirstBy().orElseThrow(() -> new IllegalStateException("No notification settings row"));
    }
}
