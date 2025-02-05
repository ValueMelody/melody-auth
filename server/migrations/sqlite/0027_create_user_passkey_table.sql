CREATE TABLE [user_passkey] (
  "id" integer PRIMARY KEY,
  "userId" integer NOT NULL,
  "credentialId" text NOT NULL,
  "publicKey" text NOT NULL,
  "counter" integer NOT NULL,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null,
  FOREIGN KEY(userId) REFERENCES user(id)
);
