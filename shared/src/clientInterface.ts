export interface ProviderConfig {
  serverUri: string;
  clientId: string;
  redirectUri: string;
  scopes?: string[];
  storage?: 'sessionStorage' | 'localStorage';
  onLoginSuccess?: (attributes: { state?: string; locale?: string }) => void;
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
}
