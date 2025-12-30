import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { object, string } from 'yup'
import { useAuthStore } from '@/stores/auth'
import { apiRequest, parseAuthorizeBaseValues, handleAuthorizeStep } from '@/api/auth'
import { IdentityRoute, type Locale, type View, type UserAttribute } from '@/api/types'
import { useFormValidation } from './form'
import { useSubmitError } from './useSubmitError'

export function useSignUpForm(onSwitchView: (view: View) => void) {
  const { locale } = useI18n()
  const authStore = useAuthStore()
  const { emailField, passwordField, confirmPasswordField, requiredField, validate, getMessages } = useFormValidation()
  const { getSubmitError } = useSubmitError()

  const email = ref('')
  const password = ref('')
  const confirmPassword = ref('')
  const firstName = ref('')
  const lastName = ref('')
  const customAttributes = ref<Record<string, string>>({})
  const touched = ref<Record<string, boolean>>({})
  const isSubmitting = ref(false)

  const userAttributes = computed(() => authStore.initialProps?.userAttributes || [])

  const values = computed(() => ({
    email: email.value,
    password: password.value,
    confirmPassword: confirmPassword.value,
    firstName: firstName.value,
    lastName: lastName.value,
    ...customAttributes.value,
  }))

  const schema = computed(() => {
    const messages = getMessages()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schemaObj: Record<string, any> = {
      email: emailField(),
      password: passwordField(),
      confirmPassword: confirmPasswordField(),
    }

    if (authStore.initialProps?.enableNames) {
      schemaObj.firstName = string().required(messages.firstNameIsEmpty)
      schemaObj.lastName = string().required(messages.lastNameIsEmpty)
    }

    userAttributes.value.forEach((attr: UserAttribute) => {
      if (attr.requiredInSignUp) {
        schemaObj[attr.name] = requiredField()
      }
    })

    return object(schemaObj)
  })

  const rawErrors = computed(() => validate(schema.value, values.value))

  const errors = computed(() => {
    const result: Record<string, string | undefined> = {}
    Object.keys(values.value).forEach((key) => {
      result[key] = touched.value[key] ? rawErrors.value[key as keyof typeof rawErrors.value] : undefined
    })
    return result
  })

  const setTouched = (field: string) => {
    touched.value = { ...touched.value, [field]: true }
    authStore.clearSubmitError()
  }

  watch(email, () => setTouched('email'))
  watch(password, () => setTouched('password'))
  watch(confirmPassword, () => setTouched('confirmPassword'))
  watch(firstName, () => setTouched('firstName'))
  watch(lastName, () => setTouched('lastName'))
  watch(customAttributes, () => authStore.clearSubmitError(), { deep: true })

  const handleSubmit = async (e: Event) => {
    e.preventDefault()

    const allFields = Object.keys(values.value)
    allFields.forEach((field) => {
      touched.value[field] = true
    })

    const hasErrors = Object.values(rawErrors.value).some((error) => error !== undefined)
    if (hasErrors) {
      return
    }

    isSubmitting.value = true
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
      }>(IdentityRoute.AuthorizeAccount, {
        method: 'POST',
        body: JSON.stringify({
          ...baseValues,
          email: email.value,
          password: password.value,
          firstName: firstName.value || undefined,
          lastName: lastName.value || undefined,
          ...customAttributes.value,
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
    password,
    confirmPassword,
    firstName,
    lastName,
    customAttributes,
    userAttributes,
    values,
    errors,
    isSubmitting,
    handleSubmit,
    setTouched,
  }
}
