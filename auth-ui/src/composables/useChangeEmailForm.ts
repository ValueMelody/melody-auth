import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { object } from 'yup'
import { useAuthStore } from '@/stores/auth'
import { apiRequest, parseAuthorizeFollowUpValues, handleAuthorizeStep } from '@/api/auth'
import { IdentityRoute, type Locale, type View } from '@/api/types'
import { useFormValidation } from './form'
import { useSubmitError } from './useSubmitError'

export function useChangeEmailForm(onSwitchView: (view: View) => void) {
  const { locale } = useI18n()
  const authStore = useAuthStore()
  const { emailField, validate } = useFormValidation()
  const { getSubmitError } = useSubmitError()

  const email = ref('')
  const mfaCode = ref<string[]>(['', '', '', '', '', ''])
  const touched = ref({ email: false })
  const isSubmitting = ref(false)
  const isResending = ref(false)
  const codeSent = ref(false)
  const codeResent = ref(false)
  const isSuccess = ref(false)

  const codeValue = computed(() => mfaCode.value.join(''))
  const isCodeComplete = computed(() => codeValue.value.length === 6)

  const values = computed(() => ({
    email: email.value,
  }))

  const schema = computed(() =>
    object({
      email: emailField(),
    })
  )

  const rawErrors = computed(() => validate(schema.value, values.value))

  const errors = computed(() => ({
    email: touched.value.email ? rawErrors.value.email : undefined,
  }))

  watch(email, () => {
    authStore.clearSubmitError()
    touched.value.email = true
    codeSent.value = false
    isSuccess.value = false
  })

  watch(mfaCode, () => {
    authStore.clearSubmitError()
    codeResent.value = false
  }, { deep: true })

  const sendCode = async (e?: Event) => {
    e?.preventDefault()
    touched.value.email = true

    if (rawErrors.value.email) {
      return
    }

    isSubmitting.value = true
    authStore.clearSubmitError()

    try {
      if (!authStore.followUpParams) {
        throw new Error('No follow-up params available')
      }

      const baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)

      await apiRequest(IdentityRoute.ChangeEmailCode, {
        method: 'POST',
        body: JSON.stringify({
          ...baseValues,
          email: email.value,
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

  const resendCode = async () => {
    isResending.value = true
    authStore.clearSubmitError()

    try {
      if (!authStore.followUpParams) {
        throw new Error('No follow-up params available')
      }

      const baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)

      await apiRequest(IdentityRoute.ChangeEmailCode, {
        method: 'POST',
        body: JSON.stringify({
          ...baseValues,
          email: email.value,
        }),
      })

      codeResent.value = true
    } catch (error) {
      const errorMessage = getSubmitError(error as Error)
      authStore.setSubmitError(errorMessage)
    } finally {
      isResending.value = false
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
      }>(IdentityRoute.ChangeEmail, {
        method: 'POST',
        body: JSON.stringify({
          ...baseValues,
          email: email.value,
          mfaCode: codeValue.value,
        }),
      })

      if (response.nextPage) {
        handleAuthorizeStep(response, locale.value as Locale, onSwitchView)
      } else {
        isSuccess.value = true
      }
    } catch (error) {
      const errorMessage = getSubmitError(error as Error)
      authStore.setSubmitError(errorMessage)
    } finally {
      isSubmitting.value = false
    }
  }

  const handleRedirectBack = () => {
    if (!authStore.followUpParams) return

    const baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)
    const redirectUri = authStore.authorizeParams?.redirectUri || ''

    if (redirectUri) {
      const queryString = `?state=${authStore.authorizeParams?.state || ''}&code=${baseValues.code}&locale=${locale.value}&org=${baseValues.org || ''}`
      window.location.href = `${redirectUri}${queryString}`
    }
  }

  return {
    email,
    mfaCode,
    errors,
    isSubmitting,
    isResending,
    codeSent,
    codeResent,
    isSuccess,
    isCodeComplete,
    sendCode,
    resendCode,
    handleSubmit,
    handleRedirectBack,
  }
}
