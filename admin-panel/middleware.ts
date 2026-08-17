// Next.js 16 deprecates the `middleware` file convention in favour of `proxy`,
// but a `proxy` file always runs on the Node.js runtime, which
// @opennextjs/cloudflare cannot bundle. Keep this as `middleware.ts` so it
// still compiles to edge and `cf:build` keeps working.
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = { matcher: ['/', '/(en|fr)/:path*'] }
