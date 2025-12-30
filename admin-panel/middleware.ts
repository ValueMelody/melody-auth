import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'pt', 'fr'],
  defaultLocale: 'en',
  localeDetection: false,
})

export const config = { matcher: ['/', '/(en|pt|fr)/:path*'] }
