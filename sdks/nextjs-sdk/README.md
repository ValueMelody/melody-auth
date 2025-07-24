# @melody-auth/nextjs

Next.js SDK for Melody Auth - A complete authentication solution with server-side rendering support.

## Features

- Cookie-based token storage
- Server-side authentication support
- Next.js middleware integration
- Automatic token refresh
- SSR and CSR compatible

## Installation

```bash
npm install @melody-auth/nextjs
# or
yarn add @melody-auth/nextjs
# or
pnpm add @melody-auth/nextjs
```

## Quick Start

### 1. Setup Provider

```tsx
// app/providers.tsx
'use client';

import { NextAuthProvider } from '@melody-auth/nextjs';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthProvider
      clientId={process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!}
      serverUrl={process.env.NEXT_PUBLIC_AUTH_SERVER_URL!}
      redirectUri={process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI!}
      storage="cookie" // Use cookies for SSR support
    >
      {children}
    </NextAuthProvider>
  );
}
```

### 2. Middleware Setup

> [!warn] Need to use cookie storage for middleware.

```ts
// middleware.ts
import { createMelodyAuthMiddleware } from '@melody-auth/nextjs/middleware';

export const middleware = createMelodyAuthMiddleware({
  publicKey: process.env.AUTH_PUBLIC_KEY,
  publicPaths: ['/login', '/register', '/public'],
  redirectPath: '/login',
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 3. Client-Side Usage

```tsx
'use client';

import { useNextAuth } from '@melody-auth/nextjs';

export function Profile() {
  const { isAuthenticated, account, loginRedirect, logoutRedirect } = useNextAuth();

  if (!isAuthenticated) {
    return (
      <button onClick={() => loginRedirect()}>
        Login
      </button>
    );
  }

  return (
    <div>
      <p>Welcome, {account?.email}!</p>
      <button onClick={() => logoutRedirect()}>
        Logout
      </button>
    </div>
  );
}
```

### 4. Server-Side Usage

```tsx
// app/profile/page.tsx
import { getServerSession } from '@melody-auth/nextjs';

export default async function ProfilePage() {
  const session = await getServerSession({
    clientId: process.env.AUTH_CLIENT_ID!,
    serverUrl: process.env.AUTH_SERVER_URL!,
  });

  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <h1>Profile</h1>
      <p>User ID: {session.userId}</p>
      <p>Email: {session.email}</p>
    </div>
  );
}
```

## API Reference

### NextAuthProvider

```tsx
interface NextAuthProviderProps {
  clientId: string;
  serverUrl: string;
  redirectUri: string;
  storage?: 'cookie' | 'localStorage' | 'sessionStorage';
  cookieOptions?: {
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
    path?: string;
    domain?: string;
    maxAge?: number;
  };
}
```

### useNextAuth Hook

```tsx
const {
  // Auth state
  isAuthenticated,
  isAuthenticating,
  account,
  userInfo,
  
  // Methods
  loginRedirect,
  loginPopup,
  logoutRedirect,
  acquireToken,
  acquireUserInfo,
  refreshSession,
  
  // Errors
  authenticationError,
  loginError,
  logoutError,
} = useNextAuth();
```

### Middleware Functions

```tsx
// Create middleware
const middleware = createMelodyAuthMiddleware(config);

// Wrap existing middleware
export const middleware = withAuth(
  async (request) => {
    // Your middleware logic
    // Access auth via request.auth
  },
  authConfig
);
```

### Server Functions

```tsx
// Get session in server components
const session = await getServerSession(options);

// Require auth (throws if not authenticated)
const session = await requireAuth(options, '/login');
```

## Cookie Storage

The SDK automatically handles large tokens by splitting them across multiple cookies:

- Tokens are chunked into 3KB pieces
- Chunks are automatically reassembled on read
- Old chunks are cleaned up on update


## License

MIT
