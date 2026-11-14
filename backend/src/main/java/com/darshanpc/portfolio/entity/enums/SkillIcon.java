package com.darshanpc.portfolio.entity.enums;

import java.util.Locale;

public enum SkillIcon {
    CODE,
    SERVER,
    DATABASE,
    NETWORK,
    TOOLS;

    public String publicValue() {
        return name().toLowerCase(Locale.ROOT);
    }
}
