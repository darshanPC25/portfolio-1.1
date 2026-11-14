package com.darshanpc.portfolio.exception;

/** Nothing has been published yet, so there is no public content to serve. Mapped to 503. */
public class ContentNotPublishedException extends RuntimeException {

    public ContentNotPublishedException() {
        super("The portfolio has not been published yet");
    }
}
