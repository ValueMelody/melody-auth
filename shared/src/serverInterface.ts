export interface PostTokenByAuthCode {
  access_token: string;
  expires_in: number;
  expires_on: number;
  not_before: number;
  token_type: 'Bearer';
  scope: string;
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

export interface PostTokenByClientCredentials {
  access_token: string;
  expires_in: number;
  expires_on: number;
  token_type: 'Bearer';
  scope: string;
}

export interface GetUserInfoRes {
  authId: string;
  email: string | null;
  firstName?: string | null;
  lastName?: string | null;
  roles?: string[];
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
