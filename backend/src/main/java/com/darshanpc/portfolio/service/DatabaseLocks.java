package com.darshanpc.portfolio.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Locks that every application instance respects (several AWS Lambda instances
 * may start or work at the same moment). Uses PostgreSQL transaction-level
 * advisory locks: held until the surrounding transaction ends, so they work
 * through a transaction-mode connection pooler such as Neon's.
 */
@Component
@RequiredArgsConstructor
public class DatabaseLocks {

    private final JdbcTemplate jdbc;

    /**
     * Waits until no other transaction holds the lock {@code name}, then holds it
     * until the current transaction commits or rolls back.
     */
    @Transactional(propagation = Propagation.MANDATORY)
    public void lockForTransaction(String name) {
        jdbc.queryForObject("SELECT pg_advisory_xact_lock(hashtext(?)) IS NULL", Boolean.class, "portfolio:" + name);
    }
}
