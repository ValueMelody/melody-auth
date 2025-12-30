import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { object } from 'yup'
import { useAuthStore } from '@/stores/auth'
import { apiRequest, parseAuthorizeFollowUpValues, handleAuthorizeStep } from '@/api/auth'
import { IdentityRoute, type Locale, type View } from '@/api/types'
import { useFormValidation } from './form'
import { useSubmitError } from './useSubmitError'

export function useChangePasswordForm(onSwitchView: (view: View) => void) {
  const { locale } = useI18n()
  const authStore = useAuthStore()
  const { passwordField, confirmPasswordField, validate } = useFormValidation()
  const { getSubmitError } = useSubmitError()

  const password = ref('')
  const confirmPassword = ref('')
  const touched = ref({ password: false, confirmPassword: false })
  const isSubmitting = ref(false)
  const isSuccess = ref(false)

  const values = computed(() => ({
    password: password.value,
    confirmPassword: confirmPassword.value,
  }))

  const schema = computed(() =>
    object({
      password: passwordField(),
      confirmPassword: confirmPasswordField(),
    })
  )

  const rawErrors = computed(() => validate(schema.value, values.value))

  const errors = computed(() => ({
    password: touched.value.password ? rawErrors.value.password : undefined,
    confirmPassword: touched.value.confirmPassword ? rawErrors.value.confirmPassword : undefined,
  }))

  watch(password, () => {
    authStore.clearSubmitError()
    touched.value.password = true
    isSuccess.value = false
  })

  watch(confirmPassword, () => {
    authStore.clearSubmitError()
    touched.value.confirmPassword = true
    isSuccess.value = false
  })

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    touched.value = { password: true, confirmPassword: true }

    if (rawErrors.value.password || rawErrors.value.confirmPassword) {
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
      }>(IdentityRoute.ChangePassword, {
        method: 'POST',
        body: JSON.stringify({
          ...baseValues,
          password: password.value,
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
    password,
    confirmPassword,
    values,
    errors,
    isSubmitting,
    isSuccess,
    handleSubmit,
    handleRedirectBack,
  }
}
