-- Migration number: 0001 	 2024-07-09T02:01:37.604Z
CREATE TABLE [app] (
  "id" integer PRIMARY KEY,
  "clientId" text NOT NULL,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "secret" text NOT NULL,
  "redirectUris" text NOT NULL DEFAULT "",
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null,
  UNIQUE(clientId)
);
INSERT INTO app ("clientId", "name", "type", "secret", "redirectUris") values ("12345", "test-spa", "spa", "abc", "http://localhost:3000/en/dashboard");
INSERT INTO app ("clientId", "name", "type", "secret", "redirectUris") values ("23456", "test-s2s", "s2s", "bcd", "");
