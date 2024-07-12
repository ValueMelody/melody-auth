declare global {
  interface PostTokenByAuthCode {
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

  interface PostTokenByRefreshToken {
    access_token: string;
    expires_in: number;
    expires_on: number;
    token_type: 'Bearer';
  }

  interface GetUserInfo {
    oauthId: string;
    email: string | null;
    createdAt: string;
    updatedAt: string;
  }

  interface ProviderProps {
    baseUri: string;
    clientId: string;
    redirectUri: string;
    scopes?: string[];
    storage?: 'sessionStorage' | 'localStorage';
    postLogoutRedirectUri?: string;
  }
}

export {}
