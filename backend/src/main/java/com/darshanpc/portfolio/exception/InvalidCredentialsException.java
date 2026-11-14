package com.darshanpc.portfolio.exception;

/**
 * Sign-in failed. Deliberately says nothing about why (unknown email, wrong
 * password, disabled or temporarily locked account). Mapped to 401.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Invalid email or password.");
    }
}
