package com.darshanpc.portfolio.entity.enums;

import java.util.Locale;

public enum SocialPlatform {
    GITHUB,
    LINKEDIN,
    EMAIL,
    WEBSITE;

    public String publicValue() {
        return name().toLowerCase(Locale.ROOT);
    }
}
