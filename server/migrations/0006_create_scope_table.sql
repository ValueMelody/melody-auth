-- Migration number: 0006 	 2024-07-19T19:26:30.000Z
CREATE TABLE [scope] (
  "id" integer PRIMARY KEY,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "note" text NOT NULL DEFAULT "",
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null
);
CREATE UNIQUE INDEX idx_unique_scope_name ON scope (name) WHERE deletedAt IS NULL;
INSERT INTO scope ("name", "type") values ('openid', 'spa');
INSERT INTO scope ("name", "type") values ('profile', 'spa');
INSERT INTO scope ("name", "type") values ('offline_access', 'spa');
INSERT INTO scope ("name", "type", "note") values ('root', 's2s', 'Allows a S2S app to perform any action and access all data endpoints within the API.');
INSERT INTO scope ("name", "type", "note") values ('read_user', 's2s', 'Allows a S2S app to access user-specific data without modifying it.');
INSERT INTO scope ("name", "type", "note") values ('write_user', 's2s', 'Allows a S2S app to create, update, and delete user-specific data.');
INSERT INTO scope ("name", "type", "note") values ('read_app', 's2s', 'Allows a S2S app to access app-specific data without modifying it.');
INSERT INTO scope ("name", "type", "note") values ('write_app', 's2s', 'Allows a S2S app to create, update, and delete app-specific data.');
INSERT INTO scope ("name", "type", "note") values ('read_scope', 's2s', 'Allows a S2S app to access scope-specific data without modifying it.');
INSERT INTO scope ("name", "type", "note") values ('write_scope', 's2s', 'Allows a S2S app to create, update, and delete scope-specific data.');
INSERT INTO scope ("name", "type", "note") values ('read_role', 's2s', 'Allows a S2S app to access role-specific data without modifying it.');
INSERT INTO scope ("name", "type", "note") values ('write_role', 's2s', 'Allows a S2S app to create, update, and delete role-specific data.');