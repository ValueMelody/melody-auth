# Web SDK
The Web SDK is a library that allows you to easily integrate Melody Auth into your web application that uses vanilla JavaScript.

## Installation

```
npm install @melody-auth/web --save
```

## Configuration

The Web SDK functions accept a shared configuration object.

| Parameter | Type | Description | Default | Required |
|-----------|------|-------------|---------|----------|
| clientId | string | The auth clientId your frontend connects to | N/A | Yes |
| redirectUri | string | The URL to redirect users after successful authentication | N/A | Yes |
| serverUri | string | The URL where you host the melody auth server | N/A | Yes |
| scopes | string[] | Permission scopes to request for user access | N/A | No |
| storage | 'sessionStorage' \| 'localStorage' | Storage type for authentication tokens | 'localStorage' | No |

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
  // Optional
  scopes: ['openid', 'profile'],
  storage: 'localStorage',
}
```

## loginRedirect

Triggers a new authentication flow by redirecting to the auth server.

| Parameter | Type | Description | Default | Required |
|-----------|------|-------------|---------|----------|
| locale | string | Specifies the locale to use in the authentication flow | N/A | No |
| state | string | Specifies the state to use in the authentication flow if you prefer not to use a randomly generated string | N/A | No |
| policy | string | Specifies the policy to use in the authentication flow | 'sign_in_or_sign_up' | No |
| org | string | Specifies the organization to use in the authentication flow, the value should be the slug of the organization | N/A | No |

```
await triggerLogin('redirect', config, {
  locale: 'en',
  // state: 'your-predictable-state',
  // policy: 'sign_in_or_sign_up',
  // org: 'your-org-slug',
})
```

## loginPopup

Triggers a new authentication flow in a popup window. When the user completes authentication, your `authorizePopupHandler` is invoked with `{ state, code }`. You must exchange the code for tokens.

| Parameter | Type | Description | Default | Required |
|-----------|------|-------------|---------|----------|
| locale | string | Specifies the locale to use in the authentication flow | N/A | No |
| state | string | Specifies the state to use in the authentication flow if you prefer not to use a randomly generated string | N/A | No |
| policy | string | Specifies the policy to use in the authentication flow | 'sign_in_or_sign_up' | No |
| org | string | Specifies the organization to use in the authentication flow, the value should be the slug of the organization | N/A | No |
| authorizePopupHandler | (data: { state: string; code: string }) => void | Handler called when the popup posts back auth code | N/A | No |

```
await triggerLogin('popup', config, {
  locale: 'en',
  authorizePopupHandler: async ({ state, code }) => {
    await exchangeTokenByAuthCode(code, state, config)
    // tokens have now been processed (see notes below)
  },
})
```

## handleRedirectCallback

When the user returns from the auth server via redirect, read the `code` and `state` from the URL and exchange them for tokens.

```
const { code, state } = loadCodeAndStateFromUrl()
await exchangeTokenByAuthCode(code, state, config)
```

### What gets stored

After a successful `exchangeTokenByAuthCode` call:

- The refresh token and id token are persisted using the configured storage under `StorageKey.RefreshToken` and `StorageKey.IdToken`.
- The access token is returned from the exchange function but is not persisted. Use it immediately, or reacquire later via refresh token.

## acquireToken

Gets a fresh access token using the stored refresh token when needed.

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

Gets the user's public info from the auth server using a valid access token.

```
const userInfo = await getUserInfo(config, { accessToken })
```

## logoutRedirect

Logs the user out. When `localOnly` is false and a refresh token is present, a remote logout request is sent first to obtain the post-logout redirect. Local tokens are cleared and the browser is redirected.

| Parameter | Type | Description |
|-----------|------|-------------|
| postLogoutRedirectUri | string | The URL to redirect users after logout |
| localOnly | boolean | If true, only clears local tokens and redirects without remote logout |

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
  false, // set to true to skip remote logout
)
```

## Example app

See the minimal Vite example using the Web SDK: `https://github.com/ValueMelody/melody-auth-examples/tree/main/vite-web-example`.
