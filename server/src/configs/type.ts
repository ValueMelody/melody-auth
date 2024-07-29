import { Hono } from 'hono'
import { BlankSchema } from 'hono/types'
import { Session } from 'hono-sessions'
import { oauthDto } from 'dtos'
import { typeConfig } from 'configs'

export type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  ENVIRONMENT: string;
  DEV_EMAIL_RECEIVER: string;
  AUTHORIZATION_CODE_JWT_SECRET: string;
  REFRESH_TOKEN_JWT_SECRET: string;
  SERVER_SESSION_SECRET: string;
  SENDGRID_API_KEY: string;
  SENDGRID_SENDER_ADDRESS: string;
  AUTHORIZATION_CODE_EXPIRES_IN: number;
  SPA_ACCESS_TOKEN_EXPIRES_IN: number;
  S2S_ACCESS_TOKEN_EXPIRES_IN: number;
  SPA_REFRESH_TOKEN_EXPIRES_IN: number;
  ID_TOKEN_EXPIRES_IN: number;
  SERVER_SESSION_EXPIRES_IN: number;
  COMPANY_LOGO_URL: string;
  AUTH_SERVER_URL: string;
  ENABLE_SIGN_UP: boolean;
  ENABLE_PASSWORD_RESET: boolean;
  ENABLE_NAMES: boolean;
  NAMES_IS_REQUIRED: boolean;
  ENABLE_USER_APP_CONSENT: boolean;
  ENABLE_EMAIL_VERIFICATION: boolean;
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

export interface AuthCodeBody {
  request: oauthDto.GetAuthorizeReqDto;
  user: {
    id: number;
    authId: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  appId: number;
  exp: number;
}

export interface AccessTokenBody {
  sub: string;
  scope: string;
  iat: number;
  exp: number;
  roles?: string[];
}

export interface BasicAuthBody {
  username: string;
  password: string;
}

export interface RefreshTokenBody {
  sub: string;
  azp: string;
  scope: string;
  iat: number;
  exp: number;
  roles?: string[];
}

export interface IdTokenBody {
  iss: string;
  sub: string;
  azp: string;
  exp: number;
  iat: number;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  roles?: string[];
}
