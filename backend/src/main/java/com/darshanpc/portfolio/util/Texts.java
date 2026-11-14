package com.darshanpc.portfolio.util;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.Objects;

/** Small string helpers. */
public final class Texts {

    private Texts() {
    }

    /** Cuts {@code value} to at most {@code maxLength} characters; null stays null. */
    public static String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }

    /** Trims surrounding whitespace; null stays null. */
    public static String strip(String value) {
        return value == null ? null : value.strip();
    }

    /** Trims, and turns an empty result into null (for optional fields). */
    public static String blankToNull(String value) {
        String stripped = strip(value);
        return stripped == null || stripped.isEmpty() ? null : stripped;
    }

    /** Trims every entry and drops empty ones; null becomes an empty list. */
    public static List<String> cleanList(List<String> values) {
        if (values == null) {
            return List.of();
        }
        return values.stream().filter(Objects::nonNull).map(String::strip).filter(s -> !s.isEmpty()).toList();
    }

    /** "Secure Document Management" → "secure-document-management". */
    public static String slugify(String value) {
        String ascii = Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        String slug = ascii.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-+|-+$)", "");
        if (slug.length() > 100) {
            slug = slug.substring(0, 100).replaceAll("-+$", "");
        }
        return slug.isEmpty() ? "project" : slug;
    }
}
