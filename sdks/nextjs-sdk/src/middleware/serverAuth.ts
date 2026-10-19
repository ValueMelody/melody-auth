import {
  errors, JWTPayload,
} from 'jose'
import {
  StorageKey, IdTokenStorage, AccessTokenStorage, RefreshTokenStorage,
} from '@melody-auth/shared'
import { exchangeTokenByRefreshToken } from '@melody-auth/web'
import { CookieStorage } from '../storage/cookieAdapter'
import {
  verifyToken, assertMatchingIdentity, TokenVerificationOptions,
} from './verifyTokens'

/**
 * Configuration options for server-side authentication
 */
export interface ServerAuthOptions extends Pick<TokenVerificationOptions, 'publicKey' | 'jwksUri'> {
  /** OAuth client ID */
  clientId: string;
  /** Melody Auth server URL */
  serverUrl: string;
  /** OAuth redirect URI (used for token refresh) */
  redirectUri: string;
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
  /** User ID from the JWT subject claim (if ID token available) */
  userId?: string;
  /** User email (if available in JWT claims) */
  email?: string;
  /** Full JWT payload with all claims (if ID token available) */
  account?: any;
  /** Access token for API calls */
  accessToken: string;
  /** ID token (JWT) - only present if openid scope was requested */
  idToken?: string;
  /** Always true for authenticated sessions */
  isAuthenticated: boolean;
}

/**
 * Retrieves the current user session from cookies
 * Automatically refreshes expired access tokens if a valid refresh token exists
 *
 * @param options - Server authentication options
 * @returns AuthSession if authenticated, null otherwise
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

    const idTokenStorage: IdTokenStorage | null = idTokenStr ? JSON.parse(idTokenStr) : null
    const accessTokenStorage: AccessTokenStorage = JSON.parse(accessTokenStr)
    const refreshTokenStorage: RefreshTokenStorage | null = refreshTokenStr ? JSON.parse(refreshTokenStr) : null

    const verificationOptions: TokenVerificationOptions = {
      publicKey: options.publicKey,
      jwksUri: options.jwksUri ?? `${options.serverUrl.replace(
        /\/$/,
        '',
      )}/.well-known/jwks.json`,
      issuer: options.serverUrl,
      clientId: options.clientId,
    }

    // Verify identity before any refresh, and never use the cookie's account field.
    const account = idTokenStr !== null
      ? await verifyToken(
        idTokenStorage?.idToken,
        verificationOptions,
        'id',
      )
      : undefined
    let accessToken = accessTokenStorage.accessToken
    let refreshedTokens: AccessTokenStorage | undefined
    let access: JWTPayload
    try {
      access = await verifyToken(
        accessToken,
        verificationOptions,
        'access',
      )
    } catch (error) {
      // Only signed expiration can trigger refresh; cookie expiresOn is not proof.
      if (!(error instanceof errors.JWTExpired) || error.claim !== 'exp' || !refreshTokenStorage?.refreshToken) {
        throw error
      }
      refreshedTokens = await exchangeTokenByRefreshToken(
        {
          clientId: options.clientId,
          serverUri: options.serverUrl,
          redirectUri: options.redirectUri,
        },
        refreshTokenStorage.refreshToken,
      )
      accessToken = refreshedTokens.accessToken
      access = await verifyToken(
        accessToken,
        verificationOptions,
        'access',
      )
    }
    assertMatchingIdentity(
      access,
      account,
    )

    if (refreshedTokens) {
      storage.setItem(
        StorageKey.AccessToken,
        JSON.stringify(refreshedTokens),
      )
    }

    return {
      userId: account?.sub,
      email: typeof account?.email === 'string' ? account.email : undefined,
      account,
      accessToken,
      idToken: idTokenStorage?.idToken,
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
