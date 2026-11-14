package com.darshanpc.portfolio.entity.enums;

/** Honest project status. The public value matches the frontend's wording keys. */
public enum ProjectStatus {
    IN_DEVELOPMENT("in-development"),
    COMPLETED("completed"),
    PLANNED("planned");

    private final String publicValue;

    ProjectStatus(String publicValue) {
        this.publicValue = publicValue;
    }

    public String publicValue() {
        return publicValue;
    }
}
