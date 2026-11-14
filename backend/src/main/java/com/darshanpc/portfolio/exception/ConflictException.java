package com.darshanpc.portfolio.exception;

import lombok.Getter;

/** The request conflicts with existing data (e.g. a duplicate slug). Mapped to 409. */
@Getter
public class ConflictException extends RuntimeException {

    /** Field to attach the message to in the form, or null. */
    private final String field;

    public ConflictException(String message, String field) {
        super(message);
        this.field = field;
    }
}
