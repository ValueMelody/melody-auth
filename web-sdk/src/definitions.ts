export enum SessionStorageKey {
  State = 'melody-auth-state',
  CodeVerifier = 'melody-auth-code-verifier',
}

export enum StorageKey {
  RefreshToken = 'melody-auth-refresh-token',
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
