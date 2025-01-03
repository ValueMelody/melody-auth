CREATE TABLE [org] (
  "id" integer PRIMARY KEY,
  "name" text NOT NULL,
  "companyLogoUrl" text NOT NULL DEFAULT "",
  "fontFamily" text NOT NULL DEFAULT "",
  "fontUrl" text NOT NULL DEFAULT "",
  "layoutColor" text NOT NULL DEFAULT "",
  "labelColor" text NOT NULL DEFAULT "",
  "primaryButtonColor" text NOT NULL DEFAULT "",
  "primaryButtonLabelColor" text NOT NULL DEFAULT "",
  "primaryButtonBorderColor" text NOT NULL DEFAULT "",
  "secondaryButtonColor" text NOT NULL DEFAULT "",
  "secondaryButtonLabelColor" text NOT NULL DEFAULT "",
  "secondaryButtonBorderColor" text NOT NULL DEFAULT "",
  "criticalIndicatorColor" text NOT NULL DEFAULT "",
  "emailSenderName" text NOT NULL DEFAULT "",
  "termsLink" text NOT NULL DEFAULT "",
  "privacyPolicyLink" text NOT NULL DEFAULT "",
  "createdAt" text DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" text DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" text DEFAULT null
);
CREATE UNIQUE INDEX idx_unique_org_name ON org (name) WHERE deletedAt IS NULL;
