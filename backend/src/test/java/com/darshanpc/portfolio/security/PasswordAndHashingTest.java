package com.darshanpc.portfolio.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.darshanpc.portfolio.config.PortfolioProperties;
import java.time.Duration;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.util.unit.DataSize;

/** Unit tests for password rules, BCrypt settings and IP hashing. */
public class PasswordAndHashingTest {

    @Test
    void passwordPolicyEnforcesLengthAndBcryptByteLimit() {
        assertThat(PasswordPolicy.problem(null)).isPresent();
        assertThat(PasswordPolicy.problem("short-pass1")).isPresent();          // 11 characters
        assertThat(PasswordPolicy.problem("long-enough-pass")).isEmpty();
        assertThat(PasswordPolicy.problem("x".repeat(64))).isEmpty();
        assertThat(PasswordPolicy.problem("x".repeat(65))).isPresent();
        // 30 three-byte characters = 90 bytes: over BCrypt's 72-byte input limit.
        assertThat(PasswordPolicy.problem("€".repeat(30))).isPresent();
        assertThat(PasswordPolicy.problem(" ".repeat(20))).isPresent();
    }

    @Test
    void passwordsAreStoredAsSaltedBcryptHashesWithCost12() {
        var encoder = new SecurityConfig().passwordEncoder();
        String hash = encoder.encode("correct horse battery");

        assertThat(encoder).isInstanceOf(BCryptPasswordEncoder.class);
        assertThat(hash).startsWith("$2a$12$").doesNotContain("correct horse battery");
        assertThat(encoder.encode("correct horse battery")).isNotEqualTo(hash);   // random salt
        assertThat(encoder.matches("correct horse battery", hash)).isTrue();
        assertThat(encoder.matches("Correct horse battery", hash)).isFalse();
    }

    @Test
    void ipHashIsStableForOneSaltAndNeverTheRawAddress() {
        IpAddressHasher hasher = new IpAddressHasher(properties("salt-a", "target/unit-uploads"));
        String hash = hasher.hash("203.0.113.7");

        assertThat(hash).hasSize(64).doesNotContain("203.0.113.7");
        assertThat(hasher.hash("203.0.113.7")).isEqualTo(hash);
        assertThat(hasher.hash("203.0.113.8")).isNotEqualTo(hash);
        assertThat(new IpAddressHasher(properties("salt-b", "target/unit-uploads")).hash("203.0.113.7"))
                .isNotEqualTo(hash);
        assertThat(hasher.hash(null)).isNull();
    }

    /** Minimal settings for unit tests (no Spring context). */
    public static PortfolioProperties properties(String salt, String uploadDirectory) {
        var limit = new PortfolioProperties.RateLimit(5, Duration.ofMinutes(10));
        return new PortfolioProperties(
                new PortfolioProperties.Cors(List.of("http://localhost:5173")),
                new PortfolioProperties.Publication(false),
                new PortfolioProperties.Contact(limit, salt),
                new PortfolioProperties.Admin(
                        new PortfolioProperties.Admin.Bootstrap(null, null, null), limit, 5, Duration.ofMinutes(15)),
                new PortfolioProperties.Storage(uploadDirectory, DataSize.ofKilobytes(64), DataSize.ofKilobytes(64)));
    }
}
