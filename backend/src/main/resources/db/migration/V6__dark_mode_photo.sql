-- Optional second profile photo shown when a visitor uses the dark theme.
ALTER TABLE portfolio_profile
    ADD COLUMN photo_dark_asset_id uuid REFERENCES portfolio_asset (id) ON DELETE SET NULL;
CREATE INDEX ix_profile_photo_dark_asset ON portfolio_profile (photo_dark_asset_id);
