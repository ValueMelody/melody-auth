<script setup lang="ts">
import { useAuth } from '@melody-auth/vue'

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
      <button @click="loginRedirect">Login</button>
      <button @click="acquireUserInfo">Acquire User Info</button>
      <button @click="logoutRedirect({ postLogoutRedirectUri: 'http://localhost:3000/en/dashboard' })">Logout</button>
    </div>
    <div>
      <p>Is Authenticated: {{ isAuthenticated }}</p>
      <p>Is Authenticating: {{ isAuthenticating }}</p>
      <p>Access Token: {{ accessToken }}</p>
      <p>Refresh Token: {{ refreshToken }}</p>
      <p>Account: {{ account }}</p>
      <p>User Info: {{ userInfo }}</p>
      <p>Is Loading Token: {{ isLoadingToken }}</p>
      <p>Is Loading User Info: {{ isLoadingUserInfo }}</p>
      <p>Authentication Error: {{ authenticationError }}</p>
      <p>Acquire Token Error: {{ acquireTokenError }}</p>
      <p>Acquire User Info Error: {{ acquireUserInfoError }}</p>
      <p>Login Error: {{ loginError }}</p>
      <p>Logout Error: {{ logoutError }}</p>
    </div>
  </div>
</template>

<style scoped>

</style>
