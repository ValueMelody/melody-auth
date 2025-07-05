import { Hono } from 'hono'
import { BlankSchema } from 'hono/types'
import { Session } from 'hono-sessions'
import type {
  Transporter, SentMessageInfo,
} from 'nodemailer'
import { oauthDto } from 'dtos'
import { typeConfig } from 'configs'
import { userModel } from 'models'

export type Locale = 'en' | 'fr'

export type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  SMTP: { init: () => Transporter<SentMessageInfo> };
  ENVIRONMENT: string;
  DEV_EMAIL_RECEIVER: string;
  DEV_SMS_RECEIVER: string;
  SENDGRID_API_KEY: string;
  SENDGRID_SENDER_ADDRESS: string;
  BREVO_API_KEY: string;
  BREVO_SENDER_ADDRESS: string;
  MAILGUN_API_KEY: string;
  MAILGUN_SENDER_ADDRESS: string;
  RESEND_API_KEY: string;
  RESEND_SENDER_ADDRESS: string;
  POSTMARK_API_KEY: string;
  POSTMARK_SENDER_ADDRESS: string;
  SMS_MFA_IS_REQUIRED: boolean;
  SMS_MFA_MESSAGE_THRESHOLD: number;
  TWILIO_ACCOUNT_ID: string;
  TWILIO_AUTH_TOKEN: string;
  TWILIO_SENDER_NUMBER: string;
  AUTHORIZATION_CODE_EXPIRES_IN: number;
  SPA_ACCESS_TOKEN_EXPIRES_IN: number;
  S2S_ACCESS_TOKEN_EXPIRES_IN: number;
  SPA_REFRESH_TOKEN_EXPIRES_IN: number;
  ID_TOKEN_EXPIRES_IN: number;
  SERVER_SESSION_EXPIRES_IN: number;
  COMPANY_LOGO_URL: string;
  COMPANY_EMAIL_LOGO_URL: string;
  EMAIL_SENDER_NAME: string;
  SMTP_SENDER_ADDRESS: string;
  AUTH_SERVER_URL: string;
  ENABLE_SIGN_UP: boolean;
  ENABLE_PASSWORD_SIGN_IN: boolean;
  ENABLE_PASSWORD_RESET: boolean;
  PASSWORD_RESET_EMAIL_THRESHOLD: number;
  ENABLE_PASSWORDLESS_SIGN_IN: boolean;
  ENABLE_NAMES: boolean;
  NAMES_IS_REQUIRED: boolean;
  ENABLE_USER_APP_CONSENT: boolean;
  ENABLE_EMAIL_VERIFICATION: boolean;
  REPLACE_EMAIL_VERIFICATION_WITH_WELCOME_EMAIL: boolean;
  EMAIL_MFA_IS_REQUIRED: boolean;
  EMAIL_MFA_EMAIL_THRESHOLD: number;
  CHANGE_EMAIL_EMAIL_THRESHOLD: number;
  BLOCKED_POLICIES: string[];
  OTP_MFA_IS_REQUIRED: boolean;
  GOOGLE_AUTH_CLIENT_ID: string;
  ENFORCE_ONE_MFA_ENROLLMENT: userModel.MfaType[];
  ALLOW_EMAIL_MFA_AS_BACKUP: boolean;
  ALLOW_PASSKEY_ENROLLMENT: boolean;
  ENABLE_RECOVERY_CODE: boolean;
  ACCOUNT_LOCKOUT_THRESHOLD: number;
  ACCOUNT_LOCKOUT_EXPIRES_IN: number;
  UNLOCK_ACCOUNT_VIA_PASSWORD_RESET: boolean;
  SUPPORTED_LOCALES: Locale[];
  ENABLE_LOCALE_SELECTOR: boolean;
  TERMS_LINK: string;
  PRIVACY_POLICY_LINK: string;
  ENABLE_ORG: boolean;
  ENABLE_USER_ATTRIBUTE: boolean;
  ENABLE_EMAIL_LOG: boolean;
  ENABLE_SMS_LOG: boolean;
  ENABLE_SIGN_IN_LOG: boolean;
  LOG_LEVEL: 'silent' | 'info' | 'warn' | 'error';
  FACEBOOK_AUTH_CLIENT_ID: string;
  FACEBOOK_AUTH_CLIENT_SECRET: string;
  GITHUB_AUTH_CLIENT_ID: string;
  GITHUB_AUTH_CLIENT_SECRET: string;
  GITHUB_AUTH_APP_NAME: string;
  DISCORD_AUTH_CLIENT_ID: string;
  DISCORD_AUTH_CLIENT_SECRET: string;
  APPLE_AUTH_CLIENT_ID: string;
  APPLE_AUTH_CLIENT_SECRET: string;
  OIDC_AUTH_PROVIDERS: string[] | undefined;
  EMBEDDED_AUTH_ORIGINS: string[];
  ENABLE_SAML_SP: boolean;
};

export type Context = {
  Bindings: Bindings;
  Variables: {
    access_token_body?: typeConfig.AccessTokenBody;
    basic_auth_body?: typeConfig.BasicAuthBody;
    session: Session;
    session_key_rotation: boolean;
  };
}

export type App = Hono<Context, BlankSchema, '/'>

export interface AuthCodeBodyMfaConfig {
  e: boolean; // requireEmailMfa
  o: boolean; // requireOtpMfa
  s: boolean; // requireSmsMfa
  b: boolean; // allowEmailMfaAsBackup
}

export interface AuthCodeBody {
  request: oauthDto.GetAuthorizeDto;
  user: userModel.Record;
  appId: number;
  appName: string;
  isFullyAuthorized?: boolean;
  mfa?: AuthCodeBodyMfaConfig;
}

export interface EmbeddedSessionBody {
  request: oauthDto.CoreAuthorizeDto;
  appId: number;
  appName: string;
  user?: userModel.Record;
  isFullyAuthorized?: boolean;
  mfa?: AuthCodeBodyMfaConfig;
}

export interface EmbeddedSessionBodyWithUser {
  request: oauthDto.CoreAuthorizeDto;
  appId: number;
  appName: string;
  user: userModel.Record;
  mfa?: AuthCodeBodyMfaConfig;
}

export interface AccessTokenBody {
  sub: string;
  azp: string;
  iss: string;
  scope: string;
  iat: number;
  exp: number;
  roles?: string[];
  impersonatedBy?: string;
}

export interface BasicAuthBody {
  username: string;
  password: string;
}

export interface RefreshTokenBody {
  authId: string;
  clientId: string;
  scope: string;
  roles: string[];
  impersonatedBy?: string;
}

export interface Pagination {
  pageSize: number;
  pageNumber: number;
}

export interface Search {
  column: string;
  value: string;
}

export interface Match {
  column: string;
  value: string;
}

export interface WhereIn {
  values: number[];
}

export interface Sort {
  column: string;
  order: 'ASC' | 'DESC';
}
