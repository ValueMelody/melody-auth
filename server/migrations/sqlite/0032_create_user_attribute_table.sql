CREATE TABLE [user_attribute] (
  "id" integer PRIMARY KEY,
  "name" text NOT NULL,
  "includeInSignUpForm" integer NOT NULL DEFAULT 0,
  "requiredInSignUpForm" integer NOT NULL DEFAULT 0,
  "includeInIdTokenBody" integer NOT NULL DEFAULT 0,
  "includeInUserInfo" integer NOT NULL DEFAULT 0,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null
);
CREATE UNIQUE INDEX idx_unique_user_attribute ON user_attribute (name) WHERE deletedAt IS NULL;
