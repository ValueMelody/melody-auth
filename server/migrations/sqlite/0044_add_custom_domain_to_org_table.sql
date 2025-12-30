ALTER TABLE org ADD COLUMN "customDomain" TEXT DEFAULT NULL;
ALTER TABLE org ADD COLUMN "customDomainVerified" INTEGER DEFAULT 0;
ALTER TABLE org ADD COLUMN "customDomainVerificationToken" TEXT DEFAULT NULL;
CREATE UNIQUE INDEX idx_org_custom_domain ON org("customDomain") WHERE "customDomain" IS NOT NULL AND "deletedAt" IS NULL;
