-- Batch 7: everything the app keeps must live in PostgreSQL so it can run as
-- many short-lived instances (AWS Lambda) without local disk or shared memory.

-- 1. Uploaded files stored in the database (portfolio.storage.type=database).
ALTER TABLE portfolio_asset DROP CONSTRAINT ck_asset_storage_type;
ALTER TABLE portfolio_asset ADD CONSTRAINT ck_asset_storage_type
    CHECK (storage_type IN ('EXTERNAL', 'LOCAL', 'DATABASE'));
ALTER TABLE portfolio_asset DROP CONSTRAINT ck_asset_location;
ALTER TABLE portfolio_asset ADD CONSTRAINT ck_asset_location CHECK (
    (storage_type = 'EXTERNAL' AND url IS NOT NULL) OR
    (storage_type = 'LOCAL' AND storage_key IS NOT NULL) OR
    (storage_type = 'DATABASE')
);

-- File bytes kept apart from the metadata row, so listing assets never loads them.
CREATE TABLE portfolio_asset_content (
    asset_id uuid  PRIMARY KEY REFERENCES portfolio_asset (id) ON DELETE CASCADE,
    data     bytea NOT NULL
);

-- 2. Fixed-window rate limits shared by all instances (portfolio.rate-limit-store=jdbc).
CREATE TABLE rate_limit_window (
    bucket_key   varchar(200) PRIMARY KEY,
    window_start timestamptz  NOT NULL,
    hits         integer      NOT NULL
);
CREATE INDEX ix_rate_limit_window_start ON rate_limit_window (window_start);

-- 3. Studio sessions in the database (portfolio.session-store=jdbc).
--    Official Spring Session JDBC schema for PostgreSQL.
CREATE TABLE SPRING_SESSION (
    PRIMARY_ID            CHAR(36) NOT NULL,
    SESSION_ID            CHAR(36) NOT NULL,
    CREATION_TIME         BIGINT   NOT NULL,
    LAST_ACCESS_TIME      BIGINT   NOT NULL,
    MAX_INACTIVE_INTERVAL INT      NOT NULL,
    EXPIRY_TIME           BIGINT   NOT NULL,
    PRINCIPAL_NAME        VARCHAR(100),
    CONSTRAINT SPRING_SESSION_PK PRIMARY KEY (PRIMARY_ID)
);
CREATE UNIQUE INDEX SPRING_SESSION_IX1 ON SPRING_SESSION (SESSION_ID);
CREATE INDEX SPRING_SESSION_IX2 ON SPRING_SESSION (EXPIRY_TIME);
CREATE INDEX SPRING_SESSION_IX3 ON SPRING_SESSION (PRINCIPAL_NAME);

CREATE TABLE SPRING_SESSION_ATTRIBUTES (
    SESSION_PRIMARY_ID CHAR(36)     NOT NULL,
    ATTRIBUTE_NAME     VARCHAR(200) NOT NULL,
    ATTRIBUTE_BYTES    BYTEA        NOT NULL,
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_PK PRIMARY KEY (SESSION_PRIMARY_ID, ATTRIBUTE_NAME),
    CONSTRAINT SPRING_SESSION_ATTRIBUTES_FK FOREIGN KEY (SESSION_PRIMARY_ID)
        REFERENCES SPRING_SESSION (PRIMARY_ID) ON DELETE CASCADE
);
