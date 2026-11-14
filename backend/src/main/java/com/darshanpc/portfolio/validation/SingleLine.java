package com.darshanpc.portfolio.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * The text must be a single line: no line breaks or other control characters.
 * Used for names and subjects, which could otherwise inject extra lines into
 * email headers or logs. {@code null} is considered valid.
 */
@Documented
@Constraint(validatedBy = SingleLineValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface SingleLine {

    String message() default "must be a single line of text";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
