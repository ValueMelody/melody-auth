ALTER TABLE app ADD "useSystemMfaConfig" integer NOT NULL DEFAULT 1;
ALTER TABLE app ADD "requireEmailMfa" integer NOT NULL DEFAULT 0;
ALTER TABLE app ADD "requireOtpMfa" integer NOT NULL DEFAULT 0;
ALTER TABLE app ADD "requireSmsMfa" integer NOT NULL DEFAULT 0;
ALTER TABLE app ADD "allowEmailMfaAsBackup" integer NOT NULL DEFAULT 0;
