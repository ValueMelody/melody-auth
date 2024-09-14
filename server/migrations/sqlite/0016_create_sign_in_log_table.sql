-- Migration number: 0002 	 2024-07-09T20:32:20.655Z
CREATE TABLE [sign_in_log] (
  "id" integer PRIMARY KEY,
  "ip" text,
  "detail" text,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null
);
