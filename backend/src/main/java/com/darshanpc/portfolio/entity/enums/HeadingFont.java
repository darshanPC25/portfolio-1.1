package com.darshanpc.portfolio.entity.enums;

import java.util.Locale;

/** Typeface for section headings: modern sans (Outfit) or editorial serif (Instrument Serif). */
public enum HeadingFont {
    SANS,
    SERIF;

    public String publicValue() {
        return name().toLowerCase(Locale.ROOT);
    }
}
