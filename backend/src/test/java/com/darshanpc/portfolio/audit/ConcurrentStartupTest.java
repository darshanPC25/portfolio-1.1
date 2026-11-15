package com.darshanpc.portfolio.audit;

import static org.assertj.core.api.Assertions.assertThat;

import com.darshanpc.portfolio.IntegrationTest;
import com.darshanpc.portfolio.admin.auth.AdminBootstrapRunner;
import com.darshanpc.portfolio.service.publication.PublicationService;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.annotation.DirtiesContext;

/**
 * Several application instances (AWS Lambda) may start or publish at the same
 * moment. Start-up and publishing must then neither fail nor create duplicates.
 */
@IntegrationTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
class ConcurrentStartupTest {

    private static final int INSTANCES = 6;

    @Autowired
    AdminBootstrapRunner adminBootstrap;

    @Autowired
    PublicationService publications;

    @Autowired
    JdbcTemplate jdbc;

    /** Runs the same action on several threads released at the same instant. */
    private static <T> List<T> simultaneously(Callable<T> action) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(INSTANCES);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<T>> futures = new ArrayList<>();
        for (int i = 0; i < INSTANCES; i++) {
            futures.add(pool.submit(() -> {
                start.await();
                return action.call();
            }));
        }
        start.countDown();
        List<T> results = new ArrayList<>();
        for (Future<T> future : futures) {
            results.add(future.get());   // rethrows if any instance failed
        }
        pool.shutdown();
        return results;
    }

    @Test
    void instancesStartingTogetherOnAnEmptyDatabaseCreateExactlyOneAdministrator() throws Exception {
        jdbc.update("UPDATE portfolio_publication SET published_by = NULL");
        jdbc.update("DELETE FROM admin_user");

        simultaneously(() -> {
            adminBootstrap.run(new DefaultApplicationArguments());
            return true;
        });

        assertThat(jdbc.queryForObject("SELECT count(*) FROM admin_user", Integer.class)).isEqualTo(1);
    }

    @Test
    void simultaneousPublishesGetConsecutiveVersions() throws Exception {
        int before = jdbc.queryForObject("SELECT max(version_number) FROM portfolio_publication", Integer.class);

        List<Integer> versions = simultaneously(() -> publications.publish("concurrent", null).getVersionNumber());

        assertThat(versions).doesNotHaveDuplicates().hasSize(INSTANCES);
        assertThat(jdbc.queryForObject("SELECT max(version_number) FROM portfolio_publication", Integer.class))
                .isEqualTo(before + INSTANCES);
    }

    @Test
    void initialPublicationHappensOnlyOnceEvenWhenRacing() throws Exception {
        List<Boolean> published = simultaneously(() -> publications.publishInitialIfNone("initial"));
        // Content was already published in this database, so nobody publishes again.
        assertThat(published).containsOnly(false);
    }
}
