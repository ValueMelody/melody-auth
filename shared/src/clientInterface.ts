import { GetUserInfoRes } from './serverInterface.js'

export interface ProviderConfig {
  serverUri: string;
  clientId: string;
  redirectUri: string;
  scopes?: string[];
  storage?: 'sessionStorage' | 'localStorage';
  onLoginSuccess?: (attributes: { state?: string; locale?: string }) => void;
}

export type AuthorizeMethod = 'popup' | 'redirect';

export interface AccessTokenStorage {
  accessToken: string;
  expiresIn: number;
  expiresOn: number;
}

export interface RefreshTokenStorage {
  refreshToken: string;
  expiresIn: number;
  expiresOn: number;
}

export interface IdTokenBody {
  iss: string;
  sub: string;
  azp: string;
  aud: string;
  exp: number;
  iat: number;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  locale: string;
  roles?: string[];
  attributes?: Record<string, string>;
}

export interface IdTokenStorage {
  idToken: string;
  account: IdTokenBody;
}

export interface AuthState {
  config: ProviderConfig;
  refreshTokenStorage: RefreshTokenStorage | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authenticationError: string;
  checkedStorage: boolean;
  userInfo: GetUserInfoRes | null;
  idToken: string | null;
  account: IdTokenBody | null;
  isLoadingUserInfo: boolean;
  acquireUserInfoError: string;
  accessTokenStorage: AccessTokenStorage | null;
  isLoadingToken: boolean;
  acquireTokenError: string;
  loginError: string;
  logoutError: string;
}

export interface LoginProps {
  locale?: string;
  state?: string;
  policy?: string;
  org?: string;
}

export interface LoginPopupProps {
  locale?: string;
  state?: string;
  org?: string;
}
