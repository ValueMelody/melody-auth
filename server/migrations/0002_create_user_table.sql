-- Migration number: 0002 	 2024-07-09T20:32:20.655Z
CREATE TABLE [user] (
  "id" integer PRIMARY KEY,
  "authId" text NOT NULL,
  "email" text DEFAULT null,
  "password" text,
  "firstName" text DEFAULT null,
  "lastName" text DEFAULT null,
  "emailVerified" integer DEFAULT 0,
  "emailVerificationCode" text DEFAULT null,
  "emailVerificationCodeExpiresOn" integer DEFAULT null,
  "passwordResetCode" text DEFAULT null,
  "passwordResetCodeExpiresOn" integer DEFAULT null,
  "isActive" integer DEFAULT 1,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null
);
CREATE UNIQUE INDEX idx_unique_user_authId ON user (authId) WHERE deletedAt IS NULL;
