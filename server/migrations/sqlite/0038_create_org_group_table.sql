CREATE TABLE [org_group] (
  "id" integer PRIMARY KEY,
  "orgId" integer NOT NULL,
  "name" text NOT NULL,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null,
  FOREIGN KEY(orgId) REFERENCES org(id)
);
CREATE UNIQUE INDEX idx_unique_org_group ON org_group ("orgId", name) WHERE deletedAt IS NULL;
