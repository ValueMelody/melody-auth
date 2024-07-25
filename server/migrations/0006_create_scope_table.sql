-- Migration number: 0006 	 2024-07-19T19:26:30.000Z
CREATE TABLE [scope] (
  "id" integer PRIMARY KEY,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null,
  UNIQUE(name)
);
INSERT INTO scope ("name", "type") values ("openid", "spa");
INSERT INTO scope ("name", "type") values ("profile", "spa");
INSERT INTO scope ("name", "type") values ("offline_access", "spa");
INSERT INTO scope ("name", "type") values ("read_user", "s2s");
INSERT INTO scope ("name", "type") values ("write_user", "s2s");
INSERT INTO scope ("name", "type") values ("read_app", "s2s");
INSERT INTO scope ("name", "type") values ("write_app", "s2s");
INSERT INTO scope ("name", "type") values ("read_scope", "s2s");
INSERT INTO scope ("name", "type") values ("write_scope", "s2s");
INSERT INTO scope ("name", "type") values ("read_role", "s2s");
INSERT INTO scope ("name", "type") values ("write_role", "s2s");