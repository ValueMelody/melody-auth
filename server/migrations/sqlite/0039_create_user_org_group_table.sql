CREATE TABLE [user_org_group] (
  "id" integer PRIMARY KEY,
  "userId" integer NOT NULL,
  "orgGroupId" integer NOT NULL,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null,
  FOREIGN KEY(userId) REFERENCES user(id)
  FOREIGN KEY(orgGroupId) REFERENCES org_group(id)
);
CREATE UNIQUE INDEX idx_unique_user_org_group ON user_org_group (userId, orgGroupId) WHERE deletedAt IS NULL;
