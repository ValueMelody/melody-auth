import {
  StorageKey, isValidTokens, IdTokenStorage, AccessTokenStorage, RefreshTokenStorage,
} from '@melody-auth/shared'
import { exchangeTokenByRefreshToken } from '@melody-auth/web'
import { CookieStorage } from '../storage/cookieAdapter'

/**
 * Configuration options for server-side authentication
 */
export interface ServerAuthOptions {
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
  /** User ID from the JWT subject claim */
  userId: string;
  /** User email (if available in JWT claims) */
  email?: string;
  /** Full JWT payload with all claims */
  account: any;
  /** Access token for API calls */
  accessToken: string;
  /** ID token (JWT) */
  idToken: string;
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
    const accessTokenStr = storage.getItem('melody-auth-access-token')
    const refreshTokenStr = storage.getItem(StorageKey.RefreshToken)

    if (!idTokenStr) {
      return null
    }

    const idTokenStorage: IdTokenStorage = JSON.parse(idTokenStr)
    const accessTokenStorage: AccessTokenStorage | null = accessTokenStr ? JSON.parse(accessTokenStr) : null
    const refreshTokenStorage: RefreshTokenStorage | null = refreshTokenStr ? JSON.parse(refreshTokenStr) : null

    // Check token validity
    const {
      hasValidIdToken, hasValidAccessToken, hasValidRefreshToken,
    } = isValidTokens(
      accessTokenStorage,
      refreshTokenStorage,
      idTokenStorage,
    )

    // If access token is expired but refresh token is valid, try to refresh
    if (!hasValidAccessToken && hasValidRefreshToken && refreshTokenStorage) {
      try {
        const newTokens = await exchangeTokenByRefreshToken(
          {
            clientId: options.clientId,
            serverUri: options.serverUrl,
            redirectUri: options.redirectUri,
          },
          refreshTokenStorage.refreshToken,
        )

        // Update storage with new tokens
        const newAccessTokenStorage: AccessTokenStorage = {
          accessToken: newTokens.accessToken,
          expiresIn: newTokens.expiresIn,
          expiresOn: newTokens.expiresOn,
        }

        storage.setItem(
          'melody-auth-access-token',
          JSON.stringify(newAccessTokenStorage),
        )

        return {
          userId: idTokenStorage.account.sub,
          email: idTokenStorage.account.email ?? undefined,
          account: idTokenStorage.account,
          accessToken: newTokens.accessToken,
          idToken: idTokenStorage.idToken,
          isAuthenticated: true,
        }
      } catch (error) {
        console.error(
          'Failed to refresh token:',
          error,
        )
        return null
      }
    }

    if (!hasValidIdToken) {
      return null
    }

    return {
      userId: idTokenStorage.account.sub,
      email: idTokenStorage.account.email ?? undefined,
      account: idTokenStorage.account,
      accessToken: accessTokenStorage?.accessToken || '',
      idToken: idTokenStorage.idToken,
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
