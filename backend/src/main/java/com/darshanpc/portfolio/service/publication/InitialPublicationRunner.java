package com.darshanpc.portfolio.service.publication;

import com.darshanpc.portfolio.repository.PortfolioPublicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * On a fresh database nothing has been published, so the public site would
 * have no content. This publishes the seeded draft once. It never runs again
 * after the first publication exists.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "portfolio.publication", name = "bootstrap-on-startup", havingValue = "true")
public class InitialPublicationRunner implements ApplicationRunner {

    private final PortfolioPublicationRepository publications;
    private final PublicationService publicationService;

    @Override
    public void run(ApplicationArguments args) {
        if (publications.findLatestVersionNumber().isPresent()) {
            return;   // the usual case: no lock needed
        }
        if (publicationService.publishInitialIfNone("Initial publication of seed content")) {
            log.info("No published portfolio found; published the initial seed content");
        }
    }
}
