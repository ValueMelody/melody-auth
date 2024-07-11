-- Migration number: 0002 	 2024-07-09T20:32:20.655Z
CREATE TABLE [user] (
  "id" integer PRIMARY KEY,
  "oauthId" text NOT NULL,
  "email" text,
  "password" text,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null,
  UNIQUE(oauthId)
);
