-- Migration number: 0001 	 2024-07-09T02:01:37.604Z
CREATE TABLE [app] (
  "id" integer PRIMARY KEY,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "clientId" text NOT NULL DEFAULT (
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END)
  ),
  "secret" text NOT NULL DEFAULT (
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END) ||
    (CASE WHEN random() % 2 = 0 THEN lower(hex(randomblob(1))) ELSE upper(hex(randomblob(1))) END)
  ),
  "redirectUris" text NOT NULL DEFAULT "",
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null,
  UNIQUE(clientId)
  UNIQUE(name)
);
INSERT INTO app ("name", "type", "redirectUris") values ("Admin Panel (SPA)", "spa", "http://localhost:3000/en/dashboard");
INSERT INTO app ("name", "type") values ("Admin Panel (S2S)", "s2s");
