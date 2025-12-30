import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { object } from 'yup'
import { useAuthStore } from '@/stores/auth'
import { apiRequest, parseAuthorizeBaseValues, parseAuthorizeFollowUpValues, handleAuthorizeStep } from '@/api/auth'
import { IdentityRoute, type Locale, type View } from '@/api/types'
import { useFormValidation } from './form'
import { useSubmitError } from './useSubmitError'

export function useSignInForm(onSwitchView: (view: View) => void) {
  const { locale } = useI18n()
  const authStore = useAuthStore()
  const { emailField, passwordField, validate } = useFormValidation()
  const { getSubmitError } = useSubmitError()

  const email = ref('')
  const password = ref('')
  const touched = ref({ email: false, password: false })
  const isSubmitting = ref(false)
  const isPasswordlessSigningIn = ref(false)

  const values = computed(() => ({
    email: email.value,
    password: password.value,
  }))

  const schema = computed(() =>
    object({
      email: emailField(),
      password: passwordField(),
    })
  )

  const rawErrors = computed(() => validate(schema.value, values.value))

  const errors = computed(() => ({
    email: touched.value.email ? rawErrors.value.email : undefined,
    password: touched.value.password ? rawErrors.value.password : undefined,
  }))

  watch(email, () => {
    authStore.clearSubmitError()
    touched.value.email = true
  })

  watch(password, () => {
    authStore.clearSubmitError()
    touched.value.password = true
  })

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    touched.value = { email: true, password: true }

    if (rawErrors.value.email || rawErrors.value.password) {
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
      }>(IdentityRoute.AuthorizePassword, {
        method: 'POST',
        body: JSON.stringify({
          ...baseValues,
          email: email.value,
          password: password.value,
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

  const handlePasswordlessSignIn = async (e: Event) => {
    e.preventDefault()
    touched.value.email = true

    if (rawErrors.value.email) {
      return
    }

    isPasswordlessSigningIn.value = true
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
      }>(IdentityRoute.AuthorizePasswordless, {
        method: 'POST',
        body: JSON.stringify({
          ...baseValues,
          email: email.value,
        }),
      })

      handleAuthorizeStep(response, locale.value as Locale, onSwitchView)
    } catch (error) {
      const errorMessage = getSubmitError(error as Error)
      authStore.setSubmitError(errorMessage)
    } finally {
      isPasswordlessSigningIn.value = false
    }
  }

  return {
    email,
    password,
    values,
    errors,
    isSubmitting,
    isPasswordlessSigningIn,
    handleSubmit,
    handlePasswordlessSignIn,
  }
}
