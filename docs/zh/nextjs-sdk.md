# Next.js SDK

Next.js SDK 让您可以轻松地将 Melody Auth 集成到 Next.js 应用程序中，支持服务端渲染、中间件保护和基于 Cookie 的存储。

## 安装

```bash
npm install @melody-auth/nextjs --save
```

## NextAuthProvider

将您的应用程序包装在 NextAuthProvider 组件中，为您的应用程序组件提供身份认证相关的上下文。

| 参数 | 类型 | 描述 | 默认值 | 必需 |
|------|------|------|--------|------|
| clientId | string | 前端连接的认证客户端 ID | N/A | 是 |
| redirectUri | string | 成功认证后重定向用户的 URL | N/A | 是 |
| serverUrl | string | 托管 Melody Auth 服务器的 URL | N/A | 是 |
| storage | 'cookieStorage' \| 'localStorage' \| 'sessionStorage' | 认证令牌的存储类型 | 'cookieStorage' | 否 |
| cookieOptions | CookieOptions | Cookie 配置选项 | {} | 否 |
| scopes | string[] | 请求用户访问的权限范围 | ['openid', 'profile', 'email'] | 否 |

```tsx
import { NextAuthProvider } from '@melody-auth/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
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

创建用于 JWT 验证保护路由的 Next.js 中间件函数。

| 参数 | 类型 | 描述 | 默认值 | 必需 |
|------|------|------|--------|------|
| publicKey | string | 用于 JWT 验证的 PEM 编码 RSA 公钥 | N/A | 否* |
| jwksUri | string | 获取 JWKS 进行 JWT 验证的 URI | N/A | 否* |
| publicPaths | string[] | 不需要身份认证的路径前缀数组 | [] | 否 |
| redirectPath | string | 重定向未认证用户的路径 | '/login' | 否 |
| cookieOptions | CookieOptions | Cookie 配置选项 | {} | 否 |

*需要 `publicKey` 或 `jwksUri` 其中之一。

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

为客户端组件提供身份认证状态和方法的 React Hook。

返回包含以下内容的对象：
- `isAuthenticated`: boolean - 用户是否已认证
- `isAuthenticating`: boolean - 认证过程中的加载状态
- `userInfo`: object - 用户资料信息
- `account`: object - JWT 账户声明
- `accessToken`: string | null - 当前访问令牌
- `idToken`: string | null - 当前 ID 令牌
- `loginRedirect()`: function - 重定向到登录页面
- `logoutRedirect()`: function - 退出登录并重定向
- `refreshSession()`: function - 强制刷新令牌

```tsx
import { useNextAuth } from '@melody-auth/nextjs';

export default function Profile() {
  const { isAuthenticated, account, loginRedirect, logoutRedirect } = useNextAuth();

  if (!isAuthenticated) {
    return <button onClick={() => loginRedirect()}>登录</button>;
  }

  return (
    <div>
      <p>欢迎, {account?.email}!</p>
      <button onClick={() => logoutRedirect()}>退出</button>
    </div>
  );
}
```

## getServerSession

从服务器组件中的 Cookie 检索当前用户会话。如果未认证则返回 null。

| 参数 | 类型 | 描述 | 必需 |
|------|------|------|------|
| options | ServerAuthOptions | 配置对象 | 是 |

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
      <h1>个人资料</h1>
      <p>用户 ID: {session.userId}</p>
      <p>邮箱: {session.email}</p>
    </div>
  );
}
```

## requireAuth

确保用户已认证，如果未认证则抛出错误。对保护 API 路由很有用。

| 参数 | 类型 | 描述 | 必需 |
|------|------|------|------|
| options | ServerAuthOptions | 配置对象 | 是 |
| redirectTo | string | 建议重定向的路径 | 否 |

```typescript
import { requireAuth } from '@melody-auth/nextjs';

export async function GET() {
  const session = await requireAuth({
    clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!,
    serverUrl: process.env.NEXT_PUBLIC_AUTH_SERVER_URL!,
    redirectUri: process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI!,
  });

  return Response.json({
    message: `你好 ${session.email}`,
    userId: session.userId
  });
}
```