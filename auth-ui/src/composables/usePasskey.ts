import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { startAuthentication, startRegistration } from '@simplewebauthn/browser'
import { useAuthStore } from '@/stores/auth'
import { apiRequest, parseAuthorizeBaseValues, parseAuthorizeFollowUpValues, handleAuthorizeStep } from '@/api/auth'
import { IdentityRoute, type Locale, type View } from '@/api/types'
import { useSubmitError } from './useSubmitError'

export function usePasskey(onSwitchView: (view: View) => void) {
  const { locale } = useI18n()
  const authStore = useAuthStore()
  const { getSubmitError } = useSubmitError()

  const passkeyOption = ref<any | null | false>(null)
  const isVerifying = ref(false)
  const isEnrolling = ref(false)

  const getPasskeyOption = async (email: string) => {
    try {
      let baseValues: Record<string, string | undefined>
      if (authStore.authorizeParams) {
        baseValues = parseAuthorizeBaseValues(authStore.authorizeParams, locale.value as Locale)
      } else if (authStore.followUpParams) {
        baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)
      } else {
        throw new Error('No auth params available')
      }

      const response = await apiRequest<{
        passkeyOption: PublicKeyCredentialRequestOptionsJSON | false
      }>(IdentityRoute.AuthorizePasskeyVerify, {
        method: 'GET',
        headers: {
          'x-email': email,
          'x-locale': locale.value,
          'x-org': baseValues.org || '',
        },
      })

      passkeyOption.value = response.passkeyOption || false
    } catch (error) {
      passkeyOption.value = false
      const errorMessage = getSubmitError(error as Error)
      authStore.setSubmitError(errorMessage)
    }
  }

  const verifyPasskey = async () => {
    if (!passkeyOption.value) return

    isVerifying.value = true
    authStore.clearSubmitError()

    try {
      const credential = await startAuthentication({ optionsJSON: passkeyOption.value })

      let baseValues: Record<string, string | undefined>
      if (authStore.authorizeParams) {
        baseValues = parseAuthorizeBaseValues(authStore.authorizeParams, locale.value as Locale)
      } else if (authStore.followUpParams) {
        baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)
      } else {
        throw new Error('No auth params available')
      }

      const response = await apiRequest<{
        nextPage?: View
        code?: string
        state?: string
        redirectUri?: string
        org?: string
      }>(IdentityRoute.AuthorizePasskeyVerify, {
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
    } finally {
      isVerifying.value = false
    }
  }

  const enrollPasskey = async () => {
    isEnrolling.value = true
    authStore.clearSubmitError()

    try {
      let baseValues: Record<string, string | undefined>
      if (authStore.followUpParams) {
        baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)
      } else {
        throw new Error('No follow-up params available')
      }

      const optionsResponse = await apiRequest<{
        enrollOptions: any
      }>(IdentityRoute.ProcessPasskeyEnroll, {
        method: 'GET',
        headers: {
          'x-code': baseValues.code || '',
          'x-locale': locale.value,
          'x-org': baseValues.org || '',
        },
      })

      const credential = await startRegistration({ optionsJSON: optionsResponse.enrollOptions })

      const response = await apiRequest<{
        nextPage?: View
        code?: string
        state?: string
        redirectUri?: string
        org?: string
      }>(IdentityRoute.ProcessPasskeyEnroll, {
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
    } finally {
      isEnrolling.value = false
    }
  }

  const declinePasskey = async () => {
    try {
      let baseValues: Record<string, string | undefined>
      if (authStore.followUpParams) {
        baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)
      } else {
        throw new Error('No follow-up params available')
      }

      const response = await apiRequest<{
        nextPage?: View
        code?: string
        state?: string
        redirectUri?: string
        org?: string
      }>(IdentityRoute.ProcessPasskeyEnrollDecline, {
        method: 'POST',
        body: JSON.stringify(baseValues),
      })

      handleAuthorizeStep(response, locale.value as Locale, onSwitchView)
    } catch (error) {
      const errorMessage = getSubmitError(error as Error)
      authStore.setSubmitError(errorMessage)
    }
  }

  const resetPasskeyInfo = () => {
    passkeyOption.value = null
  }

  return {
    passkeyOption,
    isVerifying,
    isEnrolling,
    getPasskeyOption,
    verifyPasskey,
    enrollPasskey,
    declinePasskey,
    resetPasskeyInfo,
  }
}
