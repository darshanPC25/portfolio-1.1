package com.darshanpc.portfolio.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.net.URI;
import java.net.URISyntaxException;

public class WebUrlValidator implements ConstraintValidator<WebUrl, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        return value == null || isWebUrl(value);
    }

    public static boolean isWebUrl(String value) {
        if (value.length() > 500 || value.chars().anyMatch(c -> Character.isWhitespace(c) || Character.isISOControl(c))) {
            return false;
        }
        try {
            URI uri = new URI(value);
            String scheme = uri.getScheme();
            return ("https".equalsIgnoreCase(scheme) || "http".equalsIgnoreCase(scheme))
                    && uri.getHost() != null && !uri.getHost().isBlank();
        } catch (URISyntaxException e) {
            return false;
        }
    }
}
