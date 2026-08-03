# @melody-auth/nextjs

Next.js SDK for Melody Auth with full SSR support, middleware protection, and cookie-based storage.

## Features

- **Cookie-based storage** - Works with SSR/SSG out of the box
- **Edge middleware** - JWT verification and route protection
- **Server components** - `getServerSession()` for RSC
- **React hooks** - `useNextAuth()` for client components
- **TypeScript** - Full type safety included

Every server-side entry point (`createMelodyAuthMiddleware`, `withAuth`, `getServerSession`,
`requireAuth`) verifies the access token JWT against your auth server signing keys, and checks
its algorithm, issuer, client binding and expiry. `serverUrl` and `clientId` are therefore
required, and signing keys are fetched from `${serverUrl}/.well-known/jwks.json` by default.

## Installation

```bash
npm install @melody-auth/nextjs
```

## Quick Start

```tsx
// 1. Wrap your app
import { NextAuthProvider } from '@melody-auth/nextjs';

<NextAuthProvider
  clientId="your-client-id"
  serverUrl="https://your-auth-server.com"
  redirectUri="http://localhost:3000/callback"
>
  {children}
</NextAuthProvider>

// 2. Add middleware protection
// middleware.ts
import { createMelodyAuthMiddleware } from '@melody-auth/nextjs';

export default createMelodyAuthMiddleware({
  serverUrl: 'https://your-auth-server.com',
  clientId: 'your-client-id',
  publicPaths: ['/login']
});

// 3. Use in components
import { useNextAuth } from '@melody-auth/nextjs';

const { isAuthenticated, loginRedirect } = useNextAuth();
```

## Documentation

📖 **[Complete documentation and examples →](../../docs/nextjs-sdk.md)**

## Key APIs

- `<NextAuthProvider>` - Wrap your app for auth context
- `useNextAuth()` - React hook for client components
- `getServerSession()` - Get session in server components
- `createMelodyAuthMiddleware()` - Protect routes with middleware
- `requireAuth()` - Protect API routes


## License

MIT
