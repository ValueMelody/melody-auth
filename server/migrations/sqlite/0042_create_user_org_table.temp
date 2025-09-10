CREATE TABLE [user_org] (
  "id" integer PRIMARY KEY,
  "userId" integer NOT NULL,
  "orgId" integer NOT NULL,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null,
  FOREIGN KEY(userId) REFERENCES user(id)
  FOREIGN KEY(orgId) REFERENCES org(id)
);
CREATE UNIQUE INDEX idx_unique_user_org ON user_org (userId, orgId) WHERE deletedAt IS NULL;

INSERT INTO user_org (userId, orgId, createdAt, updatedAt)
SELECT 
    u.id as userId,
    o.id as orgId,
    CURRENT_TIMESTAMP as createdAt,
    CURRENT_TIMESTAMP as updatedAt
FROM user u
INNER JOIN org o ON u.orgSlug = o.slug
WHERE u.orgSlug != ''
  AND u.orgSlug IS NOT NULL
  AND u.deletedAt IS NULL
  AND o.deletedAt IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM user_org uo 
    WHERE uo.userId = u.id 
      AND uo.orgId = o.id 
      AND uo.deletedAt IS NULL
  );
