-- Migration number: 0004 	 2024-07-19T19:26:30.000Z
CREATE TABLE [user_role] (
  "id" integer PRIMARY KEY,
  "userId" integer NOT NULL,
  "roleId" integer NOT NULL,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null,
  UNIQUE(userId, roleId)
  FOREIGN KEY(userId) REFERENCES user(id)
  FOREIGN KEY(roleId) REFERENCES role(id)
);
INSERT INTO user_role ("userId", "roleId") values (1, 1);
