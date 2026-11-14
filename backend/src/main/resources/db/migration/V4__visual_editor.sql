-- =====================================================================
-- Visual editor (Batch 5)
--   * Appearance: custom background and text colours, body typeface,
--     corner style.
--   * element_style: per-element formatting set in the visual editor
--     (colour, size, weight, alignment, typeface), keyed by the element's
--     editor id, e.g. "hero.greeting" or "section.about.heading".
-- =====================================================================

ALTER TABLE portfolio_appearance
    ADD COLUMN background_color varchar(7),
    ADD COLUMN text_color       varchar(7),
    ADD COLUMN body_font        varchar(20) NOT NULL DEFAULT 'SANS',
    ADD COLUMN corner_style     varchar(20) NOT NULL DEFAULT 'SOFT',
    ADD CONSTRAINT ck_appearance_background_color CHECK (background_color IS NULL OR background_color ~ '^#[0-9a-fA-F]{6}$'),
    ADD CONSTRAINT ck_appearance_text_color CHECK (text_color IS NULL OR text_color ~ '^#[0-9a-fA-F]{6}$'),
    ADD CONSTRAINT ck_appearance_body_font CHECK (body_font IN ('SANS', 'SERIF')),
    ADD CONSTRAINT ck_appearance_corner_style CHECK (corner_style IN ('SHARP', 'SOFT', 'ROUND'));

CREATE TABLE element_style (
    element_key varchar(120) PRIMARY KEY,
    color       varchar(7),
    font_scale  numeric(3, 2),
    font_weight integer,
    text_align  varchar(10),
    font_family varchar(10),
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    version     bigint      NOT NULL DEFAULT 0,
    CONSTRAINT ck_element_style_key CHECK (element_key ~ '^[a-z][A-Za-z0-9.-]{0,119}$'),
    CONSTRAINT ck_element_style_color CHECK (color IS NULL OR color ~ '^#[0-9a-fA-F]{6}$'),
    CONSTRAINT ck_element_style_scale CHECK (font_scale IS NULL OR font_scale BETWEEN 0.75 AND 1.50),
    CONSTRAINT ck_element_style_weight CHECK (font_weight IS NULL OR font_weight IN (300, 400, 500, 600, 700)),
    CONSTRAINT ck_element_style_align CHECK (text_align IS NULL OR text_align IN ('start', 'center', 'end')),
    CONSTRAINT ck_element_style_family CHECK (font_family IS NULL OR font_family IN ('sans', 'serif')),
    CONSTRAINT ck_element_style_not_empty CHECK (
        color IS NOT NULL OR font_scale IS NOT NULL OR font_weight IS NOT NULL
        OR text_align IS NOT NULL OR font_family IS NOT NULL)
);
