-- Batch 6: indexes for the two foreign keys that had none.
-- Without them, deleting an asset or an administrator scans the referencing table.
CREATE INDEX IF NOT EXISTS ix_seo_og_image_asset ON seo_settings (og_image_asset_id);
CREATE INDEX IF NOT EXISTS ix_publication_published_by ON portfolio_publication (published_by);
