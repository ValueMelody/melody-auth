-- Migration number: 0002 	 2024-07-09T20:32:20.655Z
CREATE TABLE [email_log] (
  "id" integer PRIMARY KEY,
  "success" integer,
  "receiver" text,
  "response" text,
  "content" text,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null
);
