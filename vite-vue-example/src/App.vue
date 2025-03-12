<script setup lang="ts">
import { useAuth } from './melody-auth/useAuth'

const {
  loginRedirect,
  loginPopup,
  refreshToken,
  logoutRedirect,
  accessToken,
  isAuthenticated,
  acquireUserInfo,
  acquireToken,
  isAuthenticating,
  account,
  userInfo,
  isLoadingToken,
  isLoadingUserInfo,
  authenticationError,
  acquireTokenError,
  acquireUserInfoError,
  loginError,
  logoutError,
} = useAuth()
</script>

<template>
  <div>
    <div>
      {{ userInfo }}
    </div>
    <div>
      <button @click="loginRedirect">Login</button>
      <button @click="acquireUserInfo">Acquire User Info</button>
      <button @click="logoutRedirect({ postLogoutRedirectUri: 'http://localhost:3000/en/dashboard' })">Logout</button>
    </div>
  </div>
</template>

<style scoped>

</style>
