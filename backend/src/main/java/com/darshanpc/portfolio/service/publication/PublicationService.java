package com.darshanpc.portfolio.service.publication;

import com.darshanpc.portfolio.dto.portfolio.PortfolioResponse;
import com.darshanpc.portfolio.entity.AdminUser;
import com.darshanpc.portfolio.entity.PortfolioPublication;
import com.darshanpc.portfolio.repository.PortfolioPublicationRepository;
import com.darshanpc.portfolio.service.DatabaseLocks;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Clock;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Publishes the current draft content: builds the public snapshot and stores
 * it as the next publication version. Visitors see it on their next request;
 * no rebuild or redeploy is involved.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PublicationService {

    /** Version of the snapshot JSON format. Bump when {@link PortfolioResponse} changes shape. */
    public static final int SNAPSHOT_SCHEMA_VERSION = 4;

    private final PortfolioPublicationRepository publications;
    private final PortfolioSnapshotAssembler assembler;
    private final ObjectMapper objectMapper;
    private final Clock clock;
    private final DatabaseLocks locks;

    /** Publishes the seeded draft if nothing has been published yet (safe if several instances start at once). */
    @Transactional
    public boolean publishInitialIfNone(String note) {
        locks.lockForTransaction("publish");
        if (publications.findLatestVersionNumber().isPresent()) {
            return false;
        }
        publish(note, null);
        return true;
    }

    /**
     * Publishes the current draft as the next version. Publications are taken one at a
     * time across all instances, so two simultaneous publishes never collide on a version.
     */
    @Transactional
    public PortfolioPublication publish(String note, AdminUser publishedBy) {
        locks.lockForTransaction("publish");
        int nextVersion = publications.findLatestVersionNumber().orElse(0) + 1;
        Instant now = clock.instant();
        PortfolioResponse snapshot = assembler.assemble(nextVersion, now);

        PortfolioPublication publication = new PortfolioPublication();
        publication.setVersionNumber(nextVersion);
        publication.setSchemaVersion(SNAPSHOT_SCHEMA_VERSION);
        publication.setSnapshot(toJson(snapshot));
        publication.setNote(note);
        publication.setPublishedBy(publishedBy);
        publication.setPublishedAt(now);

        PortfolioPublication saved = publications.save(publication);
        log.info("Published portfolio version {}", nextVersion);
        return saved;
    }

    private String toJson(PortfolioResponse snapshot) {
        try {
            return objectMapper.writeValueAsString(snapshot);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Could not serialise the portfolio snapshot", e);
        }
    }
}
