import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { object } from 'yup'
import { useAuthStore } from '@/stores/auth'
import { apiRequest, parseAuthorizeBaseValues } from '@/api/auth'
import { IdentityRoute, type Locale, View } from '@/api/types'
import { useFormValidation } from './form'
import { useSubmitError } from './useSubmitError'

export type ResetPasswordStep = 'email' | 'code' | 'password'

export function useResetPasswordForm(onSwitchView: (view: View) => void) {
  const { locale } = useI18n()
  const authStore = useAuthStore()
  const { emailField, passwordField, confirmPasswordField, validate } = useFormValidation()
  const { getSubmitError } = useSubmitError()

  const step = ref<ResetPasswordStep>('email')
  const email = ref('')
  const mfaCode = ref<string[]>(['', '', '', '', '', ''])
  const password = ref('')
  const confirmPassword = ref('')
  const touched = ref<Record<string, boolean>>({})
  const isSubmitting = ref(false)
  const isResending = ref(false)
  const codeResent = ref(false)
  const isSuccess = ref(false)

  const codeValue = computed(() => mfaCode.value.join(''))
  const isCodeComplete = computed(() => codeValue.value.length === 6)

  const emailSchema = computed(() =>
    object({
      email: emailField(),
    })
  )

  const passwordSchema = computed(() =>
    object({
      password: passwordField(),
      confirmPassword: confirmPasswordField(),
    })
  )

  const emailErrors = computed(() => {
    const result = validate(emailSchema.value, { email: email.value })
    return {
      email: touched.value.email ? result.email : undefined,
    }
  })

  const passwordErrors = computed(() => {
    const result = validate(passwordSchema.value, {
      password: password.value,
      confirmPassword: confirmPassword.value,
    })
    return {
      password: touched.value.password ? result.password : undefined,
      confirmPassword: touched.value.confirmPassword ? result.confirmPassword : undefined,
    }
  })

  watch(email, () => {
    authStore.clearSubmitError()
    touched.value.email = true
  })

  watch(mfaCode, () => {
    authStore.clearSubmitError()
    codeResent.value = false
  }, { deep: true })

  watch(password, () => {
    authStore.clearSubmitError()
    touched.value.password = true
  })

  watch(confirmPassword, () => {
    authStore.clearSubmitError()
    touched.value.confirmPassword = true
  })

  const sendCode = async (e?: Event) => {
    e?.preventDefault()
    touched.value.email = true

    const errors = validate(emailSchema.value, { email: email.value })
    if (errors.email) {
      return
    }

    isSubmitting.value = true
    authStore.clearSubmitError()

    try {
      if (!authStore.authorizeParams) {
        throw new Error('No authorize params available')
      }

      const baseValues = parseAuthorizeBaseValues(authStore.authorizeParams, locale.value as Locale)

      await apiRequest(IdentityRoute.ResetPasswordCode, {
        method: 'POST',
        body: JSON.stringify({
          ...baseValues,
          email: email.value,
        }),
      })

      step.value = 'code'
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
      if (!authStore.authorizeParams) {
        throw new Error('No authorize params available')
      }

      const baseValues = parseAuthorizeBaseValues(authStore.authorizeParams, locale.value as Locale)

      await apiRequest(IdentityRoute.ResetPasswordCode, {
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

  const verifyCode = () => {
    if (!isCodeComplete.value) return
    step.value = 'password'
  }

  const handleSubmit = async (e?: Event) => {
    e?.preventDefault()
    touched.value.password = true
    touched.value.confirmPassword = true

    const errors = validate(passwordSchema.value, {
      password: password.value,
      confirmPassword: confirmPassword.value,
    })

    if (errors.password || errors.confirmPassword) {
      return
    }

    isSubmitting.value = true
    authStore.clearSubmitError()

    try {
      if (!authStore.authorizeParams) {
        throw new Error('No authorize params available')
      }

      const baseValues = parseAuthorizeBaseValues(authStore.authorizeParams, locale.value as Locale)

      await apiRequest(IdentityRoute.ResetPassword, {
        method: 'POST',
        body: JSON.stringify({
          ...baseValues,
          email: email.value,
          code: codeValue.value,
          password: password.value,
        }),
      })

      isSuccess.value = true
    } catch (error) {
      const errorMessage = getSubmitError(error as Error)
      authStore.setSubmitError(errorMessage)
    } finally {
      isSubmitting.value = false
    }
  }

  const goToSignIn = () => {
    onSwitchView(View.SignIn)
  }

  return {
    step,
    email,
    mfaCode,
    password,
    confirmPassword,
    emailErrors,
    passwordErrors,
    isSubmitting,
    isResending,
    codeResent,
    isSuccess,
    isCodeComplete,
    sendCode,
    resendCode,
    verifyCode,
    handleSubmit,
    goToSignIn,
  }
}
