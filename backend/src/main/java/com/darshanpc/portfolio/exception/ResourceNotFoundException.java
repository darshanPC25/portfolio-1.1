package com.darshanpc.portfolio.exception;

/** A requested resource does not exist (or is not published). Mapped to 404. */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, String identifier) {
        super(resource + " '" + identifier + "' was not found");
    }
}
