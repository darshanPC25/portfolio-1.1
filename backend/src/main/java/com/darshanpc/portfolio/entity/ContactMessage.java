package com.darshanpc.portfolio.entity;

import com.darshanpc.portfolio.entity.enums.ContactMessageStatus;
import com.darshanpc.portfolio.entity.enums.EmailDeliveryStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** A message sent through the public contact form. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "contact_message")
public class ContactMessage extends BaseEntity {

    @Column(name = "name", nullable = false, length = 80)
    private String name;

    @Column(name = "email", nullable = false, length = 254)
    private String email;

    @Column(name = "subject", nullable = false, length = 120)
    private String subject;

    @Column(name = "message", nullable = false, columnDefinition = "text")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ContactMessageStatus status = ContactMessageStatus.NEW;

    /** Salted SHA-256 of the sender's IP address; the raw address is never stored. */
    @Column(name = "ip_hash", length = 64)
    private String ipHash;

    @Column(name = "user_agent", length = 300)
    private String userAgent;

    @Column(name = "read_at")
    private Instant readAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "email_status", nullable = false, length = 20)
    private EmailDeliveryStatus emailStatus = EmailDeliveryStatus.NOT_SENT;

    @Column(name = "emailed_at")
    private Instant emailedAt;

    /** Short reason when the notification email failed. */
    @Column(name = "email_error", length = 300)
    private String emailError;
}
