# Vue SDK

## Installation

```
npm install @melody-auth/vue --save
```

## AuthProvider

Wrap your application inside AuthProvider component to provide the auth related context to your application components.

| Parameter | Type | Description | Default | Required |
|-----------|------|-------------|---------|----------|
| clientId | string | The auth clientId your frontend connects to | N/A | Yes |
| redirectUri | string | The URL to redirect users after successful authentication | N/A | Yes |
| serverUri | string | The URL where you host the melody auth server | N/A | Yes |
| scopes | string[] | Permission scopes to request for user access | N/A | No |
| storage | 'sessionStorage' \| 'localStorage' | Storage type for authentication tokens | 'localStorage' | No |
| onLoginSuccess | (attr: { locale?: string; state?: string }) => void | Function to execute after a successful login | N/A | No |

```
import { createApp } from 'vue'
import { AuthProvider } from '@melody-auth/vue'
import App from './App.vue'

const app = createApp(App)

app.use(
  AuthProvider,
  {
    clientId: import.meta.env.VITE_AUTH_SPA_CLIENT_ID,
    redirectUri: import.meta.env.VITE_CLIENT_URI,
    serverUri: import.meta.env.VITE_AUTH_SERVER_URI,
    storage: 'localStorage',
  },
)

app.mount('#app')
```

## isAuthenticated

Indicates if the current user is authenticated.

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { isAuthenticated } = useAuth()
</script>

<template>
  <div v-if="isAuthenticating">
    <Spinner />
  </div>
  <div v-else>
    <div v-if="isAuthenticated">
      <button
        Logout
      </button>
    </div>
    <div v-else>
      <button>
        Login
      </button>
    </div>
  </div>
</template>
```

## loginRedirect

Triggers a new authentication flow by redirecting to the auth server.

| Parameter | Type | Description | Default | Required |
|-----------|------|-------------|---------|----------|
| locale | string | Specifies the locale to use in the authentication flow | N/A | No |
| state | string | Specifies the state to use in the authentication flow if you prefer not to use a randomly generated string | N/A | No |
| policy | string | Specifies the policy to use in the authentication flow | 'sign_in_or_sign_up' | No |
| org | string | Specifies the organization to use in the authentication flow | N/A | No |

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { loginRedirect } = useAuth()

function handleLogin() {
  loginRedirect({ locale: 'en' })
}
</script>

<template>
  <button @click="handleLogin">
    Login with Redirect
  </button>
</template>
```

## loginPopup

Triggers a new authentication flow in a popup.

| Parameter | Type | Description | Default | Required |
|-----------|------|-------------|---------|----------|
| locale | string | Specifies the locale to use in the authentication flow | N/A | No |
| state | string | Specifies the state to use in the authentication flow if you prefer not to use a randomly generated string | N/A | No |
| org | string | Specifies the organization to use in the authentication flow | N/A | No |

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { loginPopup } = useAuth()

function handleLogin() {
  loginPopup({ locale: 'en' })
}
</script>

<template>
  <button @click="handleLogin">
    Login with Popup
  </button>
</template>
```

## logoutRedirect

Triggers the logout flow.

| Parameter | Type | Description | Default | Required |
|-----------|------|-------------|---------|----------|
| postLogoutRedirectUri | string | The URL to redirect users after logout | N/A | No |

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { logoutRedirect } = useAuth()

function handleLogout() {
  logoutRedirect({ postLogoutRedirectUri: 'http://localhost:3000/' })
}
</script>

<template>
  <button @click="handleLogout">
    Logout
  </button>
</template>
```

## acquireToken

Gets the user's access token, or refreshes it if expired.

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { acquireToken, isAuthenticated } = useAuth()

async function fetchUserInfo() {
  const token = await acquireToken()
  // Use the token to fetch protected resources
  await fetch('/...', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
</script>

<template>
  <button v-if="isAuthenticated" @click="fetchUserInfo">
    Fetch User Info
  </button>
</template>
```

## acquireUserInfo

Gets the user's public info from the auth server.

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { acquireUserInfo, isAuthenticated } = useAuth()

async function fetchPublicInfo() {
  const userInfo = await acquireUserInfo()
  console.log(userInfo)
}
</script>

<template>
  <button v-if="isAuthenticated" @click="fetchPublicInfo">
    Fetch Public User Info
  </button>
</template>
```

## userInfo

The current user's details. Be sure to invoke acquireUserInfo before accessing userInfo.
```
import { useAuth } from '@melody-auth/react'

export default function Home () {
  const { userInfo } = useAuth()

  <div>{JSON.stringify(userInfo)}</div>
}
```

## isAuthenticating

Indicates whether the SDK is initializing and attempting to obtain the user's authentication state.

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { isAuthenticating } = useAuth()
</script>

<template>
  <div v-if="isAuthenticating">
    <Spinner />
  </div>
</template>
```

## isLoadingToken

Indicates whether the SDK is acquiring the token.

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { isLoadingToken } = useAuth()
</script>

<template>
  <div v-if="isLoadingToken">
    <Spinner />
  </div>
</template>
```

## isLoadingUserInfo

Indicates whether the SDK is acquiring the user's information.

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { isLoadingUserInfo } = useAuth()
</script>

<template>
  <div v-if="isLoadingUserInfo">
    <Spinner />
  </div>
</template>
```

## authenticationError

Indicates whether there is an error during authentication.

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { authenticationError } = useAuth()
</script>

<template>
  <div v-if="authenticationError">
    <Alert message="Authentication error" />
  </div>
</template>
```

## acquireTokenError

Indicates whether there is an error during token acquisition.

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { acquireTokenError } = useAuth()
</script>

<template>
  <div v-if="acquireTokenError">
    <Alert message="Error acquiring token" />
  </div>
</template>
```

## acquireUserInfoError

Indicates whether there is an error while acquiring user information.

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { acquireUserInfoError } = useAuth()
</script>

<template>
  <div v-if="acquireUserInfoError">
    <Alert message="Error acquiring user info" />
  </div>
</template>
```

## account

Decoded account information from the id_token.

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { account } = useAuth()
</script>

<template>
  <div>
    <pre>{{ account }}</pre>
  </div>
</template>
```

## loginError

Indicates whether there is a login process related error.

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { loginError } = useAuth()
</script>

<template>
  <div v-if="loginError">
    <Alert message="Login error" />
  </div>
</template>
```

## logoutError

Indicates whether there is a logout process related error.

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { logoutError } = useAuth()
</script>

<template>
  <div v-if="logoutError">
    <Alert message="Logout error" />
  </div>
</template>
```
