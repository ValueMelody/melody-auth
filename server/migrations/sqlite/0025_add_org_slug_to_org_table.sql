ALTER TABLE org ADD slug NOT NULL DEFAULT "";
CREATE UNIQUE INDEX idx_unique_org_slug ON org (slug) WHERE deletedAt IS NULL;
