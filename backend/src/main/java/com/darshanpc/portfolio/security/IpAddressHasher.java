package com.darshanpc.portfolio.security;

import com.darshanpc.portfolio.config.PortfolioProperties;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Hashes client IP addresses with a secret salt so repeated senders can be
 * recognised without storing their raw address.
 */
@Slf4j
@Component
public class IpAddressHasher {

    private final byte[] salt;

    public IpAddressHasher(PortfolioProperties properties) {
        String configured = properties.contact().ipHashSalt();
        if (configured == null || configured.isBlank()) {
            log.warn("CONTACT_IP_HASH_SALT is not set; using a random salt, so IP hashes change on restart");
            this.salt = new byte[32];
            new SecureRandom().nextBytes(this.salt);
        } else {
            this.salt = configured.getBytes(StandardCharsets.UTF_8);
        }
    }

    public String hash(String ipAddress) {
        if (ipAddress == null) {
            return null;
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(salt);
            return HexFormat.of().formatHex(digest.digest(ipAddress.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }
}
