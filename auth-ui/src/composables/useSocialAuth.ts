import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { apiRequest, parseAuthorizeBaseValues, handleAuthorizeStep } from '@/api/auth'
import { IdentityRoute, type Locale, type View, type OidcProvider } from '@/api/types'
import { useSubmitError } from './useSubmitError'

export function useSocialAuth(onSwitchView: (view: View) => void) {
  const { locale } = useI18n()
  const authStore = useAuthStore()
  const { getSubmitError } = useSubmitError()

  const handleGoogleSignIn = async (credential: string) => {
    authStore.clearSubmitError()

    try {
      if (!authStore.authorizeParams) {
        throw new Error('No authorize params available')
      }

      const baseValues = parseAuthorizeBaseValues(authStore.authorizeParams, locale.value as Locale)

      const response = await apiRequest<{
        nextPage?: View
        code?: string
        state?: string
        redirectUri?: string
        org?: string
      }>(IdentityRoute.AuthorizeGoogle, {
        method: 'POST',
        body: JSON.stringify({
          ...baseValues,
          credential,
        }),
      })

      handleAuthorizeStep(response, locale.value as Locale, onSwitchView)
    } catch (error) {
      const errorMessage = getSubmitError(error as Error)
      authStore.setSubmitError(errorMessage)
    }
  }

  const handleFacebookSignIn = async (accessToken: string) => {
    authStore.clearSubmitError()

    try {
      if (!authStore.authorizeParams) {
        throw new Error('No authorize params available')
      }

      const baseValues = parseAuthorizeBaseValues(authStore.authorizeParams, locale.value as Locale)

      const response = await apiRequest<{
        nextPage?: View
        code?: string
        state?: string
        redirectUri?: string
        org?: string
      }>(IdentityRoute.AuthorizeFacebook, {
        method: 'POST',
        body: JSON.stringify({
          ...baseValues,
          accessToken,
        }),
      })

      handleAuthorizeStep(response, locale.value as Locale, onSwitchView)
    } catch (error) {
      const errorMessage = getSubmitError(error as Error)
      authStore.setSubmitError(errorMessage)
    }
  }

  const handleGithubSignIn = () => {
    if (!authStore.authorizeParams) return

    const baseValues = parseAuthorizeBaseValues(authStore.authorizeParams, locale.value as Locale)
    const params = new URLSearchParams()

    Object.entries(baseValues).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value)
      }
    })

    window.location.href = `${IdentityRoute.AuthorizeGitHub}?${params.toString()}`
  }

  const handleDiscordSignIn = () => {
    if (!authStore.authorizeParams) return

    const baseValues = parseAuthorizeBaseValues(authStore.authorizeParams, locale.value as Locale)
    const params = new URLSearchParams()

    Object.entries(baseValues).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value)
      }
    })

    window.location.href = `${IdentityRoute.AuthorizeDiscord}?${params.toString()}`
  }

  const handleAppleSignIn = async (identityToken: string) => {
    authStore.clearSubmitError()

    try {
      if (!authStore.authorizeParams) {
        throw new Error('No authorize params available')
      }

      const baseValues = parseAuthorizeBaseValues(authStore.authorizeParams, locale.value as Locale)

      const response = await apiRequest<{
        nextPage?: View
        code?: string
        state?: string
        redirectUri?: string
        org?: string
      }>(IdentityRoute.AuthorizeApple, {
        method: 'POST',
        body: JSON.stringify({
          ...baseValues,
          identityToken,
        }),
      })

      handleAuthorizeStep(response, locale.value as Locale, onSwitchView)
    } catch (error) {
      const errorMessage = getSubmitError(error as Error)
      authStore.setSubmitError(errorMessage)
    }
  }

  const handleOidcSignIn = (provider: OidcProvider) => {
    if (!authStore.authorizeParams) return

    const baseValues = parseAuthorizeBaseValues(authStore.authorizeParams, locale.value as Locale)
    const params = new URLSearchParams()

    Object.entries(baseValues).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value)
      }
    })
    params.append('providerId', provider.id)

    window.location.href = `${IdentityRoute.AuthorizeOidc}?${params.toString()}`
  }

  return {
    handleGoogleSignIn,
    handleFacebookSignIn,
    handleGithubSignIn,
    handleDiscordSignIn,
    handleAppleSignIn,
    handleOidcSignIn,
  }
}
