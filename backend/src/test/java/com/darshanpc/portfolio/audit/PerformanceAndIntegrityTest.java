package com.darshanpc.portfolio.audit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.darshanpc.portfolio.IntegrationTest;
import com.darshanpc.portfolio.service.publication.PortfolioSnapshotAssembler;
import com.darshanpc.portfolio.service.publication.PublicationService;
import jakarta.persistence.EntityManagerFactory;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.SessionFactory;
import org.hibernate.stat.Statistics;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.support.TransactionTemplate;

/**
 * Batch 6 performance and data-integrity checks: HTTP caching of the public
 * API, a constant number of SQL statements to build the portfolio however many
 * items it has, and the foreign-key rules in PostgreSQL.
 */
@IntegrationTest
class PerformanceAndIntegrityTest {

    @Autowired
    MockMvc mvc;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    TransactionTemplate tx;

    @Autowired
    EntityManagerFactory emf;

    @Autowired
    PortfolioSnapshotAssembler assembler;

    @Autowired
    PublicationService publications;

    @Test
    void publicResponsesRevalidateWithTheVersionEtagAndChangeAfterPublishing() throws Exception {
        String etag = mvc.perform(get("/api/v1/portfolio"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-cache, public"))
                .andReturn().getResponse().getHeader(HttpHeaders.ETAG);
        assertThat(etag).matches("W/\"v\\d+\"");

        mvc.perform(get("/api/v1/portfolio").header(HttpHeaders.IF_NONE_MATCH, etag))
                .andExpect(status().isNotModified())
                .andExpect(content().string(""));
        mvc.perform(get("/api/v1/projects").header(HttpHeaders.IF_NONE_MATCH, etag))
                .andExpect(status().isNotModified());

        publications.publish("Batch 6 cache test", null);

        String newEtag = mvc.perform(get("/api/v1/portfolio").header(HttpHeaders.IF_NONE_MATCH, etag))
                .andExpect(status().isOk())
                .andReturn().getResponse().getHeader(HttpHeaders.ETAG);
        assertThat(newEtag).isNotEqualTo(etag);
    }

    @Test
    void buildingThePortfolioUsesTheSameNumberOfQueriesForMoreItems() {
        Statistics stats = emf.unwrap(SessionFactory.class).getStatistics();
        stats.setStatisticsEnabled(true);

        Long baseline = tx.execute(status -> {
            stats.clear();
            assembler.assemble(0, Instant.now());
            return stats.getPrepareStatementCount();
        });

        Long withMoreItems = tx.execute(status -> {
            String category = jdbc.queryForObject("SELECT id::text FROM skill_category LIMIT 1", String.class);
            for (int i = 0; i < 8; i++) {
                UUID project = UUID.randomUUID();
                jdbc.update("""
                        INSERT INTO project (id, slug, name, summary, description, image_alt, status, display_order)
                        VALUES (?, ?, ?, 'Summary', 'Description', 'Screenshot', 'PLANNED', ?)""",
                        project, "perf-project-" + i, "Perf project " + i, 1000 + i);
                jdbc.update("INSERT INTO project_tag (project_id, position, tag) VALUES (?, 0, 'Java'), (?, 1, 'SQL')",
                        project, project);
                jdbc.update("INSERT INTO project_highlight (project_id, position, text) VALUES (?, 0, 'Fast')", project);

                UUID newCategory = UUID.randomUUID();
                jdbc.update("""
                        INSERT INTO skill_category (id, title, icon, description, display_order)
                        VALUES (?, ?, 'CODE', 'Perf', ?)""", newCategory, "Perf " + i, 1000 + i);
                jdbc.update("INSERT INTO skill (id, category_id, name, display_order) VALUES (?, ?, 'A', 0), (?, ?, 'B', 1)",
                        UUID.randomUUID(), newCategory, UUID.randomUUID(), newCategory);
                jdbc.update("INSERT INTO skill (id, category_id, name, display_order) VALUES (?, ?::uuid, ?, 999)",
                        UUID.randomUUID(), category, "Perf skill " + i);
            }
            stats.clear();
            var snapshot = assembler.assemble(0, Instant.now());
            assertThat(snapshot.projects().items()).hasSizeGreaterThanOrEqualTo(12);
            long count = stats.getPrepareStatementCount();
            status.setRollbackOnly();
            return count;
        });

        assertThat(withMoreItems).as("statements with 8 more projects and categories").isEqualTo(baseline);
        assertThat(baseline).as("statements to assemble the whole portfolio").isLessThan(30);
    }

    @Test
    void foreignKeysCascadeOrClearAsDesigned() {
        tx.executeWithoutResult(status -> {
            UUID asset = UUID.randomUUID();
            jdbc.update("""
                    INSERT INTO portfolio_asset (id, kind, storage_type, storage_key, original_filename, content_type, size_bytes)
                    VALUES (?, 'IMAGE', 'LOCAL', ?, 'x.png', 'image/png', 1)""", asset, asset + ".png");
            UUID project = UUID.randomUUID();
            jdbc.update("""
                    INSERT INTO project (id, slug, name, summary, description, image_alt, status, display_order, image_asset_id)
                    VALUES (?, 'fk-test', 'FK test', 'S', 'D', 'Alt', 'PLANNED', 2000, ?)""", project, asset);
            jdbc.update("INSERT INTO project_tag (project_id, position, tag) VALUES (?, 0, 'Java')", project);

            // Deleting a file clears the reference instead of failing or deleting the project.
            jdbc.update("DELETE FROM portfolio_asset WHERE id = ?", asset);
            assertThat(jdbc.queryForObject("SELECT image_asset_id FROM project WHERE id = ?", UUID.class, project)).isNull();

            // Deleting a project removes its tags.
            jdbc.update("DELETE FROM project WHERE id = ?", project);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM project_tag WHERE project_id = ?", Integer.class, project))
                    .isZero();

            // Deleting a skill category removes its skills.
            UUID category = jdbc.queryForObject("SELECT category_id FROM skill LIMIT 1", UUID.class);
            jdbc.update("DELETE FROM skill_category WHERE id = ?", category);
            assertThat(jdbc.queryForObject("SELECT count(*) FROM skill WHERE category_id = ?", Integer.class, category))
                    .isZero();

            // Slugs are unique and validated by the database itself.
            assertThat(jdbc.queryForObject("""
                    SELECT count(*) FROM pg_constraint WHERE conname IN ('ux_project_slug', 'ck_project_slug')""",
                    Integer.class)).isEqualTo(2);

            status.setRollbackOnly();
        });
    }

    @Test
    void everyForeignKeyIsIndexed() {
        // Foreign-key columns that are not the leading column of any index.
        var unindexed = jdbc.queryForList("""
                SELECT c.conrelid::regclass || '.' || a.attname AS fk
                FROM pg_constraint c
                JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = c.conkey[1]
                WHERE c.contype = 'f'
                  AND NOT EXISTS (
                      SELECT 1 FROM pg_index i
                      WHERE i.indrelid = c.conrelid AND i.indkey[0] = c.conkey[1])""", String.class);
        assertThat(unindexed).isEmpty();
    }
}
