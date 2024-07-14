export interface PostTokenByAuthCode {
  access_token: string;
  expires_in: number;
  expires_on: number;
  not_before: number;
  token_type: 'Bearer';
  scope: string[];
  refresh_token?: string;
  refresh_token_expires_in?: number;
  refresh_token_expires_on?: number;
  id_token?: string;
}

export interface PostTokenByRefreshToken {
  access_token: string;
  expires_in: number;
  expires_on: number;
  token_type: 'Bearer';
}

export interface GetUserInfo {
  oauthId: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderConfig {
  baseUri: string;
  clientId: string;
  redirectUri: string;
  scopes?: string[];
  storage?: 'sessionStorage' | 'localStorage';
}
