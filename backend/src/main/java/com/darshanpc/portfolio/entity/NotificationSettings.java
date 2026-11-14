package com.darshanpc.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Email notification preferences for contact messages. Single row; no credentials. */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "notification_settings")
public class NotificationSettings extends BaseEntity {

    @Column(name = "email_enabled", nullable = false)
    private boolean emailEnabled;

    /** Where notifications go; null means the address the site sends from. */
    @Column(name = "recipient_email", length = 254)
    private String recipientEmail;
}
