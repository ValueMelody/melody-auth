# Vue SDK

## 安装

```
npm install @melody-auth/vue --save
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

用于判断当前用户是否已通过认证。

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { isAuthenticating, isAuthenticated } = useAuth()
</script>

<template>
  <div v-if="isAuthenticating">
    <Spinner />
  </div>
  <div v-else>
    <button v-if="isAuthenticated">
      登出
    </button>
    <button v-else>
      登录
    </button>
  </div>
</template>
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
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { loginRedirect } = useAuth()

function handleLogin() {
  loginRedirect({ locale: 'en' })
}
</script>

<template>
  <button @click="handleLogin">
    登录
  </button>
</template>
```

## loginPopup

在弹窗中开启新的认证流程。

| 参数 | 类型 | 描述 | 默认值 | 必填 |
|-----------|------|-------------|---------|----------|
| locale | string | 指定认证流程使用的语言 | N/A | 否 |
| state | string | 若不使用自动生成的随机串，可自定义 state 参数 | N/A | 否 |
| org | string | 指定要使用的组织，值为组织的 slug | N/A | 否 |

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { loginPopup } = useAuth()

function handleLogin() {
  loginPopup({
    locale: 'en',
    state: JSON.stringify({ info: Math.random() })
  })
}
</script>

<template>
  <button @click="handleLogin">
    登录
  </button>
</template>
```

## logoutRedirect

触发退出登录流程。

| 参数 | 类型 | 描述 | 默认值 | 必填 |
|-----------|------|-------------|---------|----------|
| postLogoutRedirectUri | string | 退出后跳转的 URL | N/A | 否 |

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
    登出
  </button>
</template>
```

## acquireToken

获取用户的 **accessToken**，若已过期则自动刷新。

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { acquireToken } = useAuth()

async function handleFetchUserInfo() {
  const accessToken = await acquireToken()
  // 使用 accessToken 获取受保护资源
  await fetch('/...', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
</script>

<template>
  <button @click="handleFetchUserInfo">
    获取用户信息
  </button>
</template>
```

## acquireUserInfo

从认证服务器获取当前用户的公开信息。

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { acquireUserInfo } = useAuth()

async function handleFetchUserInfo() {
  const userInfo = await acquireUserInfo()
}
</script>

<template>
  <button @click="handleFetchUserInfo">
    获取用户信息
  </button>
</template>
```

## userInfo

当前用户信息。在访问 **userInfo** 之前，请先调用 **acquireUserInfo**。

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { userInfo } = useAuth()
</script>

<template>
  <div>
    <pre>{{ JSON.stringify(userInfo) }}</pre>
  </div>
</template>
```

## isAuthenticating

指示 SDK 是否正在初始化并尝试获取用户认证状态。

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

指示 SDK 是否正在获取或刷新令牌。

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

指示 SDK 是否正在获取用户信息。

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

指示是否发生了与认证流程相关的错误。

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

指示是否发生了与 acquireToken 流程相关的错误。

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { acquireTokenError } = useAuth()
</script>

<template>
  <div v-if="acquireTokenError">
    <Alert message="Acquire token error" />
  </div>
</template>
```

## acquireUserInfoError

指示是否发生了与 acquireUserInfo 流程相关的错误。

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { acquireUserInfoError } = useAuth()
</script>

<template>
  <div v-if="acquireUserInfoError">
    <Alert message="Acquire user info error" />
  </div>
</template>
```

## idToken

当前用户的 **id_token**。

```
<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'
const { idToken } = useAuth()
</script>

<template>
  <div>
    <pre>{{ idToken }}</pre>
  </div>
</template>
```

## account

从 **id_token** 解码得到的账户信息。

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

指示是否发生了与登录流程相关的错误。

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

指示是否发生了与退出流程相关的错误。

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

## 示例应用

使用 Vue SDK 的示例应用：`https://github.com/ValueMelody/melody-auth-examples/tree/main/vite-vue-example`。