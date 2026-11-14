package com.darshanpc.portfolio.entity.enums;

import java.util.Locale;

/** Corner rounding of cards, panels and chips. SOFT is the reference design. */
public enum CornerStyle {
    SHARP,
    SOFT,
    ROUND;

    public String publicValue() {
        return name().toLowerCase(Locale.ROOT);
    }
}
