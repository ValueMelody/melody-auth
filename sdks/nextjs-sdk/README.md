# @melody-auth/nextjs

Next.js SDK for Melody Auth with full SSR support, middleware protection, and cookie-based storage.

## Features

- **Cookie-based storage** - Works with SSR/SSG out of the box
- **Edge middleware** - JWT verification and route protection
- **Server components** - `getServerSession()` for RSC
- **React hooks** - `useNextAuth()` for client components
- **TypeScript** - Full type safety included

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
  jwksUri: 'https://your-auth-server.com/.well-known/jwks.json',
  issuer: 'https://your-auth-server.com',
  clientId: 'your-client-id',
  publicPaths: ['/login']
});

// 3. Use in components
import { useNextAuth } from '@melody-auth/nextjs';

const { isAuthenticated, loginRedirect } = useNextAuth();
```

Protected routes require verified, unexpired RS256 access tokens. Configure `clientId` and either `publicKey` or `jwksUri` for middleware; missing verification configuration rejects authentication. Server session helpers default to the JWKS endpoint at `serverUrl` and also validate issuer and client claims. ID tokens, when present, must verify and match the access-token identity; an expired ID token still supplies identity for a valid access token, since refreshes do not issue a new ID token. Cookie `account` and `expiresOn` fields are never trusted for authentication, including after token refresh.

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
