package com.darshanpc.portfolio.exception;

import lombok.Getter;

/** A request that is well-formed but not acceptable (e.g. wrong current password). Mapped to 400. */
@Getter
public class BadRequestException extends RuntimeException {

    /** Field to attach the message to in the form, or null. */
    private final String field;

    public BadRequestException(String message, String field) {
        super(message);
        this.field = field;
    }
}
