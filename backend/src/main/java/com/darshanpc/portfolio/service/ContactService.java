package com.darshanpc.portfolio.service;

import com.darshanpc.portfolio.dto.contact.ContactRequest;
import com.darshanpc.portfolio.entity.ContactMessage;
import com.darshanpc.portfolio.exception.RateLimitExceededException;
import com.darshanpc.portfolio.repository.ContactMessageRepository;
import com.darshanpc.portfolio.security.IpAddressHasher;
import com.darshanpc.portfolio.service.notification.ContactNotificationService;
import com.darshanpc.portfolio.security.ratelimit.RateLimiter;
import com.darshanpc.portfolio.util.Texts;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Accepts contact form messages: rate limits, filters obvious spam, stores the rest and notifies the owner. */
@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private static final int USER_AGENT_MAX_LENGTH = 300;

    private final ContactMessageRepository messages;
    private final RateLimiter contactRateLimiter;
    private final RateLimiter contactGlobalRateLimiter;
    private final IpAddressHasher ipAddressHasher;
    private final ContactNotificationService notifications;

    /** Client details taken from the HTTP request. */
    public record ClientInfo(String ipAddress, String userAgent) {
    }

    @Transactional
    public void submit(ContactRequest request, ClientInfo client) {
        contactRateLimiter.tryAcquire("contact:" + client.ipAddress()).ifPresent(retryAfter -> {
            throw new RateLimitExceededException(retryAfter);
        });
        contactGlobalRateLimiter.tryAcquire("all").ifPresent(retryAfter -> {
            throw new RateLimitExceededException(retryAfter);
        });

        if (request.isLikelySpam()) {
            // Respond exactly as for a real message so automated senders learn nothing.
            log.info("Discarded a contact submission that filled the anti-spam field");
            return;
        }

        ContactMessage message = new ContactMessage();
        message.setName(request.name());
        message.setEmail(request.email());
        message.setSubject(request.subject());
        message.setMessage(request.message());
        message.setIpHash(ipAddressHasher.hash(client.ipAddress()));
        message.setUserAgent(Texts.truncate(client.userAgent(), USER_AGENT_MAX_LENGTH));
        messages.save(message);
        // Emailed to the owner after this transaction commits (if notifications are on).
        notifications.messageStored(message);
        log.debug("Stored contact message {}", message.getId());
    }
}
