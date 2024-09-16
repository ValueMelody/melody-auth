ALTER TABLE user RENAME COLUMN googleId TO socialAccountId;
ALTER TABLE user ADD socialAccountType text DEFAULT null;
UPDATE user set socialAccountType = 'Google' where socialAccountId IS NOT NULL;