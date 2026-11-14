package com.darshanpc.portfolio.service.github;

import com.darshanpc.portfolio.dto.portfolio.PortfolioResponse;
import com.darshanpc.portfolio.exception.ResourceNotFoundException;
import com.darshanpc.portfolio.service.PublishedPortfolioService;
import com.fasterxml.jackson.databind.JsonNode;
import java.net.URI;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.StreamSupport;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Fetches public GitHub activity for the published GitHub username and keeps
 * it in memory for {@code portfolio.github.cache-ttl}. Visitors' browsers
 * therefore never call GitHub themselves (no per-visitor rate limit, no
 * third-party request from the page), and GitHub sees at most a few requests
 * an hour. If GitHub is unreachable, the last good result is served.
 */
@Slf4j
@Service
public class GitHubActivityService {

    /** GitHub's own username rules: 1–39 characters, letters, digits and single inner hyphens. */
    private static final Pattern USERNAME = Pattern.compile("^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$");
    private static final Pattern PROFILE_URL =
            Pattern.compile("^https?://(?:www\\.)?github\\.com/([A-Za-z0-9-]{1,39})/?(?:[?#].*)?$", Pattern.CASE_INSENSITIVE);

    private static final String CONTRIBUTIONS_QUERY = """
            query($login: String!) {
              user(login: $login) {
                contributionsCollection {
                  restrictedContributionsCount
                  commitContributionsByRepository(maxRepositories: 100) {
                    repository { isPrivate }
                    contributions { totalCount }
                  }
                  contributionCalendar {
                    totalContributions
                    weeks { contributionDays { date contributionCount } }
                  }
                }
              }
            }""";

    private final PublishedPortfolioService published;
    private final GitHubProperties properties;
    private final RestClient client;
    private final Clock clock;

    private record Cached(GitHubActivity activity, Instant fetchedAt) {
    }

    private final Map<String, Cached> cache = new ConcurrentHashMap<>();

    @Autowired
    public GitHubActivityService(PublishedPortfolioService published, GitHubProperties properties) {
        this(published, properties, RestClient.builder().requestFactory(requestFactory()), Clock.systemUTC());
    }

    /**
     * Plain HttpURLConnection with timeouts: enough for a few cached requests an
     * hour, and free of the JDK HttpClient's selector thread and loopback socket.
     */
    private static SimpleClientHttpRequestFactory requestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(10));
        return factory;
    }

    GitHubActivityService(
            PublishedPortfolioService published, GitHubProperties properties, RestClient.Builder builder, Clock clock) {
        this.published = published;
        this.properties = properties;
        this.clock = clock;
        RestClient.Builder b = builder.clone()
                .baseUrl(properties.apiUrl())
                .defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .defaultHeader(HttpHeaders.USER_AGENT, "portfolio-backend")
                .defaultHeader("X-GitHub-Api-Version", "2022-11-28");
        if (properties.hasToken()) {
            b.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + properties.token().strip());
        }
        this.client = b.build();
    }

    /**
     * The username the GitHub section shows: the one set in the profile, or
     * else the one in the published GitHub social link.
     */
    public static Optional<String> resolveUsername(
            PortfolioResponse.GitHubSection section, List<PortfolioResponse.SocialLinkItem> links) {
        if (section == null) {
            return Optional.empty();
        }
        if (section.username() != null && USERNAME.matcher(section.username()).matches()) {
            return Optional.of(section.username());
        }
        return Objects.requireNonNullElse(links, List.<PortfolioResponse.SocialLinkItem>of()).stream()
                .filter(link -> "github".equalsIgnoreCase(link.platform()) && link.url() != null)
                .map(link -> PROFILE_URL.matcher(link.url().strip()))
                .filter(Matcher::matches)
                .map(m -> m.group(1))
                .filter(name -> USERNAME.matcher(name).matches())
                .findFirst();
    }

    /** Activity for the published username; 404 when the section is hidden or has no username. */
    public GitHubActivity activity() {
        PortfolioResponse portfolio = published.current();
        String username = resolveUsername(portfolio.github(), portfolio.socialLinks())
                .orElseThrow(() -> new ResourceNotFoundException("GitHub username", "(not set)"));
        String key = username.toLowerCase();

        Cached cached = cache.get(key);
        Instant now = clock.instant();
        if (cached != null && cached.fetchedAt().plus(properties.cacheTtl()).isAfter(now)) {
            return cached.activity();
        }
        try {
            GitHubActivity fresh = fetch(username, now);
            cache.put(key, new Cached(fresh, now));
            return fresh;
        } catch (RestClientException e) {
            if (cached != null) {
                log.warn("GitHub request failed ({}); serving activity from {}", e.getMessage(), cached.fetchedAt());
                return cached.activity();
            }
            throw new GitHubUnavailableException(e);
        }
    }

    private GitHubActivity fetch(String username, Instant now) {
        JsonNode user = client.get().uri("/users/{user}", username).retrieve().body(JsonNode.class);
        JsonNode repoArray = client.get()
                .uri("/users/{user}/repos?type=owner&sort=pushed&per_page=100", username)
                .retrieve().body(JsonNode.class);

        List<JsonNode> own = StreamSupport.stream(Objects.requireNonNull(repoArray).spliterator(), false)
                .filter(r -> !r.path("fork").asBoolean(false))
                .toList();

        int totalStars = own.stream().mapToInt(r -> r.path("stargazers_count").asInt(0)).sum();

        Map<String, Integer> languageCounts = new LinkedHashMap<>();
        own.forEach(r -> {
            String language = text(r, "language");
            if (language != null) {
                languageCounts.merge(language, 1, Integer::sum);
            }
        });
        int withLanguage = languageCounts.values().stream().mapToInt(Integer::intValue).sum();
        List<GitHubActivity.Language> languages = languageCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(6)
                .map(e -> new GitHubActivity.Language(e.getKey(), e.getValue(),
                        Math.round(1000.0 * e.getValue() / withLanguage) / 1000.0))
                .toList();

        List<GitHubActivity.Repo> repos = own.stream()
                .sorted(Comparator.comparing((JsonNode r) -> text(r, "pushed_at"), Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(6)
                .map(r -> new GitHubActivity.Repo(
                        r.path("id").asLong(),
                        text(r, "name"),
                        text(r, "description"),
                        text(r, "html_url"),
                        text(r, "language"),
                        r.path("stargazers_count").asInt(0),
                        r.path("forks_count").asInt(0),
                        instant(text(r, "pushed_at"))))
                .toList();

        JsonNode u = Objects.requireNonNull(user);
        return new GitHubActivity(
                new GitHubActivity.Profile(
                        text(u, "login"),
                        text(u, "name"),
                        text(u, "avatar_url"),
                        text(u, "html_url"),
                        text(u, "bio"),
                        instant(text(u, "created_at"))),
                new GitHubActivity.Stats(
                        u.path("public_repos").asInt(0),
                        u.path("followers").asInt(0),
                        u.path("following").asInt(0),
                        totalStars),
                languages,
                repos,
                properties.hasToken() ? contributions(username) : commitActivity(username, own, now),
                now);
    }

    /** Last year's contribution calendar. Needs a token; failures just leave it out. */
    private GitHubActivity.Contributions contributions(String username) {
        try {
            JsonNode body = client.post()
                    .uri(URI.create(properties.apiUrl().replaceAll("/+$", "") + "/graphql"))
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("query", CONTRIBUTIONS_QUERY, "variables", Map.of("login", username)))
                    .retrieve()
                    .body(JsonNode.class);
            JsonNode collection = Objects.requireNonNull(body).path("data").path("user").path("contributionsCollection");
            JsonNode calendar = collection.path("contributionCalendar");
            if (calendar.isMissingNode()) {
                return null;
            }
            List<GitHubActivity.Day> days = new ArrayList<>();
            calendar.path("weeks").forEach(week -> week.path("contributionDays").forEach(day -> days.add(
                    new GitHubActivity.Day(LocalDate.parse(day.path("date").asText()), day.path("contributionCount").asInt()))));
            // The calendar includes private contributions when the user shares them on their profile
            // or the token is their own. For other viewers GitHub reports them as
            // restrictedContributionsCount; for the owner they are visible, so the commits in
            // private repositories are added up instead.
            int privateCommits = 0;
            for (JsonNode entry : collection.path("commitContributionsByRepository")) {
                if (entry.path("repository").path("isPrivate").asBoolean(false)) {
                    privateCommits += entry.path("contributions").path("totalCount").asInt(0);
                }
            }
            int restricted = collection.path("restrictedContributionsCount").asInt(0);
            return new GitHubActivity.Contributions(calendar.path("totalContributions").asInt(), days, "calendar", 0,
                    Math.max(restricted, privateCommits));
        } catch (RuntimeException e) {
            log.warn("GitHub contribution calendar unavailable: {}", e.getMessage());
            return null;
        }
    }

    /** Repositories whose commits are counted when there is no token (keeps requests well under GitHub's 60/hour). */
    static final int COMMIT_REPOSITORIES = 8;

    /**
     * Without a token GitHub offers no contribution calendar, so the user's own
     * commits are counted from their most recently pushed repositories instead.
     * Each repository is one request (up to 100 commits); failures are skipped.
     */
    private GitHubActivity.Contributions commitActivity(String username, List<JsonNode> ownRepos, Instant now) {
        LocalDate today = LocalDate.ofInstant(now, java.time.ZoneOffset.UTC);
        LocalDate start = today.minusDays(364);
        Instant since = start.atStartOfDay(java.time.ZoneOffset.UTC).toInstant();

        List<String> recent = ownRepos.stream()
                .filter(r -> r.path("size").asInt(1) > 0)
                .filter(r -> {
                    Instant pushed = instant(text(r, "pushed_at"));
                    return pushed != null && pushed.isAfter(since);
                })
                .sorted(Comparator.comparing((JsonNode r) -> text(r, "pushed_at"), Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(COMMIT_REPOSITORIES)
                .map(r -> text(r, "name"))
                .toList();
        if (recent.isEmpty()) {
            return null;
        }

        Map<LocalDate, Integer> perDay = new java.util.HashMap<>();
        int counted = 0;
        for (String repo : recent) {
            try {
                JsonNode commits = client.get()
                        .uri("/repos/{owner}/{repo}/commits?author={author}&since={since}&per_page=100",
                                username, repo, username, since.toString())
                        .retrieve().body(JsonNode.class);
                if (commits == null || !commits.isArray()) {
                    continue;
                }
                counted++;
                commits.forEach(c -> {
                    String date = text(c.path("commit").path("author"), "date");
                    if (date != null) {
                        perDay.merge(LocalDate.ofInstant(Instant.parse(date), java.time.ZoneOffset.UTC), 1, Integer::sum);
                    }
                });
            } catch (RuntimeException e) {
                log.debug("Commits of {} skipped: {}", repo, e.getMessage());   // e.g. 409 for an empty repository
            }
        }
        if (counted == 0) {
            return null;
        }
        List<GitHubActivity.Day> days = start.datesUntil(today.plusDays(1))
                .map(d -> new GitHubActivity.Day(d, perDay.getOrDefault(d, 0)))
                .toList();
        int total = days.stream().mapToInt(GitHubActivity.Day::count).sum();
        return new GitHubActivity.Contributions(total, days, "commits", counted, 0);
    }

    private static String text(JsonNode node, String field) {
        JsonNode value = node.path(field);
        if (value.isNull() || value.isMissingNode()) {
            return null;
        }
        String text = value.asText().strip();
        return text.isEmpty() ? null : text;
    }

    private static Instant instant(String value) {
        return value == null ? null : Instant.parse(value);
    }

    /** GitHub could not be reached and nothing was cached yet. */
    public static class GitHubUnavailableException extends RuntimeException {
        GitHubUnavailableException(Throwable cause) {
            super("GitHub activity is not available right now.", cause);
        }
    }
}
