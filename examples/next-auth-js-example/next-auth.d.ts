import {
  DefaultSession, TokenSet,
} from 'next-auth'
import { DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    accessToken?: string;
    refreshToken?: string;
    refreshTokenExpiresOn?: number;
  }

  interface Account extends Partial<TokenSet> {
    refresh_token_expires_on?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    refreshToken?: string;
    refreshTokenExpiresOn?: number;
  }
}
