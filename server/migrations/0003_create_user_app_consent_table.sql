-- Migration number: 0003 	 2024-07-15T20:29:00.000Z
CREATE TABLE [user_app_consent] (
  "id" integer PRIMARY KEY,
  "userId" integer NOT NULL,
  "appId" integer NOT NULL,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null,
  UNIQUE(userId, appId)
  FOREIGN KEY(userId) REFERENCES user(id)
  FOREIGN KEY(appId) REFERENCES app(id)
);
