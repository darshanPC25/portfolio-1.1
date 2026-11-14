package com.darshanpc.portfolio.service.github;

import java.time.Duration;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * Settings for the GitHub Activity section ({@code portfolio.github.*}).
 *
 * @param apiUrl   GitHub REST/GraphQL base address
 * @param token    optional token (no scopes needed). Raises the rate limit and enables the
 *                 contribution calendar, which GitHub only offers through its GraphQL API.
 * @param cacheTtl how long fetched activity is reused before GitHub is asked again
 */
@ConfigurationProperties(prefix = "portfolio.github")
public record GitHubProperties(
        @DefaultValue("https://api.github.com") String apiUrl,
        String token,
        @DefaultValue("30m") Duration cacheTtl) {

    public boolean hasToken() {
        return token != null && !token.isBlank();
    }
}
