# Next.js SDK

The Next.js SDK allows you to easily integrate Melody Auth into your Next.js applications with server-side rendering support, middleware protection, and cookie-based storage.

## Installation

```bash
npm install @melody-auth/nextjs --save
```

## NextAuthProvider

Wrap your application inside NextAuthProvider component to provide the auth related context to your application components.

| Parameter | Type | Description | Default | Required |
|-----------|------|-------------|---------|----------|
| clientId | string | The auth clientId your frontend connects to | N/A | Yes |
| redirectUri | string | The URL to redirect users after successful authentication | N/A | Yes |
| serverUrl | string | The URL where you host the melody auth server | N/A | Yes |
| storage | 'cookieStorage' \| 'localStorage' \| 'sessionStorage' | Storage type for authentication tokens | 'cookieStorage' | No |
| cookieOptions | CookieOptions | Cookie configuration options | {} | No |
| scopes | string[] | Permission scopes to request for user access | ['openid', 'profile', 'email'] | No |

```tsx
import { NextAuthProvider } from '@melody-auth/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <NextAuthProvider
        clientId={process.env.NEXT_PUBLIC_AUTH_CLIENT_ID ?? ''}
        redirectUri={process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI ?? ''}
        serverUrl={process.env.NEXT_PUBLIC_AUTH_SERVER_URL ?? ''}
        storage="cookieStorage"
      >
        <body>
          {children}
        </body>
      </NextAuthProvider>
    </html>
  );
}
```

## createMelodyAuthMiddleware

Creates a Next.js middleware function that protects routes with JWT verification.

| Parameter | Type | Description | Default | Required |
|-----------|------|-------------|---------|----------|
| publicKey | string | PEM-encoded RSA public key for JWT verification | N/A | No* |
| jwksUri | string | URI to fetch JWKS for JWT verification | N/A | No* |
| publicPaths | string[] | Array of path prefixes that don't require authentication | [] | No |
| redirectPath | string | Path to redirect unauthenticated users | '/login' | No |
| cookieOptions | CookieOptions | Cookie configuration options | {} | No |

*Either `publicKey` or `jwksUri` is required.

```ts
import { createMelodyAuthMiddleware } from '@melody-auth/nextjs';

export default createMelodyAuthMiddleware({
  jwksUri: process.env.AUTH_JWKS_URI,
  publicPaths: ['/login', '/register', '/api/public'],
  redirectPath: '/login',
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
```

## useNextAuth

A React hook that provides authentication state and methods for client components.

Returns an object containing:
- `isAuthenticated`: boolean - Whether user is authenticated
- `isAuthenticating`: boolean - Loading state during auth
- `authenticationError`: string - Authentication error message
- `userInfo`: object - User profile information
- `account`: object - JWT account claims
- `accessToken`: string | null - Current access token
- `idToken`: string | null - Current ID token
- `isLoadingUserInfo`: boolean - Loading state for user info
- `acquireUserInfoError`: string - User info fetch error
- `isLoadingToken`: boolean - Loading state for tokens
- `acquireTokenError`: string - Token acquisition error
- `loginError`: string - Login error message
- `logoutError`: string - Logout error message
- `loginRedirect()`: function - Redirect to login
- `logoutRedirect()`: function - Logout and redirect
- `refreshSession()`: function - Force token refresh

```tsx
import { useNextAuth } from '@melody-auth/nextjs';

export default function Profile() {
  const { isAuthenticated, account, loginRedirect, logoutRedirect } = useNextAuth();

  if (!isAuthenticated) {
    return <button onClick={() => loginRedirect()}>Login</button>;
  }

  return (
    <div>
      <p>Welcome, {account?.email}!</p>
      <button onClick={() => logoutRedirect()}>Logout</button>
    </div>
  );
}
```

## getServerSession

Retrieves the current user session from cookies in server components. Returns null if not authenticated.

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| options | ServerAuthOptions | Configuration object | Yes |

```tsx
import { getServerSession } from '@melody-auth/nextjs';

export default async function ProfilePage() {
  const session = await getServerSession({
    clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!,
    serverUrl: process.env.NEXT_PUBLIC_AUTH_SERVER_URL!,
    redirectUri: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI!,
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

## requireAuth

Ensures the user is authenticated, throws an error if not. Useful for protecting API routes.

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| options | ServerAuthOptions | Configuration object | Yes |
| redirectTo | string | Path to suggest for redirection | No |

```typescript
import { requireAuth } from '@melody-auth/nextjs';

export async function GET() {
  const session = await requireAuth({
    clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!,
    serverUrl: process.env.NEXT_PUBLIC_AUTH_SERVER_URL!,
    redirectUri: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI!,
  });

  return Response.json({
    message: `Hello ${session.email}`,
    userId: session.userId
  });
}
```

## Advanced Usage

### Custom Cookie Options

```tsx
<NextAuthProvider
  clientId={process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!}
  serverUrl={process.env.NEXT_PUBLIC_AUTH_SERVER_URL!}
  redirectUri={process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI!}
  storage="cookie"
  cookieOptions={{
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 86400 // 24 hours
  }}
>
  {children}
</NextAuthProvider>
```

### Using localStorage/sessionStorage

```tsx
// Use localStorage instead of cookies
<NextAuthProvider
  clientId="..."
  serverUrl="..."
  redirectUri="..."
  storage="localStorage" // or "sessionStorage"
>
  {children}
</NextAuthProvider>
```

### Advanced Middleware Configuration

```ts
// middleware.ts
import { createMelodyAuthMiddleware } from '@melody-auth/nextjs';

export default createMelodyAuthMiddleware({
  jwksUri: process.env.AUTH_JWKS_URI,
  publicPaths: [
    '/login',
    '/register',
    '/api/public',
    '/api/webhooks' // Public API routes
  ],
  redirectPath: '/auth/login',
  cookieOptions: {
    secure: true,
    sameSite: 'strict'
  }
});
```

### Custom Middleware with Auth Context

```ts
import { withAuth } from '@melody-auth/nextjs';
import { NextResponse } from 'next/server';

export default withAuth(
  async (request) => {
    // Access authenticated user info
    const { userId, email } = request.auth;

    // Custom logic based on user
    if (request.nextUrl.pathname.startsWith('/admin') && !email?.endsWith('@company.com')) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    return NextResponse.next();
  },
  {
    jwksUri: process.env.AUTH_JWKS_URI,
    publicPaths: ['/login']
  }
);
```

### Cached Server Sessions

```tsx
import { getCachedServerSession } from '@melody-auth/nextjs';

// Caches session for the request lifecycle
export default async function Layout({ children }) {
  const session = await getCachedServerSession({
    clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!,
    serverUrl: process.env.NEXT_PUBLIC_AUTH_SERVER_URL!,
    redirectUri: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI!,
  });

  return (
    <div>
      {session && <UserMenu user={session} />}
      {children}
    </div>
  );
}
```

## API Reference

### NextAuthProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| serverUrl | string | required | Your Melody Auth server URL |
| clientId | string | required | OAuth client ID |
| redirectUri | string | required | OAuth redirect URI |
| storage | 'cookie' \| 'localStorage' \| 'sessionStorage' | 'cookie' | Storage mechanism |
| cookieOptions | CookieOptions | {} | Cookie configuration |
| scope | string | 'openid profile email' | OAuth scopes |

### CookieOptions

```typescript
interface CookieOptions {
  httpOnly?: boolean;     // Default: true
  secure?: boolean;       // Default: NODE_ENV === 'production'
  sameSite?: 'lax' | 'strict' | 'none'; // Default: 'lax'
  path?: string;          // Default: '/'
  domain?: string;
  maxAge?: number;        // In seconds
}
```

### useNextAuth Hook

Returns an object with:

```typescript
interface NextAuthHook {
  // Auth state
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  userInfo: any;
  account: any;
  idToken: string | null;
  accessToken: string | null;

  // Loading states
  isLoadingUserInfo: boolean;
  isLoadingToken: boolean;

  // Error states
  authenticationError: string;
  acquireUserInfoError: string;
  acquireTokenError: string;
  loginError: string;
  logoutError: string;

  // Methods
  loginRedirect: (request?: LoginRedirectRequest) => Promise<void>;
  logoutRedirect: (request?: { returnTo?: string }) => Promise<void>;
  refreshSession: () => Promise<void>;
}
```

### Middleware Config

| Option | Type | Description |
|--------|------|-------------|
| publicKey | string | PEM-encoded RSA public key |
| jwksUri | string | JWKS endpoint URL (recommended) |
| publicPaths | string[] | Paths that don't require auth |
| redirectPath | string | Where to redirect unauthenticated users |
| cookieOptions | CookieOptions | Cookie configuration |

### Server Functions

```typescript
// Get session in server components
getServerSession(options: ServerAuthOptions): Promise<AuthSession | null>

// Require auth (throws if not authenticated)
requireAuth(options: ServerAuthOptions, redirectTo?: string): Promise<AuthSession>

// Get cached session (cached for request lifecycle)
getCachedServerSession(options: ServerAuthOptions): Promise<AuthSession | null>
```

#### ServerAuthOptions

```typescript
interface ServerAuthOptions {
  clientId: string;
  serverUrl: string;
  redirectUri: string;
  cookieOptions?: CookieOptions;
}
```

#### AuthSession

```typescript
interface AuthSession {
  userId: string;
  email?: string;
  account: any;          // Full JWT payload
  accessToken: string;
  idToken: string;
  isAuthenticated: boolean; // Always true for valid sessions
}
```

## Cookie Storage

The SDK uses cookies by default for server-side compatibility. Key features:

- **Secure by default** - httpOnly, secure, sameSite protection
- **Large token handling** - Automatically chunks tokens if needed
- **Server/client sync** - Works seamlessly across SSR and CSR
- **Automatic cleanup** - Old tokens are cleaned up on updates

### How Cookie Storage Works

1. **Token Storage**: JWT tokens are stored in secure, httpOnly cookies
2. **Chunking**: Large tokens are automatically split across multiple cookies
3. **Reassembly**: Chunks are automatically reassembled when reading
4. **Cleanup**: Old chunks are removed when tokens are updated

## Troubleshooting

### Common Issues

**Middleware not working**
- Ensure `AUTH_JWKS_URI` or `AUTH_PUBLIC_KEY` is set
- Check that middleware matcher includes the protected routes
- Verify JWKS endpoint is accessible from your deployment environment

**Session not persisting**
- Make sure you're using cookie storage for SSR
- Check that cookies are not being blocked by browser settings
- Verify cookie options (secure, sameSite) match your deployment

**Token refresh failing**
- Ensure refresh tokens are being stored (requires cookie storage)
- Check that the serverUrl and redirectUri are correct
- Verify the Melody Auth server is configured for refresh tokens

## Examples

Complete examples are available in the [melody-auth-examples](https://github.com/ValueMelody/melody-auth-examples) repository:

- App Router setup
- Pages Router setup
- API route protection
- Server component auth
- Client component auth
- Middleware configuration