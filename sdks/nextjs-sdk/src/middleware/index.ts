import {
  NextRequest, NextResponse,
} from 'next/server'
import { JWTPayload } from 'jose'
import {
  StorageKey, IdTokenStorage, AccessTokenStorage,
} from '@melody-auth/shared'
import { CookieStorage } from '../storage/cookieAdapter'
import {
  ResolvedTokenVerifierConfig, TokenVerifierConfig, isExpiredTokenError, resolveTokenVerifierConfig,
  verifyAccessToken, verifyIdToken,
} from './tokenVerifier'

/**
 * Configuration options for the Melody Auth middleware
 */
export interface MelodyAuthMiddlewareConfig extends TokenVerifierConfig {
  /** Array of path prefixes that don't require authentication */
  publicPaths?: string[];
  /** Path to redirect unauthenticated users (default: '/login') */
  redirectPath?: string;
  /** Cookie configuration options */
  cookieOptions?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
    path?: string;
    domain?: string;
  };
}

/**
 * Extended Next.js request with authentication information
 */
export interface AuthenticatedRequest extends NextRequest {
  /** Authentication information attached to the request */
  auth?: {
    /** User ID from the verified access token subject claim */
    userId: string;
    /** Verified ID token payload containing user account information, empty when no ID token is present */
    account: JWTPayload;
    /** Access token for API calls */
    accessToken: string;
  };
}

/**
 * Reads the ID token from storage and returns its verified payload.
 *
 * Returns null when no ID token is stored or when the stored one has expired: the session
 * still stands on the verified access token, it simply carries no identity claims. Any other
 * verification failure is rethrown so the session is rejected.
 */
async function getVerifiedAccount (
  idTokenStr: string | null, config: ResolvedTokenVerifierConfig, userId: string,
): Promise<JWTPayload | null> {
  if (!idTokenStr) return null

  const idTokenStorage: IdTokenStorage = JSON.parse(idTokenStr)
  if (!idTokenStorage?.idToken) return null

  try {
    return await verifyIdToken(
      idTokenStorage.idToken,
      config,
      userId,
    )
  } catch (error) {
    if (isExpiredTokenError(error)) return null
    throw error
  }
}

/**
 * Creates a Next.js middleware for Melody Auth authentication
 *
 * Every request is authenticated against the access token JWT, which is verified with the
 * auth server signing keys. Token metadata kept in cookies is never trusted.
 *
 * @param config - Middleware configuration options
 * @returns Middleware function that validates JWT tokens and protects routes
 * @throws Error at creation time when the verification configuration is missing or malformed
 *
 * @example
 * ```ts
 * // middleware.ts
 * export default createMelodyAuthMiddleware({
 *   serverUrl: process.env.AUTH_SERVER_URL!,
 *   clientId: process.env.AUTH_CLIENT_ID!,
 *   publicPaths: ['/login', '/api/public'],
 *   redirectPath: '/login'
 * });
 * ```
 */
export function createMelodyAuthMiddleware (config: MelodyAuthMiddlewareConfig) {
  // Resolved eagerly so a misconfigured deployment fails at startup rather than
  // falling back to unverified tokens at request time.
  const verifierConfig = resolveTokenVerifierConfig(config)

  return async function middleware (request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Check if path is public
    if (config.publicPaths?.some((path) => pathname.startsWith(path))) {
      return NextResponse.next()
    }

    const storage = new CookieStorage({
      request,
      ...config.cookieOptions,
    })

    try {
      // Get tokens from cookies
      const idTokenStr = storage.getItem(StorageKey.IdToken)
      const accessTokenStr = storage.getItem(StorageKey.AccessToken)

      // Access token is required, ID token is optional (depends on openid scope)
      if (!accessTokenStr) {
        return redirectToLogin(
          request,
          config.redirectPath,
        )
      }

      const accessTokenStorage: AccessTokenStorage = JSON.parse(accessTokenStr)

      // The access token is the only thing that grants access, so it is always verified
      const accessTokenBody = await verifyAccessToken(
        accessTokenStorage?.accessToken,
        verifierConfig,
      )
      const userId = accessTokenBody.sub as string

      // Identity claims come from the verified ID token, never from the cookie payload
      const account = await getVerifiedAccount(
        idTokenStr,
        verifierConfig,
        userId,
      )

      // Add auth info to request headers
      const response = NextResponse.next()

      response.headers.set(
        'x-auth-user-id',
        userId,
      )

      // Only set the account if an ID token was present and verified
      if (account) {
        response.headers.set(
          'x-auth-account',
          JSON.stringify(account),
        )
      }

      response.headers.set(
        'x-auth-access-token',
        accessTokenStorage.accessToken,
      )

      return response
    } catch (error) {
      // Edge Runtime compatible error handling
      if (typeof console !== 'undefined' && console.error) {
        console.error(
          'Auth middleware error:',
          error,
        )
      }
      return redirectToLogin(
        request,
        config.redirectPath,
      )
    }
  }
}

/**
 * Creates a redirect response to the login page
 * Preserves the original URL as a return URL parameter
 */
function redirectToLogin (
  request: NextRequest, redirectPath = '/login',
) {
  const url = request.nextUrl.clone()
  url.pathname = redirectPath
  url.searchParams.set(
    'returnUrl',
    request.nextUrl.pathname,
  )
  return NextResponse.redirect(url)
}

/**
 * Higher-order function that wraps a middleware with authentication
 * Provides authenticated request object to the wrapped middleware
 *
 * @param middleware - The middleware function to wrap
 * @param config - Authentication configuration
 * @returns Wrapped middleware that includes authentication
 *
 * @example
 * ```ts
 * export default withAuth(
 *   async (request) => {
 *     // Access authenticated user info
 *     console.log('User ID:', request.auth?.userId);
 *     return NextResponse.next();
 *   },
 *   {
 *     serverUrl: process.env.AUTH_SERVER_URL!,
 *     clientId: process.env.AUTH_CLIENT_ID!,
 *   }
 * );
 * ```
 */
export function withAuth (
  middleware: (request: AuthenticatedRequest) => NextResponse | Promise<NextResponse>,
  config: MelodyAuthMiddlewareConfig,
) {
  const authMiddleware = createMelodyAuthMiddleware(config)

  return async function wrappedMiddleware (request: NextRequest) {
    const authResponse = await authMiddleware(request)

    if (authResponse.status === 307) {
      // Redirect response
      return authResponse
    }

    // Extract auth info from headers
    const userId = authResponse.headers.get('x-auth-user-id')
    const accountStr = authResponse.headers.get('x-auth-account')
    const accessToken = authResponse.headers.get('x-auth-access-token')

    // Both are set together once the access token has been verified
    if (accessToken && userId) {
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.auth = {
        userId,
        account: accountStr ? JSON.parse(accountStr) : {},
        accessToken,
      }

      return middleware(authenticatedRequest)
    }

    return authResponse
  }
}

export {
  resolveTokenVerifierConfig, verifyAccessToken, verifyIdToken,
} from './tokenVerifier'
export type {
  TokenVerifierConfig, ResolvedTokenVerifierConfig,
} from './tokenVerifier'
