package com.darshanpc.portfolio.entity.enums;

import java.util.Locale;

/** Page background tone. All three stay within the warm ivory/sage palette. */
public enum BackgroundStyle {
    IVORY,
    CREAM,
    MIST;

    public String publicValue() {
        return name().toLowerCase(Locale.ROOT);
    }
}
