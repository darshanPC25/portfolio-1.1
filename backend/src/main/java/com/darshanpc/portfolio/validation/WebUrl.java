package com.darshanpc.portfolio.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * An absolute http(s) URL with a host, at most 500 characters. Blocks
 * {@code javascript:} and other schemes in links shown on the site.
 * {@code null} is valid (use {@code @NotNull} to require a value).
 */
@Documented
@Constraint(validatedBy = WebUrlValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT, ElementType.TYPE_USE})
@Retention(RetentionPolicy.RUNTIME)
public @interface WebUrl {

    String message() default "Enter a full web address starting with https:// or http://.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
