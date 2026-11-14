package com.darshanpc.portfolio.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import jakarta.validation.ReportAsSingleViolation;
import jakarta.validation.constraints.Pattern;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * A button destination: a section anchor ({@code #projects}), a site path
 * ({@code /admin/login}), a web address, or a {@code mailto:} link.
 */
@Documented
@Pattern(regexp = "^(#[A-Za-z0-9_-]+|/[^\\s]*|https?://[^\\s]+|mailto:[^\\s@]+@[^\\s@]+)$")
@ReportAsSingleViolation
@Constraint(validatedBy = {})
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface LinkTarget {

    String message() default "Use a section like #projects, a path like /page, a web address or a mailto: link.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
