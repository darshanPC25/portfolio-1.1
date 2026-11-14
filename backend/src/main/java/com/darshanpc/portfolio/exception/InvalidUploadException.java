package com.darshanpc.portfolio.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/** An uploaded file was rejected (wrong type, too large, empty). */
@Getter
public class InvalidUploadException extends RuntimeException {

    private final HttpStatus status;

    public InvalidUploadException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
}
