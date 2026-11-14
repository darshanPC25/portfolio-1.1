package com.darshanpc.portfolio.entity.enums;

/** Whether the notification email for a contact message went out. */
public enum EmailDeliveryStatus {
    /** Email notifications were off or not configured when the message arrived. */
    NOT_SENT,
    /** Queued; the email is being sent in the background. */
    PENDING,
    SENT,
    FAILED
}
