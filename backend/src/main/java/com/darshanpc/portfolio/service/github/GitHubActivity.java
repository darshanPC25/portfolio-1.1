package com.darshanpc.portfolio.service.github;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

/** Public GitHub activity shown in the portfolio's GitHub section. */
public record GitHubActivity(
        Profile profile,
        Stats stats,
        List<Language> languages,
        List<Repo> repos,
        /** Daily activity for the last year, or null when GitHub could not provide it. */
        Contributions contributions,
        Instant fetchedAt) {

    public record Profile(
            String login,
            String name,
            String avatarUrl,
            String profileUrl,
            String bio,
            Instant memberSince) {
    }

    public record Stats(int publicRepos, int followers, int following, int totalStars) {
    }

    /** Primary language of the user's own (non-fork) repositories, with its share of them. */
    public record Language(String name, int repos, double share) {
    }

    public record Repo(
            long id,
            String name,
            String description,
            String url,
            String language,
            int stars,
            int forks,
            Instant updatedAt) {
    }

    /**
     * @param source       "calendar": GitHub's contribution calendar (needs a token);
     *                     "commits": the user's commits counted from their recently pushed repositories
     * @param repositories how many repositories were counted for "commits" (0 for "calendar")
     * @param privateContributions contributions in private repositories that are included in
     *                     {@code total} ("calendar" only; GitHub reports them only as counts)
     */
    public record Contributions(
            int total, List<Day> days, String source, int repositories, int privateContributions) {
    }

    public record Day(LocalDate date, int count) {
    }
}
