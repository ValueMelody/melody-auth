-- Migration number: 0007 	 2024-07-19T19:26:30.000Z
CREATE TABLE [app_scope] (
  "id" integer PRIMARY KEY,
  "appId" integer NOT NULL,
  "scopeId" integer NOT NULL,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null,
  FOREIGN KEY(appId) REFERENCES app(id)
  FOREIGN KEY(scopeId) REFERENCES scope(id)
);
CREATE UNIQUE INDEX idx_unique_app_scope ON app_scope (appId, scopeId) WHERE deletedAt IS NULL;
INSERT INTO app_scope ("appId", "scopeId") values (1, 1);
INSERT INTO app_scope ("appId", "scopeId") values (1, 2);
INSERT INTO app_scope ("appId", "scopeId") values (1, 3);
INSERT INTO app_scope ("appId", "scopeId") values (2, 4);