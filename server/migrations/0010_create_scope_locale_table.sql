CREATE TABLE [scope_locale] (
  "id" integer PRIMARY KEY,
  "scopeId" integer NOT NULL,
  "locale" text NOT NULL,
  "value" text NOT NULL DEFAULT "",
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null,
  FOREIGN KEY(scopeId) REFERENCES scope(id)
);
CREATE UNIQUE INDEX idx_unique_scope_locale ON scope_locale (scopeId, locale) WHERE deletedAt IS NULL;
INSERT INTO scope_locale ("scopeId", "locale", "value") values (2, 'en', 'Access your basic profile information');
INSERT INTO scope_locale ("scopeId", "locale", "value") values (2, 'fr', 'Accéder à vos informations de profil de base');
