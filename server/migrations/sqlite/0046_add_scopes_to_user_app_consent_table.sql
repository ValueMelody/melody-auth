ALTER TABLE user_app_consent ADD "scopes" text NOT NULL DEFAULT '["openid","profile","offline_access"]';
