export interface ProviderConfig {
  serverUri: string;
  clientId: string;
  redirectUri: string;
  scopes?: string[];
  storage?: 'sessionStorage' | 'localStorage';
}

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
