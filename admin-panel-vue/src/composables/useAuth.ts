import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export const useAuth = () => {
  const authStore = useAuthStore()

  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const isLoading = computed(() => authStore.isLoading)
  const userInfo = computed(() => authStore.userInfo)
  const token = computed(() => authStore.token)

  const login = () => authStore.login()
  const logout = () => authStore.logout()
  const handleCallback = (code: string) => authStore.handleCallback(code)
  const refreshToken = () => authStore.refreshToken()

  return {
    isAuthenticated,
    isLoading,
    userInfo,
    token,
    login,
    logout,
    handleCallback,
    refreshToken,
  }
}
