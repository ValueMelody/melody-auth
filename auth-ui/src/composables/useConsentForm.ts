import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { apiRequest, parseAuthorizeFollowUpValues, handleAuthorizeStep } from '@/api/auth'
import { IdentityRoute, type Locale, type View } from '@/api/types'
import { useSubmitError } from './useSubmitError'

export interface Scope {
  id: number
  name: string
  locales: { locale: string; value: string }[]
}

export interface ConsentInfo {
  appName: string
  scopes: Scope[]
}

export function useConsentForm(onSwitchView: (view: View) => void) {
  const { locale } = useI18n()
  const authStore = useAuthStore()
  const { getSubmitError } = useSubmitError()

  const consentInfo = ref<ConsentInfo | null>(null)
  const isLoading = ref(true)
  const isAccepting = ref(false)

  const fetchConsentInfo = async () => {
    isLoading.value = true

    try {
      if (!authStore.followUpParams) {
        throw new Error('No follow-up params available')
      }

      const baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)

      const response = await apiRequest<ConsentInfo>(IdentityRoute.AppConsent, {
        method: 'GET',
        headers: {
          'x-code': baseValues.code || '',
          'x-locale': locale.value,
          'x-org': baseValues.org || '',
        },
      })

      consentInfo.value = response
    } catch (error) {
      const errorMessage = getSubmitError(error as Error)
      authStore.setSubmitError(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  const handleAccept = async () => {
    isAccepting.value = true
    authStore.clearSubmitError()

    try {
      if (!authStore.followUpParams) {
        throw new Error('No follow-up params available')
      }

      const baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)

      const response = await apiRequest<{
        nextPage?: View
        code?: string
        state?: string
        redirectUri?: string
        org?: string
      }>(IdentityRoute.AppConsent, {
        method: 'POST',
        body: JSON.stringify(baseValues),
      })

      handleAuthorizeStep(response, locale.value as Locale, onSwitchView)
    } catch (error) {
      const errorMessage = getSubmitError(error as Error)
      authStore.setSubmitError(errorMessage)
    } finally {
      isAccepting.value = false
    }
  }

  const handleDecline = () => {
    const redirectUri = authStore.authorizeParams?.redirectUri
    if (redirectUri) {
      window.location.href = `${redirectUri}?error=access_denied`
    }
  }

  onMounted(() => {
    fetchConsentInfo()
  })

  return {
    consentInfo,
    isLoading,
    isAccepting,
    handleAccept,
    handleDecline,
  }
}
