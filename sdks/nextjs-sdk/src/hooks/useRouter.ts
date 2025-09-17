// Re-export router hooks for convenience
export { useAppRouter } from './useAppRouter'
export { usePagesRouter } from './usePagesRouter'

/**
 * Default router hook - uses App Router
 * For App Router (Next.js 13.4+) applications
 *
 * For Pages Router applications, use usePagesRouter instead
 */
export { useAppRouter as useRouter } from './useAppRouter'
