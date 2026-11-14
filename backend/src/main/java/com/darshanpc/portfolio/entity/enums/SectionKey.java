package com.darshanpc.portfolio.entity.enums;

import java.util.Locale;

/** Page sections that appear in the navigation. The public value is the anchor id. */
public enum SectionKey {
    ABOUT,
    SKILLS,
    PROJECTS,
    JOURNEY,
    EDUCATION,
    GITHUB,
    CONTACT;

    public String publicValue() {
        return name().toLowerCase(Locale.ROOT);
    }
}
