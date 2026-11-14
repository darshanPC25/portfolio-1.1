package com.darshanpc.portfolio.service.github;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import com.darshanpc.portfolio.dto.portfolio.PortfolioResponse;
import com.darshanpc.portfolio.exception.ResourceNotFoundException;
import com.darshanpc.portfolio.service.PublishedPortfolioService;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.ExpectedCount;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

/** Unit tests for the GitHub proxy: username resolution, aggregation, caching and fallbacks. */
class GitHubActivityServiceTest {

    private static final String USER = """
            {"login":"darshanPC25","name":"Darshan","avatar_url":"https://avatars.example/a.png",
             "html_url":"https://github.com/darshanPC25","bio":"Backend","public_repos":3,
             "followers":4,"following":5,"created_at":"2022-01-02T03:04:05Z"}""";
    private static final String REPOS = """
            [{"id":1,"name":"api","description":"REST API","html_url":"https://github.com/d/api","language":"Java",
              "stargazers_count":5,"forks_count":1,"pushed_at":"2026-10-01T00:00:00Z","fork":false},
             {"id":2,"name":"web","description":null,"html_url":"https://github.com/d/web","language":"TypeScript",
              "stargazers_count":2,"forks_count":0,"pushed_at":"2026-11-01T00:00:00Z","fork":false},
             {"id":3,"name":"tool","description":"x","html_url":"https://github.com/d/tool","language":"Java",
              "stargazers_count":1,"forks_count":0,"pushed_at":"2026-09-01T00:00:00Z","fork":false},
             {"id":4,"name":"forked","description":"x","html_url":"https://github.com/d/forked","language":"Go",
              "stargazers_count":99,"forks_count":0,"pushed_at":"2026-11-10T00:00:00Z","fork":true}]""";

    PublishedPortfolioService published;
    MockRestServiceServer server;
    MutableClock clock;

    @BeforeEach
    void setUp() {
        published = mock(PublishedPortfolioService.class);
        clock = new MutableClock(Instant.parse("2026-11-14T10:00:00Z"));
    }

    private GitHubActivityService service(String token) {
        RestClient.Builder builder = RestClient.builder();
        server = MockRestServiceServer.bindTo(builder).build();
        return new GitHubActivityService(published,
                new GitHubProperties("https://api.github.test", token, Duration.ofMinutes(30)), builder, clock);
    }

    private void publish(String username, String githubLink) {
        PortfolioResponse portfolio = mock(PortfolioResponse.class);
        when(portfolio.github()).thenReturn(new PortfolioResponse.GitHubSection("GitHub", "Code", null, username, "Soon"));
        when(portfolio.socialLinks()).thenReturn(githubLink == null ? List.of()
                : List.of(new PortfolioResponse.SocialLinkItem("1", "github", "GitHub", githubLink)));
        when(published.current()).thenReturn(portfolio);
    }

    private void expectRestCalls() {
        server.expect(requestTo("https://api.github.test/users/darshanPC25")).andRespond(withSuccess(USER, MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://api.github.test/users/darshanPC25/repos?type=owner&sort=pushed&per_page=100"))
                .andRespond(withSuccess(REPOS, MediaType.APPLICATION_JSON));
        // Without a token: commits of the recently pushed own repositories (newest first; the fork is skipped).
        String since = "2025-11-15T00%3A00%3A00Z";   // URL-encoded instant
        server.expect(requestTo(commits("web", since))).andRespond(withSuccess("""
                [{"commit":{"author":{"date":"2026-11-01T10:00:00Z"}}},
                 {"commit":{"author":{"date":"2026-11-01T18:00:00Z"}}}]""", MediaType.APPLICATION_JSON));
        server.expect(requestTo(commits("api", since))).andRespond(withSuccess("""
                [{"commit":{"author":{"date":"2026-10-01T09:00:00Z"}}}]""", MediaType.APPLICATION_JSON));
        server.expect(requestTo(commits("tool", since))).andRespond(withStatus(HttpStatus.CONFLICT));   // empty repository
    }

    private static String commits(String repo, String since) {
        return "https://api.github.test/repos/darshanPC25/" + repo + "/commits?author=darshanPC25&since=" + since + "&per_page=100";
    }

    @Test
    void usernameComesFromTheProfileOrElseTheGitHubLink() {
        var section = new PortfolioResponse.GitHubSection("e", "h", null, null, "m");
        var link = new PortfolioResponse.SocialLinkItem("1", "github", "GitHub", "https://github.com/darshanPC25/");

        assertThat(GitHubActivityService.resolveUsername(section, List.of(link))).contains("darshanPC25");
        assertThat(GitHubActivityService.resolveUsername(
                new PortfolioResponse.GitHubSection("e", "h", null, "other", "m"), List.of(link))).contains("other");
        assertThat(GitHubActivityService.resolveUsername(null, List.of(link))).isEmpty();               // section hidden
        assertThat(GitHubActivityService.resolveUsername(section, List.of(
                new PortfolioResponse.SocialLinkItem("1", "github", "GitHub", "https://evil.example/darshan")))).isEmpty();
        assertThat(GitHubActivityService.resolveUsername(
                new PortfolioResponse.GitHubSection("e", "h", null, "../admin", "m"), List.of())).isEmpty();
    }

    @Test
    void aggregatesOwnRepositoriesAndCachesTheResult() {
        publish(null, "https://github.com/darshanPC25");
        GitHubActivityService service = service(null);
        expectRestCalls();

        GitHubActivity activity = service.activity();

        assertThat(activity.profile().login()).isEqualTo("darshanPC25");
        assertThat(activity.stats().totalStars()).isEqualTo(8);                       // the fork is ignored
        assertThat(activity.repos()).extracting(GitHubActivity.Repo::name).containsExactly("web", "api", "tool");
        assertThat(activity.languages()).extracting(GitHubActivity.Language::name).containsExactly("Java", "TypeScript");
        assertThat(activity.languages().get(0).share()).isEqualTo(0.667);
        // No token: commits counted per day from the repositories (the empty one is skipped).
        assertThat(activity.contributions().source()).isEqualTo("commits");
        assertThat(activity.contributions().repositories()).isEqualTo(2);
        assertThat(activity.contributions().total()).isEqualTo(3);
        assertThat(activity.contributions().days()).hasSize(365);
        assertThat(activity.contributions().days()).filteredOn(d -> d.date().toString().equals("2026-11-01"))
                .singleElement().extracting(GitHubActivity.Day::count).isEqualTo(2);

        // Second call within the TTL: no request to GitHub (the mock would fail on an unexpected call).
        assertThat(service.activity()).isSameAs(activity);
        server.verify();
    }

    @Test
    void servesTheLastGoodResultWhenGitHubFailsAndReportsUnavailableOtherwise() {
        publish("darshanPC25", null);
        GitHubActivityService service = service(null);
        expectRestCalls();
        GitHubActivity first = service.activity();

        clock.advance(Duration.ofHours(1));
        server.reset();
        server.expect(requestTo("https://api.github.test/users/darshanPC25")).andRespond(withServerError());
        assertThat(service.activity()).isSameAs(first);

        GitHubActivityService fresh = service(null);
        server.expect(requestTo("https://api.github.test/users/darshanPC25")).andRespond(withServerError());
        assertThatThrownBy(fresh::activity).isInstanceOf(GitHubActivityService.GitHubUnavailableException.class);
    }

    @Test
    void noUsernameMeansNotFound() {
        publish(null, null);
        assertThatThrownBy(service(null)::activity).isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void withATokenTheContributionCalendarIsLoadedFromGraphQl() {
        publish("darshanPC25", null);
        GitHubActivityService service = service("test-token");
        server.expect(requestTo("https://api.github.test/users/darshanPC25"))
                .andExpect(header("Authorization", "Bearer test-token"))
                .andRespond(withSuccess(USER, MediaType.APPLICATION_JSON));
        server.expect(requestTo("https://api.github.test/users/darshanPC25/repos?type=owner&sort=pushed&per_page=100"))
                .andRespond(withSuccess(REPOS, MediaType.APPLICATION_JSON));
        server.expect(ExpectedCount.once(), requestTo("https://api.github.test/graphql"))
                .andExpect(method(HttpMethod.POST))
                .andRespond(withSuccess("""
                        {"data":{"user":{"contributionsCollection":{"restrictedContributionsCount":0,
                          "commitContributionsByRepository":[
                            {"repository":{"isPrivate":true},"contributions":{"totalCount":4}},
                            {"repository":{"isPrivate":true},"contributions":{"totalCount":1}},
                            {"repository":{"isPrivate":false},"contributions":{"totalCount":2}}],
                          "contributionCalendar":{
                          "totalContributions":7,
                          "weeks":[{"contributionDays":[{"date":"2026-11-08","contributionCount":3},
                                                        {"date":"2026-11-09","contributionCount":4}]}]}}}}}""",
                        MediaType.APPLICATION_JSON));

        GitHubActivity.Contributions contributions = service.activity().contributions();

        assertThat(contributions.total()).isEqualTo(7);
        assertThat(contributions.source()).isEqualTo("calendar");
        // Owner's token: private commits are visible, so they are summed per private repository.
        assertThat(contributions.privateContributions()).isEqualTo(5);
        assertThat(contributions.days()).hasSize(2);
        assertThat(contributions.days().get(1).count()).isEqualTo(4);
        server.verify();
    }

    /** A clock the test can move forward. */
    static final class MutableClock extends Clock {
        private Instant now;

        MutableClock(Instant now) {
            this.now = now;
        }

        void advance(Duration duration) {
            now = now.plus(duration);
        }

        @Override
        public Instant instant() {
            return now;
        }

        @Override
        public ZoneOffset getZone() {
            return ZoneOffset.UTC;
        }

        @Override
        public Clock withZone(java.time.ZoneId zone) {
            return this;
        }
    }
}
