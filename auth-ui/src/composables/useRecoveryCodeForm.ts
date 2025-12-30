import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { object, string } from 'yup'
import { useAuthStore } from '@/stores/auth'
import { apiRequest, parseAuthorizeBaseValues, parseAuthorizeFollowUpValues, handleAuthorizeStep } from '@/api/auth'
import { IdentityRoute, type Locale, type View } from '@/api/types'
import { useFormValidation } from './form'
import { useSubmitError } from './useSubmitError'

export function useRecoveryCodeSignInForm(onSwitchView: (view: View) => void) {
  const { locale } = useI18n()
  const authStore = useAuthStore()
  const { emailField, validate, getMessages } = useFormValidation()
  const { getSubmitError } = useSubmitError()

  const email = ref('')
  const recoveryCode = ref('')
  const touched = ref({ email: false, recoveryCode: false })
  const isSubmitting = ref(false)

  const values = computed(() => ({
    email: email.value,
    recoveryCode: recoveryCode.value,
  }))

  const schema = computed(() => {
    const messages = getMessages()
    return object({
      email: emailField(),
      recoveryCode: string().required(messages.fieldIsRequired),
    })
  })

  const rawErrors = computed(() => validate(schema.value, values.value))

  const errors = computed(() => ({
    email: touched.value.email ? rawErrors.value.email : undefined,
    recoveryCode: touched.value.recoveryCode ? rawErrors.value.recoveryCode : undefined,
  }))

  watch(email, () => {
    authStore.clearSubmitError()
    touched.value.email = true
  })

  watch(recoveryCode, () => {
    authStore.clearSubmitError()
    touched.value.recoveryCode = true
  })

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    touched.value = { email: true, recoveryCode: true }

    if (rawErrors.value.email || rawErrors.value.recoveryCode) {
      return
    }

    isSubmitting.value = true
    authStore.clearSubmitError()

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
        nextPage?: View
        code?: string
        state?: string
        redirectUri?: string
        org?: string
      }>(IdentityRoute.AuthorizeRecoveryCode, {
        method: 'POST',
        body: JSON.stringify({
          ...baseValues,
          email: email.value,
          recoveryCode: recoveryCode.value,
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

  return {
    email,
    recoveryCode,
    values,
    errors,
    isSubmitting,
    handleSubmit,
  }
}

export function useRecoveryCodeEnrollForm(onSwitchView: (view: View) => void) {
  const { locale } = useI18n()
  const authStore = useAuthStore()
  const { getSubmitError } = useSubmitError()

  const recoveryCode = ref<string | null>(null)
  const isLoading = ref(true)
  const isSubmitting = ref(false)

  const fetchRecoveryCode = async () => {
    isLoading.value = true

    try {
      if (!authStore.followUpParams) {
        throw new Error('No follow-up params available')
      }

      const baseValues = parseAuthorizeFollowUpValues(authStore.followUpParams, locale.value as Locale)

      const response = await apiRequest<{ recoveryCode: string }>(IdentityRoute.ProcessRecoveryCodeEnroll, {
        method: 'GET',
        headers: {
          'x-code': baseValues.code || '',
          'x-locale': locale.value,
          'x-org': baseValues.org || '',
        },
      })

      recoveryCode.value = response.recoveryCode
    } catch (error) {
      const errorMessage = getSubmitError(error as Error)
      authStore.setSubmitError(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  const handleContinue = async () => {
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
      }>(IdentityRoute.ProcessRecoveryCodeEnroll, {
        method: 'POST',
        body: JSON.stringify(baseValues),
      })

      handleAuthorizeStep(response, locale.value as Locale, onSwitchView)
    } catch (error) {
      const errorMessage = getSubmitError(error as Error)
      authStore.setSubmitError(errorMessage)
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    recoveryCode,
    isLoading,
    isSubmitting,
    fetchRecoveryCode,
    handleContinue,
  }
}
