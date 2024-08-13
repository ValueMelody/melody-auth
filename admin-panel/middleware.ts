import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
  localeDetection: false,
})

export const config = { matcher: ['/', '/(en|fr)/:path*'] }
