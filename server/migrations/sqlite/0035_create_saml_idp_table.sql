CREATE TABLE [saml_idp] (
  "id" integer PRIMARY KEY,
  "name" text NOT NULL,
  "userIdAttribute" text NOT NULL,
  "emailAttribute" text DEFAULT null,
  "firstNameAttribute" text DEFAULT null,
  "lastNameAttribute" text DEFAULT null,
  "metadata" text NOT NULL,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null
);

CREATE UNIQUE INDEX idx_unique_saml_idp_name ON saml_idp (name) WHERE deletedAt IS NULL;
