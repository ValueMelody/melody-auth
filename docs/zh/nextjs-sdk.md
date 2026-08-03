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

## 令牌验证

本 SDK 的所有服务端入口（`createMelodyAuthMiddleware`、`withAuth`、`getServerSession`、
`getCachedServerSession`、`requireAuth`）都基于 **access token JWT** 建立会话，并且在每次请求时
使用认证服务器的签名密钥对其进行密码学验证。验证内容包括：

- RS256 签名，并锁定算法，防止令牌被其他算法重新签名
- `iss` 声明，必须与你的 `serverUrl` 一致
- 客户端绑定：`azp` 为必需且必须等于你的 `clientId`，`aud`（存在时）必须包含它，因此签发给
  其他应用的令牌无法在你的应用上重放
- 令牌类型：access token 必须带有字符串类型的 `scope` 声明，因此由同一签发者签名的 ID token
  无法被替换进 access token cookie
- `exp` 与 `nbf`，允许 5 秒的时钟偏差

存储在 cookie 中的令牌元数据（`expiresOn` 以及缓存的 `account` 内容）由浏览器控制，绝不会用于
判断请求是否已认证。所有身份声明均来自已验证的 JWT payload。

因此，所有服务端入口都**必须**提供 `serverUrl` 与 `clientId`。签名密钥从
`${serverUrl}/.well-known/jwks.json` 获取，并按令牌的 `kid` 选择，因此认证服务器的密钥轮换会被
自动处理。配置错误的应用会在启动时抛出异常，而不会退化为不验证令牌。

| 参数 | 类型 | 描述 | 默认值 | 必需 |
|------|------|------|--------|------|
| serverUrl | string | 你部署 melody auth 服务器的 URL，即期望的令牌签发者 | N/A | 是 |
| clientId | string | 你的应用连接的 auth clientId，签发给其他客户端的令牌会被拒绝 | N/A | 是 |
| jwksUri | string | 覆盖由 `serverUrl` 推导出的 JWKS URI | `${serverUrl}/.well-known/jwks.json` | 否 |
| publicKey | string | PEM 编码 RSA 公钥，用于离线验证以替代 JWKS URI | N/A | 否 |
| clockTolerance | number | 校验 `exp`/`nbf` 时允许的时钟偏差秒数 | 5 | 否 |

ID token 是可选的（取决于 `openid` scope）。存在时会以同样的方式验证，并额外校验其 `aud` 以及
subject 必须与 access token 的 subject 一致。验证失败的 ID token 会使会话失效；仅仅是过期的
ID token 会被忽略，会话继续基于 access token 存在，只是不再携带身份声明。

## createMelodyAuthMiddleware

创建用于 JWT 验证保护路由的 Next.js 中间件函数。

| 参数 | 类型 | 描述 | 默认值 | 必需 |
|------|------|------|--------|------|
| serverUrl | string | 你部署 melody auth 服务器的 URL | N/A | 是 |
| clientId | string | 你的应用连接的 auth clientId | N/A | 是 |
| jwksUri | string | 覆盖由 `serverUrl` 推导出的 JWKS URI | `${serverUrl}/.well-known/jwks.json` | 否 |
| publicKey | string | 用于 JWT 验证的 PEM 编码 RSA 公钥 | N/A | 否 |
| clockTolerance | number | 允许的时钟偏差秒数 | 5 | 否 |
| publicPaths | string[] | 不需要身份认证的路径前缀数组 | [] | 否 |
| redirectPath | string | 重定向未认证用户的路径 | '/login' | 否 |
| cookieOptions | CookieOptions | Cookie 配置选项 | {} | 否 |

```ts
import { createMelodyAuthMiddleware } from '@melody-auth/nextjs';

export default createMelodyAuthMiddleware({
  serverUrl: process.env.NEXT_PUBLIC_AUTH_SERVER_URL!,
  clientId: process.env.NEXT_PUBLIC_AUTH_CLIENT_ID!,
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