# Web SDK
Web SDK 可让你将 Melody Auth 集成到使用原生 JavaScript 的 Web 应用程序中。

## 安装

```
npm install @melody-auth/web --save
```

## 配置

Web SDK 的函数接受一个共享的配置对象。

| 参数 | 类型 | 描述 | 默认值 | 必填 |
|------|------|------|--------|------|
| clientId | string | 前端连接的认证 clientId | N/A | 是 |
| redirectUri | string | 用户成功认证后重定向的 URL | N/A | 是 |
| serverUri | string | 你托管 melody auth 服务器的 URL | N/A | 是 |
| scopes | string[] | 请求用户访问权限的范围 | N/A | 否 |
| storage | 'sessionStorage' \| 'localStorage' | 存储认证 token 的类型 | 'localStorage' | 否 |

```
import {
  triggerLogin,
  loadCodeAndStateFromUrl,
  exchangeTokenByAuthCode,
  exchangeTokenByRefreshToken,
  getUserInfo,
  logout,
} from '@melody-auth/web'

const config = {
  clientId: '<CLIENT_ID>',
  redirectUri: '<CLIENT_REDIRECT_URI>',
  serverUri: '<AUTH_SERVER_URI>',
  // 可选
  scopes: ['openid', 'profile'],
  storage: 'localStorage',
}
```

## loginRedirect

通过重定向到认证服务器启动一个新的认证流程。

| 参数 | 类型 | 描述 | 默认值 | 必填 |
|------|------|------|--------|------|
| locale | string | 指定认证流程中使用的语言环境 | N/A | 否 |
| state | string | 指定认证流程中使用的 state，如果不想使用随机生成的字符串 | N/A | 否 |
| policy | string | 指定认证流程中使用的策略 | 'sign_in_or_sign_up' | 否 |
| org | string | 指定认证流程中使用的组织，值应为组织的 slug | N/A | 否 |

```
await triggerLogin('redirect', config, {
  locale: 'en',
  // state: 'your-predictable-state',
  // policy: 'sign_in_or_sign_up',
  // org: 'your-org-slug',
})
```

## loginPopup

在弹窗中启动一个新的认证流程。当用户完成认证时，你的 `authorizePopupHandler` 会被调用，并传入 `{ state, code }`。你必须用该 code 来交换 token。

| 参数 | 类型 | 描述 | 默认值 | 必填 |
|------|------|------|--------|------|
| locale | string | 指定认证流程中使用的语言环境 | N/A | 否 |
| state | string | 指定认证流程中使用的 state，如果不想使用随机生成的字符串 | N/A | 否 |
| policy | string | 指定认证流程中使用的策略 | 'sign_in_or_sign_up' | 否 |
| org | string | 指定认证流程中使用的组织，值应为组织的 slug | N/A | 否 |
| authorizePopupHandler | (data: { state: string; code: string }) => void | 弹窗返回认证 code 时调用的处理器 | N/A | 否 |

```
await triggerLogin('popup', config, {
  locale: 'en',
  authorizePopupHandler: async ({ state, code }) => {
    await exchangeTokenByAuthCode(code, state, config)
    // token 已处理（见下文说明）
  },
})
```

## handleRedirectCallback

当用户通过重定向从认证服务器返回时，从 URL 中读取 `code` 和 `state`，并用它们交换 token。

```
const { code, state } = loadCodeAndStateFromUrl()
await exchangeTokenByAuthCode(code, state, config)
```

### 存储内容

成功调用 `exchangeTokenByAuthCode` 后：

- refresh token 和 id token 会使用配置的存储方式保存，键分别为 `StorageKey.RefreshToken` 和 `StorageKey.IdToken`。
- access token 会从交换函数返回，但不会被持久化。需要立即使用，或者之后通过 refresh token 重新获取。

## acquireToken

在需要时使用已存储的 refresh token 获取新的 access token。

```
import { getStorage, StorageKey } from '@melody-auth/shared'

const storage = getStorage(config.storage)
const refreshTokenRaw = storage.getItem(StorageKey.RefreshToken)
const refreshToken = refreshTokenRaw && JSON.parse(refreshTokenRaw).refreshToken

if (!refreshToken) throw new Error('No refresh token found')

const { accessToken, expiresIn, expiresOn } = await exchangeTokenByRefreshToken(
  config,
  refreshToken,
)
```

## acquireUserInfo

使用有效的 access token 从认证服务器获取用户的公开信息。

```
const userInfo = await getUserInfo(config, { accessToken })
```

## logoutRedirect

注销用户。当 `localOnly` 为 false 且存在 refresh token 时，会先发送远程注销请求以获取注销后的重定向地址。然后清除本地 token 并重定向浏览器。

| 参数 | 类型 | 描述 |
|------|------|------|
| postLogoutRedirectUri | string | 用户注销后重定向的 URL |
| localOnly | boolean | 如果为 true，则只清除本地 token 并重定向，不进行远程注销 |

```
import { getStorage, StorageKey } from '@melody-auth/shared'

const storage = getStorage(config.storage)
const idTokenRaw = storage.getItem(StorageKey.IdToken)
const refreshTokenRaw = storage.getItem(StorageKey.RefreshToken)
const accessToken = /* obtain via exchangeTokenByRefreshToken(...) */
const refreshToken = refreshTokenRaw && JSON.parse(refreshTokenRaw).refreshToken

await logout(
  config,
  accessToken ?? '',
  refreshToken ?? null,
  'http://localhost:3000/',
  false, // 设置为 true 跳过远程注销
)
```

## 示例应用

查看使用 Web SDK 的最简 Vite 示例：`https://github.com/ValueMelody/melody-auth-examples/tree/main/vite-web-example`。
