# React SDK

## 安装

```
npm install @melody-auth/react --save
```

## AuthProvider

将你的应用包裹在 **AuthProvider** 组件内，为应用中的其他组件提供认证上下文。

| 参数 | 类型 | 描述 | 默认值 | 必填 |
|-----------|------|-------------|---------|----------|
| clientId | string | 前端所连接的 app **clientId** | N/A | 是 |
| redirectUri | string | 认证成功后重定向的 URL | N/A | 是 |
| serverUri | string | 托管认证服务器的 URL | N/A | 是 |
| scopes | string[] | 需要申请的权限作用域 | N/A | 否 |
| storage | 'sessionStorage' \| 'localStorage' | 用于存储认证令牌的存储类型 | 'localStorage' | 否 |
| onLoginSuccess | (attr: { locale?: string; state?: string }) => void | 登录成功后执行的回调函数 | N/A | 否 |

```
import { AuthProvider } from '@melody-auth/react'

export default function RootLayout ({ children }: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <AuthProvider
        clientId={process.env.CLIENT_ID ?? ''}
        redirectUri={process.env.REDIRECT_URI ?? ''}
        serverUri={process.env.SERVER_URI ?? ''}
      >
        <body>
          {children}
        </body>
      </AuthProvider>
    </html>
  )
}
```

## isAuthenticated

用于判断当前用户是否已通过认证。

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { isAuthenticating, isAuthenticated } = useAuth()

  if (isAuthenticating) return <Spinner />
  if (isAuthenticated) return <Button>登出</Button>
  if (!isAuthenticated) return <Button>登录</Button>
}
```

## loginRedirect

通过浏览器重定向的方式开启新的认证流程。

| 参数 | 类型 | 描述 | 默认值 | 必填 |
|-----------|------|-------------|---------|----------|
| locale | string | 指定认证流程使用的语言 | N/A | 否 |
| state | string | 若不使用自动生成的随机串，可自定义 state 参数 | N/A | 否 |
| policy | string | 指定要使用的策略 | 'sign_in_or_sign_up' | 否 |
| org | string | 指定要使用的组织，值为组织的 slug | N/A | 否 |

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { isAuthenticated, loginRedirect } = useAuth()

  const handleLogin = () => {
    loginRedirect({
      locale: 'en',
      state: JSON.stringify({ info: Math.random() })
    })
  }

  if (!isAuthenticated) {
    return <Button onClick={handleLogin}>登录</Button>
  }
}
```

## loginPopup

在弹窗中开启新的认证流程。

| 参数 | 类型 | 描述 | 默认值 | 必填 |
|-----------|------|-------------|---------|----------|
| locale | string | 指定认证流程使用的语言 | N/A | 否 |
| state | string | 若不使用自动生成的随机串，可自定义 state 参数 | N/A | 否 |
| org | string | 指定要使用的组织，值为组织的 slug | N/A | 否 |

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { isAuthenticated, loginPopup } = useAuth()

  const handleLogin = () => {
    loginPopup({
      locale: 'en',
      state: JSON.stringify({ info: Math.random() })
    })
  }

  if (!isAuthenticated) {
    return <Button onClick={handleLogin}>登录</Button>
  }
}
```

## logoutRedirect

触发退出登录流程。

| 参数 | 类型 | 描述 | 默认值 | 必填 |
|-----------|------|-------------|---------|----------|
| postLogoutRedirectUri | string | 退出后跳转的 URL | N/A | 否 |

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { isAuthenticated, logoutRedirect } = useAuth()

  const handleLogout = () => {
    logoutRedirect({ postLogoutRedirectUri: 'http://localhost:3000/' })
  }

  if (isAuthenticated) {
    return <Button onClick={handleLogout}>登出</Button>
  }
}
```

## acquireToken

获取用户的 **accessToken**，若已过期则自动刷新。

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { isAuthenticated, acquireToken } = useAuth()

  const handleFetchUserInfo = () => {
    const accessToken = await acquireToken()
    // 使用 accessToken 获取受保护资源
    await fetch('/...', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
  }

  if (isAuthenticated) {
    return <Button onClick={handleFetchUserInfo}>获取用户信息</Button>
  }
}
```

## acquireUserInfo

从认证服务器获取当前用户的公开信息。

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { isAuthenticated, acquireUserInfo } = useAuth()

  const handleFetchUserInfo = () => {
    const userInfo = await acquireUserInfo()
  }

  if (isAuthenticated) {
    return <Button onClick={handleFetchUserInfo}>获取用户信息</Button>
  }
}
```

## userInfo

当前用户信息。在访问 **userInfo** 之前，请先调用 **acquireUserInfo**。

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { userInfo } = useAuth()

  <div>{JSON.stringify(userInfo)}</div>
}
```

## isAuthenticating

指示 SDK 是否正在初始化并尝试获取用户认证状态。

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { isAuthenticating } = useAuth()

  if (isAuthenticating) return <Spinner />
}
```

## isLoadingToken

指示 SDK 是否正在获取或刷新令牌。

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { isLoadingToken } = useAuth()

  if (isLoadingToken) return <Spinner />
}
```

## isLoadingUserInfo

指示 SDK 是否正在获取用户信息。

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { isLoadingUserInfo } = useAuth()

  if (isLoadingUserInfo) return <Spinner />
}
```

## authenticationError

指示是否发生了与认证流程相关的错误。

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { authenticationError } = useAuth()

  if (authenticationError) return <Alert />
}
```

## acquireTokenError

指示是否发生了与 acquireToken 流程相关的错误。

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { acquireTokenError } = useAuth()

  if (acquireTokenError) return <Alert />
}
```

## acquireUserInfoError

指示是否发生了与 acquireUserInfo 流程相关的错误。

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { acquireUserInfoError } = useAuth()

  if (acquireUserInfoError) return <Alert />
}
```

## idToken

当前用户的 **id_token**。

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { idToken } = useAuth()
}
```

## account

从 **id_token** 解码得到的账户信息。

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { account } = useAuth()
}
```

## loginError

指示是否发生了与登录流程相关的错误。

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { loginError } = useAuth()

  if (loginError) return <Alert />
}
```

## logoutError

指示是否发生了与退出流程相关的错误。

```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { logoutError } = useAuth()

  if (logoutError) return <Alert />
}
```
