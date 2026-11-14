-- Email notifications for contact form messages.

-- Single row: whether new messages are emailed, and to which address
-- (NULL = the mailbox the site sends from). SMTP credentials are never stored here.
CREATE TABLE notification_settings (
    id              uuid         PRIMARY KEY,
    singleton_key   integer      NOT NULL DEFAULT 1,
    email_enabled   boolean      NOT NULL DEFAULT false,
    recipient_email varchar(254),
    created_at      timestamptz  NOT NULL DEFAULT now(),
    updated_at      timestamptz  NOT NULL DEFAULT now(),
    version         bigint       NOT NULL DEFAULT 0,
    CONSTRAINT ux_notification_settings_singleton UNIQUE (singleton_key),
    CONSTRAINT ck_notification_settings_singleton CHECK (singleton_key = 1)
);
INSERT INTO notification_settings (id) VALUES (gen_random_uuid());

-- Delivery state of the notification email for each message.
ALTER TABLE contact_message
    ADD COLUMN email_status varchar(20)  NOT NULL DEFAULT 'NOT_SENT',
    ADD COLUMN emailed_at   timestamptz,
    ADD COLUMN email_error  varchar(300),
    ADD CONSTRAINT ck_contact_message_email_status
        CHECK (email_status IN ('NOT_SENT', 'PENDING', 'SENT', 'FAILED'));
