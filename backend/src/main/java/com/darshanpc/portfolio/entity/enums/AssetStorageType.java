package com.darshanpc.portfolio.entity.enums;

/**
 * EXTERNAL: a URL (e.g. a static file served by the frontend).
 * LOCAL: a file stored by the backend on disk.
 * DATABASE: the file's bytes stored in PostgreSQL (portfolio_asset_content), for serverless hosting.
 */
public enum AssetStorageType {
    EXTERNAL,
    LOCAL,
    DATABASE
}
