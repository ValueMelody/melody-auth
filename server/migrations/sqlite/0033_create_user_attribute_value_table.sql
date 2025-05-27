CREATE TABLE [user_attribute_value] (
  "id" integer PRIMARY KEY,
  "userId" integer NOT NULL,
  "userAttributeId" integer NOT NULL,
  "value" text,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null,
  FOREIGN KEY(userId) REFERENCES user(id)
  FOREIGN KEY(userAttributeId) REFERENCES user_attribute(id)
);
CREATE UNIQUE INDEX idx_unique_user_attribute_value ON user_attribute_value (userId, userAttributeId) WHERE deletedAt IS NULL;
