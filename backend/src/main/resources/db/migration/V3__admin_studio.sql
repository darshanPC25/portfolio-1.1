-- =====================================================================
-- Portfolio Studio (Batch 4)
--   * Appearance: accent colour, background tone, heading typeface.
--   * draft_state: when the draft was last changed, so the studio can tell
--     whether there are unpublished changes (deletions included).
-- =====================================================================

ALTER TABLE portfolio_appearance
    ADD COLUMN accent_color     varchar(7)  NOT NULL DEFAULT '#6f8446',
    ADD COLUMN background_style varchar(20) NOT NULL DEFAULT 'IVORY',
    ADD COLUMN heading_font     varchar(20) NOT NULL DEFAULT 'SANS',
    ADD CONSTRAINT ck_appearance_accent_color CHECK (accent_color ~ '^#[0-9a-fA-F]{6}$'),
    ADD CONSTRAINT ck_appearance_background_style CHECK (background_style IN ('IVORY', 'CREAM', 'MIST')),
    ADD CONSTRAINT ck_appearance_heading_font CHECK (heading_font IN ('SANS', 'SERIF'));

CREATE TABLE draft_state (
    id               integer     PRIMARY KEY,
    last_modified_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ck_draft_state_singleton CHECK (id = 1)
);
INSERT INTO draft_state (id, last_modified_at) VALUES (1, now());
