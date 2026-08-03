// Provider
export { NextAuthProvider } from './Provider'
export type { NextAuthProviderProps } from './Provider'

// Hooks
export { useNextAuth } from './hooks/useNextAuth'
export {
  getNextAuth, getCachedServerSession,
} from './hooks/getNextAuth'

// Middleware
export {
  createMelodyAuthMiddleware, withAuth,
} from './middleware'
export type {
  MelodyAuthMiddlewareConfig, AuthenticatedRequest,
} from './middleware'

// Token verification
export {
  resolveTokenVerifierConfig, verifyAccessToken, verifyIdToken,
} from './middleware/tokenVerifier'
export type {
  TokenVerifierConfig, ResolvedTokenVerifierConfig,
} from './middleware/tokenVerifier'

// Server Auth
export {
  getServerSession, requireAuth,
} from './middleware/serverAuth'
export type {
  ServerAuthOptions, AuthSession,
} from './middleware/serverAuth'

// Storage utilities
export { CookieStorage } from './storage'
export type { CookieOptions } from './storage'
