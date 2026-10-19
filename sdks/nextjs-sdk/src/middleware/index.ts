import {
  NextRequest, NextResponse,
} from 'next/server'
import { JWTPayload } from 'jose'
import {
  StorageKey, IdTokenStorage, AccessTokenStorage,
} from '@melody-auth/shared'
import { CookieStorage } from '../storage/cookieAdapter'
import {
  verifyToken, assertMatchingIdentity, TokenVerificationOptions,
} from './verifyTokens'

/**
 * Configuration options for the Melody Auth middleware
 */
export interface MelodyAuthMiddlewareConfig extends TokenVerificationOptions {
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
    /** User ID from the JWT subject claim */
    userId: string;
    /** Decoded JWT payload containing user account information */
    account: JWTPayload;
    /** Access token for API calls */
    accessToken: string;
  };
}

/**
 * Creates a Next.js middleware for Melody Auth authentication
 *
 * @param config - Middleware configuration options
 * @returns Middleware function that validates JWT tokens and protects routes
 *
 * @example
 * ```ts
 * // middleware.ts
 * export default createMelodyAuthMiddleware({
 *   publicKey: process.env.MELODY_PUBLIC_KEY,
 *   clientId: process.env.MELODY_CLIENT_ID,
 *   publicPaths: ['/login', '/api/public'],
 *   redirectPath: '/login'
 * });
 * ```
 */
export function createMelodyAuthMiddleware (config: MelodyAuthMiddlewareConfig) {
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

      const idTokenStorage: IdTokenStorage | null = idTokenStr ? JSON.parse(idTokenStr) : null
      const accessTokenStorage: AccessTokenStorage = JSON.parse(accessTokenStr)

      // Cookie metadata is untrusted. Authenticate using signed token claims only.
      const access = await verifyToken(
        accessTokenStorage.accessToken,
        config,
        'access',
      )
      const account = idTokenStr !== null
        ? await verifyToken(
          idTokenStorage?.idToken,
          config,
          'id',
        )
        : undefined
      assertMatchingIdentity(
        access,
        account,
      )
      const userId = account?.sub

      // Add auth info to request headers
      const response = NextResponse.next()

      // Only set user ID and account if we have ID token info
      if (userId && account) {
        response.headers.set(
          'x-auth-user-id',
          userId,
        )
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
 *   { publicKey: process.env.MELODY_PUBLIC_KEY, clientId: process.env.MELODY_CLIENT_ID }
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

    // Access token is required, user info is optional
    if (accessToken) {
      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.auth = {
        userId: userId || 'unknown',
        account: accountStr ? JSON.parse(accountStr) : {},
        accessToken,
      }

      return middleware(authenticatedRequest)
    }

    return authResponse
  }
}
