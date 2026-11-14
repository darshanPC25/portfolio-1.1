package com.darshanpc.portfolio.validation;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/** Unit tests for the custom validation rules used by the public and studio APIs. */
class ValidationRulesTest {

    private static final Validator VALIDATOR = Validation.buildDefaultValidatorFactory().getValidator();

    record Link(@LinkTarget String target) {
    }

    record Line(@SingleLine String text) {
    }

    @ParameterizedTest
    @ValueSource(strings = {"https://github.com/darshan", "http://example.com/a?b=c", "HTTPS://EXAMPLE.COM"})
    void webUrlAcceptsHttpAndHttps(String url) {
        assertThat(WebUrlValidator.isWebUrl(url)).isTrue();
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "javascript:alert(1)", "data:text/html,<script>", "ftp://example.com", "https://",
            "https://exa mple.com", "//example.com", "example.com", "https://example.com/\nx"})
    void webUrlRejectsOtherSchemesAndMalformedValues(String url) {
        assertThat(WebUrlValidator.isWebUrl(url)).isFalse();
    }

    @Test
    void webUrlRejectsOverlongValues() {
        assertThat(WebUrlValidator.isWebUrl("https://example.com/" + "a".repeat(500))).isFalse();
    }

    @ParameterizedTest
    @ValueSource(strings = {"#projects", "/admin/login", "https://example.com", "mailto:me@example.com"})
    void linkTargetAcceptsAnchorsPathsUrlsAndMailto(String target) {
        assertThat(VALIDATOR.validate(new Link(target))).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"javascript:alert(1)", "JavaScript:void(0)", "data:text/html;base64,xx",
            "vbscript:x", "mailto:nobody", "# spaced", "projects"})
    void linkTargetRejectsScriptAndUnknownLinks(String target) {
        assertThat(VALIDATOR.validate(new Link(target))).hasSize(1);
    }

    @Test
    void singleLineRejectsControlCharacters() {
        assertThat(VALIDATOR.validate(new Line("Hello Darshan"))).isEmpty();
        assertThat(VALIDATOR.validate(new Line(null))).isEmpty();
        assertThat(VALIDATOR.validate(new Line("Subject\r\nBcc: x@example.com"))).hasSize(1);
        assertThat(VALIDATOR.validate(new Line("tab\there"))).hasSize(1);
    }
}
