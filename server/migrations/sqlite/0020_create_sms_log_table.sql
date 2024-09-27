CREATE TABLE [sms_log] (
  "id" integer PRIMARY KEY,
  "success" integer,
  "receiver" text,
  "response" text,
  "content" text,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null
);
