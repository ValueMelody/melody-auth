import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import {
  object, string,
} from 'yup'
import {
  routeConfig, typeConfig,
} from 'configs'
import {
  validate, emailField,
} from 'pages/tools/form'
import { View } from 'pages/hooks'
import {
  handleAuthorizeStep,
  parseAuthorizeBaseValues,
  parseResponse,
} from 'pages/tools/request'
import { validateError } from 'pages/tools/locale'
import { AuthorizeParams } from 'pages/tools/param'

export interface UseRecoveryCodeFormProps {
  locale: typeConfig.Locale;
  params: AuthorizeParams;
  onSubmitError: (error: string | null) => void;
  onSwitchView: (view: View) => void;
}

const useRecoveryCodeForm = ({
  locale,
  params,
  onSubmitError,
  onSwitchView,
}: UseRecoveryCodeFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [email, setEmail] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')

  const [touched, setTouched] = useState({
    email: false,
    recoveryCode: false,
  })

  const values = useMemo(
    () => ({
      email, recoveryCode,
    }),
    [email, recoveryCode],
  )

  const recoveryCodeSchema = object({
    email: emailField(locale),
    recoveryCode: string().required(validateError.fieldIsRequired[locale]),
  })

  const errors = validate(
    recoveryCodeSchema,
    values,
  )

  const handleChange = (
    name: 'email' | 'recoveryCode',
    value: string,
  ) => {
    onSubmitError(null)
    switch (name) {
    case 'email':
      setEmail(value as string)
      break
    case 'recoveryCode':
      setRecoveryCode(value as string)
      break
    }
  }

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault()
      setTouched((prev) => ({
        ...prev,
        email: true,
        recoveryCode: true,
      }))

      if (Object.values(errors).some((error) => error !== undefined)) {
        return
      }

      setIsSubmitting(true)

      fetch(
        routeConfig.IdentityRoute.AuthorizeRecoveryCode,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            recoveryCode,
            ...parseAuthorizeBaseValues(
              params,
              locale,
            ),
          }),
        },
      )
        .then(parseResponse)
        .then((response) => {
          handleAuthorizeStep(
            response,
            locale,
            onSwitchView,
          )
        })
        .catch((error) => {
          onSubmitError(error)
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [
      locale,
      params,
      onSubmitError,
      onSwitchView,
      email,
      recoveryCode,
      errors,
    ],
  )

  return {
    values,
    errors: {
      email: touched.email ? errors.email : undefined,
      recoveryCode: touched.recoveryCode ? errors.recoveryCode : undefined,
    },
    handleChange,
    handleSubmit,
    isSubmitting,
  }
}

export default useRecoveryCodeForm
