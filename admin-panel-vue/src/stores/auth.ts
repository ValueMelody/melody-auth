import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface UserInfo {
  authId: string
  email: string
  firstName?: string
  lastName?: string
  roles: string[]
  locale: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const refreshTokenValue = ref<string | null>(null)
  const userInfo = ref<UserInfo | null>(null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  async function login() {
    const clientId = import.meta.env.VITE_CLIENT_ID
    const clientUri = import.meta.env.VITE_CLIENT_URI
    const apiUrl = import.meta.env.VITE_API_URL || ''
    
    const redirectUri = clientUri + '/login'
    const encodedUri = encodeURIComponent(redirectUri)
    const authUrl = apiUrl + '/authorize?response_type=code&client_id=' + clientId + '&redirect_uri=' + encodedUri + '&scope=openid profile email'
    
    window.location.href = authUrl
  }

  async function handleCallback(code: string) {
    isLoading.value = true
    try {
      const clientId = import.meta.env.VITE_CLIENT_ID
      const clientUri = import.meta.env.VITE_CLIENT_URI
      const redirectUri = clientUri + '/login'

      const response = await fetch('/api/v1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId
        })
      })

      if (!response.ok) throw new Error('Token exchange failed')

      const data = await response.json()
      token.value = data.access_token
      refreshTokenValue.value = data.refresh_token

      await fetchUserInfo()
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserInfo() {
    if (!token.value) return

    const response = await fetch('/api/v1/userinfo', {
      headers: { Authorization: 'Bearer ' + token.value }
    })

    if (response.ok) {
      const data = await response.json()
      userInfo.value = {
        authId: data.sub,
        email: data.email,
        firstName: data.given_name,
        lastName: data.family_name,
        roles: data.roles || [],
        locale: data.locale || 'en'
      }
    }
  }

  async function refreshToken() {
    if (!refreshTokenValue.value) {
      logout()
      return
    }

    try {
      const clientId = import.meta.env.VITE_CLIENT_ID
      const response = await fetch('/api/v1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshTokenValue.value,
          client_id: clientId
        })
      })

      if (!response.ok) {
        logout()
        return
      }

      const data = await response.json()
      token.value = data.access_token
      refreshTokenValue.value = data.refresh_token
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = null
    refreshTokenValue.value = null
    userInfo.value = null
    window.location.href = '/login'
  }

  function setToken(accessToken: string, refresh: string) {
    token.value = accessToken
    refreshTokenValue.value = refresh
  }

  return {
    token,
    userInfo,
    isLoading,
    isAuthenticated,
    login,
    handleCallback,
    refreshToken,
    logout,
    setToken,
    fetchUserInfo
  }
})
