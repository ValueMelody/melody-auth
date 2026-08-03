import {
  StorageKey, isValidTokens, IdTokenStorage, AccessTokenStorage, RefreshTokenStorage,
} from '@melody-auth/shared'
import { exchangeTokenByRefreshToken } from '@melody-auth/web'
import { JWTPayload } from 'jose'
import { CookieStorage } from '../storage/cookieAdapter'
import {
  ResolvedTokenVerifierConfig, isExpiredTokenError, resolveTokenVerifierConfig,
  verifyAccessToken, verifyIdToken,
} from './tokenVerifier'

/**
 * Configuration options for server-side authentication
 */
export interface ServerAuthOptions {
  /** OAuth client ID. Tokens issued to any other client are rejected. */
  clientId: string;
  /** Melody Auth server URL. Used as the expected token issuer and to derive the JWKS URI. */
  serverUrl: string;
  /** OAuth redirect URI (used for token refresh) */
  redirectUri: string;
  /** Overrides the JWKS URI derived from `serverUrl` (`${serverUrl}/.well-known/jwks.json`) */
  jwksUri?: string;
  /** PEM-encoded RSA public key, used instead of a JWKS URI for offline verification */
  publicKey?: string;
  /** Clock skew tolerance in seconds when validating `exp`/`nbf` (default: 5) */
  clockTolerance?: number;
  /** Cookie configuration for storing tokens */
  cookieOptions?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
    path?: string;
    domain?: string;
  };
}

/**
 * Authenticated user session information
 */
export interface AuthSession {
  /** User ID, taken from the verified access token subject claim */
  userId: string;
  /** User email (if available in the verified ID token claims) */
  email?: string;
  /** Verified ID token payload with all claims (only present if an ID token is available) */
  account?: any;
  /** Access token for API calls */
  accessToken: string;
  /** ID token (JWT) - only present if openid scope was requested and the token is still valid */
  idToken?: string;
  /** Always true for authenticated sessions */
  isAuthenticated: boolean;
}

/**
 * Reads the ID token from storage and returns its verified payload alongside the raw token.
 *
 * Returns null when no ID token is stored or when the stored one has expired: the session still
 * stands on the verified access token, it simply carries no identity claims. Any other
 * verification failure is rethrown so the session is rejected.
 */
async function getVerifiedIdToken (
  idTokenStr: string | null, config: ResolvedTokenVerifierConfig, userId: string,
): Promise<{ idToken: string; account: JWTPayload } | null> {
  if (!idTokenStr) return null

  const idTokenStorage: IdTokenStorage = JSON.parse(idTokenStr)
  if (!idTokenStorage?.idToken) return null

  try {
    const account = await verifyIdToken(
      idTokenStorage.idToken,
      config,
      userId,
    )
    return {
      idToken: idTokenStorage.idToken, account,
    }
  } catch (error) {
    if (isExpiredTokenError(error)) return null
    throw error
  }
}

/**
 * Retrieves the current user session from cookies
 * Automatically refreshes expired access tokens if a valid refresh token exists
 *
 * The session is established from the access token JWT, which is verified against the auth
 * server signing keys on every call. Token metadata stored in cookies is client controlled
 * and is never used to decide whether a session is authenticated.
 *
 * @param options - Server authentication options
 * @returns AuthSession if authenticated, null otherwise
 * @throws Error when the verification configuration is missing or malformed
 *
 * @example
 * ```ts
 * // In a Server Component or Route Handler
 * const session = await getServerSession({
 *   clientId: process.env.MELODY_CLIENT_ID!,
 *   serverUrl: process.env.MELODY_SERVER_URL!,
 *   redirectUri: process.env.MELODY_REDIRECT_URI!
 * });
 *
 * if (!session) {
 *   redirect('/login');
 * }
 * ```
 */
export async function getServerSession (options: ServerAuthOptions): Promise<AuthSession | null> {
  // Resolved outside of the try block: a misconfigured app has to fail loudly instead of
  // reporting every visitor as signed out.
  const verifierConfig = resolveTokenVerifierConfig(options)

  const storage = new CookieStorage({ ...options.cookieOptions })

  try {
    // Get tokens from cookies
    const idTokenStr = storage.getItem(StorageKey.IdToken)
    const accessTokenStr = storage.getItem(StorageKey.AccessToken)
    const refreshTokenStr = storage.getItem(StorageKey.RefreshToken)

    // Access token is required for authentication
    if (!accessTokenStr) {
      return null
    }

    const accessTokenStorage: AccessTokenStorage = JSON.parse(accessTokenStr)
    const refreshTokenStorage: RefreshTokenStorage | null = refreshTokenStr ? JSON.parse(refreshTokenStr) : null

    let accessToken = accessTokenStorage?.accessToken
    let accessTokenBody: JWTPayload | null = null

    try {
      accessTokenBody = await verifyAccessToken(
        accessToken,
        verifierConfig,
      )
    } catch (error) {
      // Only an expired token may be refreshed. Anything else means the token was tampered
      // with or was issued elsewhere, so the session is dropped.
      if (!isExpiredTokenError(error)) {
        console.error(
          'Access token verification failed:',
          error,
        )
        return null
      }
    }

    // If the access token is expired but a refresh token is available, try to refresh.
    // The stored refresh token expiry is only a hint that saves a round trip, the auth
    // server remains the authority on whether the refresh token is still usable.
    if (!accessTokenBody) {
      const { hasValidRefreshToken } = isValidTokens(
        null,
        refreshTokenStorage,
        null,
      )

      if (!hasValidRefreshToken || !refreshTokenStorage) {
        return null
      }

      try {
        const newTokens = await exchangeTokenByRefreshToken(
          {
            clientId: options.clientId,
            serverUri: options.serverUrl,
            redirectUri: options.redirectUri,
          },
          refreshTokenStorage.refreshToken,
        )

        // The freshly issued token is verified as well, it is what the session will rely on
        accessTokenBody = await verifyAccessToken(
          newTokens.accessToken,
          verifierConfig,
        )
        accessToken = newTokens.accessToken

        // Update storage with new tokens
        const newAccessTokenStorage: AccessTokenStorage = {
          accessToken: newTokens.accessToken,
          expiresIn: newTokens.expiresIn,
          expiresOn: newTokens.expiresOn,
        }

        storage.setItem(
          StorageKey.AccessToken,
          JSON.stringify(newAccessTokenStorage),
        )
      } catch (error) {
        console.error(
          'Failed to refresh token:',
          error,
        )
        return null
      }
    }

    const userId = accessTokenBody.sub as string

    // Identity claims come from the verified ID token, never from the cookie payload
    const verifiedIdToken = await getVerifiedIdToken(
      idTokenStr,
      verifierConfig,
      userId,
    )
    const account = verifiedIdToken?.account
    const emailClaim = account?.email
    const email = typeof emailClaim === 'string' ? emailClaim : undefined

    return {
      userId,
      email,
      account,
      accessToken,
      idToken: verifiedIdToken?.idToken,
      isAuthenticated: true,
    }
  } catch (error) {
    console.error(
      'Error getting server session:',
      error,
    )
    return null
  }
}

/**
 * Ensures the user is authenticated, throws an error if not
 * Useful for protecting API routes or server actions
 *
 * @param options - Server authentication options
 * @param redirectTo - Path to suggest for redirection (default: '/login')
 * @returns AuthSession (never null)
 * @throws Error if user is not authenticated
 *
 * @example
 * ```ts
 * // In an API route
 * export async function POST(request: Request) {
 *   const session = await requireAuth(authOptions);
 *   // User is guaranteed to be authenticated here
 *   return Response.json({ userId: session.userId });
 * }
 * ```
 */
export async function requireAuth (
  options: ServerAuthOptions,
  redirectTo = '/login',
): Promise<AuthSession> {
  const session = await getServerSession(options)

  if (!session) {
    throw new Error(`Unauthorized: Please login at ${redirectTo}`)
  }

  return session
}
