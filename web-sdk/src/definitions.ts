export enum SessionStorageKey {
  State = 'melody-oauth-state',
  CodeVerifier = 'melody-oauth-code-verifier',
}

export enum StorageKey {
  RefreshToken = 'melody-oauth-refresh-token',
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
