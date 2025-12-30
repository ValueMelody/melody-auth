import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { apiRequest, parseAuthorizeFollowUpValues, handleAuthorizeStep } from '@/api/auth'
import { IdentityRoute, type Locale, type View } from '@/api/types'
import { useSubmitError } from './useSubmitError'

export type MfaType = 'email' | 'otp' | 'sms'

export function useMfaForm(mfaType: MfaType, onSwitchView: (view: View) => void) {
  const { locale } = useI18n()
  const authStore = useAuthStore()
  const { getSubmitError } = useSubmitError()

  const mfaCode = ref<string[]>(['', '', '', '', '', ''])
  const phoneNumber = ref('')
  const rememberDevice = ref(false)
  const isSubmitting = ref(false)
  const isResending = ref(false)
  const codeSent = ref(mfaType !== 'sms')
  const codeResent = ref(false)

  const codeValue = computed(() => mfaCode.value.join(''))
  const isCodeComplete = computed(() => codeValue.value.length === 6)

  watch(mfaCode, () => {
    authStore.clearSubmitError()
    codeResent.value = false
  }, { deep: true })

  const getEndpoint = () => {
    switch (mfaType) {
      case 'email':
        return IdentityRoute.ProcessEmailMfa
      case 'otp':
        return IdentityRoute.ProcessOtpMfa
      case 'sms':
        return IdentityRoute.ProcessSmsMfa
    }
  }

  const handleSubmit = async (e?: Event) => {
    e?.preventDefault()

    if (!isCodeComplete.value) {
      return
    }

    isSubmitting.value = true
    authStore.clearSubmitError()

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
      }>(getEndpoint(), {
        method: 'POST',
        body: JSON.stringify({
          ...baseValues,
          mfaCode: codeValue.value,
          rememberDevice: rememberDevice.value,
        }),
      })

      handleAuthorizeStep(response, locale.value as Locale, onSwitchView)
    } catch (error) {
      const errorMessage = getSubmitError(error as Error)
      authStore.setSubmitError(errorMessage)
    } finally {
      isSubmitting.value = false
    }
  }

  const resendCode = async () => {
    isResending.value = true
    authStore.clearSubmitError()

    try {
      let baseValues: Record<string, string | undefined>
      if (authStore.followUpParams) {
        baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)
      } else {
        throw new Error('No follow-up params available')
      }

      const endpoint = mfaType === 'email'
        ? IdentityRoute.SendEmailMfa
        : IdentityRoute.ResendSmsMfa

      await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(baseValues),
      })

      codeResent.value = true
    } catch (error) {
      const errorMessage = getSubmitError(error as Error)
      authStore.setSubmitError(errorMessage)
    } finally {
      isResending.value = false
    }
  }

  const sendSmsCode = async () => {
    isSubmitting.value = true
    authStore.clearSubmitError()

    try {
      let baseValues: Record<string, string | undefined>
      if (authStore.followUpParams) {
        baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)
      } else {
        throw new Error('No follow-up params available')
      }

      await apiRequest(IdentityRoute.SetupSmsMfa, {
        method: 'POST',
        body: JSON.stringify({
          ...baseValues,
          phoneNumber: phoneNumber.value,
        }),
      })

      codeSent.value = true
    } catch (error) {
      const errorMessage = getSubmitError(error as Error)
      authStore.setSubmitError(errorMessage)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    mfaCode,
    phoneNumber,
    rememberDevice,
    isSubmitting,
    isResending,
    codeSent,
    codeResent,
    isCodeComplete,
    handleSubmit,
    resendCode,
    sendSmsCode,
  }
}
