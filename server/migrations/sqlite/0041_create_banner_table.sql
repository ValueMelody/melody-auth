CREATE TABLE [banner] (
  "id" integer PRIMARY KEY,
  "type" text NOT NULL,
  "text" text,
  "locales" text,
  "isActive" integer DEFAULT 1,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null
);


CREATE TABLE [app_banner] (
  "id" integer PRIMARY KEY,
  "bannerId" integer NOT NULL,
  "appId" integer NOT NULL,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null,
  FOREIGN KEY(bannerId) REFERENCES banner(id),
  FOREIGN KEY(appId) REFERENCES app(id)
);

CREATE UNIQUE INDEX idx_unique_app_banner ON app_banner (appId, bannerId) WHERE deletedAt IS NULL;
