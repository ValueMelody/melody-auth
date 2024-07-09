-- Migration number: 0001 	 2024-07-09T02:01:37.604Z
CREATE TABLE [app] (
  "id" integer PRIMARY KEY,
  "clientId" text NOT NULL,
  "secret" text NOT NULL,
  "deletedAt" text DEFAULT null,
  "redirectUris" text NOT NULL DEFAULT ""
);
