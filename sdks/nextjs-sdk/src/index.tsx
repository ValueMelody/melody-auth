// Provider
export { NextAuthProvider } from './Provider';
export type { NextAuthProviderProps } from './Provider';

// Hooks
export { useNextAuth } from './hooks/useNextAuth';
export { getNextAuth, getCachedServerSession } from './hooks/getNextAuth';

// Middleware
export { createMelodyAuthMiddleware, withAuth } from './middleware';
export type { MelodyAuthMiddlewareConfig, AuthenticatedRequest } from './middleware';

// Server Auth
export { getServerSession, requireAuth } from './middleware/serverAuth';
export type { ServerAuthOptions, AuthSession } from './middleware/serverAuth';

// Storage utilities
export { CookieStorage, UniversalStorage } from './storage';
export type { CookieOptions, StorageType } from './storage';
