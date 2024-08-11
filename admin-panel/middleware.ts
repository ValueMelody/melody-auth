import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'fr'],
  defaultLocale: 'en',
})

export const config = { matcher: ['/', '/(fr|en)/:path*'] }
