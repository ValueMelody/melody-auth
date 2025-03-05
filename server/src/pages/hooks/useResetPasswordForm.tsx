import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import {
  object, array, string,
} from 'yup'
import {
  codeField, confirmPasswordField, emailField, passwordField, validate,
} from 'pages/tools/form'
import {
  routeConfig, typeConfig,
} from 'configs'
import { parseResponse } from 'pages/tools/request'

export interface UseResetPasswordFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
}

const useResetPasswordForm = ({
  locale,
  onSubmitError,
}: UseResetPasswordFormProps) => {
  const [email, setEmail] = useState('')
  const [mfaCode, setMfaCode] = useState<string[] | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resent, setResent] = useState(false)
  const [success, setSuccess] = useState(false)

  const [touched, setTouched] = useState({
    email: false,
    mfaCode: false,
    password: false,
    confirmPassword: false,
  })

  const values = useMemo(
    () => ({
      email,
      mfaCode,
      password,
      confirmPassword,
    }),
    [email, mfaCode, password, confirmPassword],
  )

  const resetPasswordSchema = object({
    email: emailField(locale),
    mfaCode: mfaCode !== null
      ? codeField(locale)
      : array().nullable(),
    password: mfaCode !== null ? passwordField(locale) : string(),
    confirmPassword: mfaCode !== null
      ? confirmPasswordField(locale)
      : string(),
  })

  const errors = validate(
    resetPasswordSchema,
    values,
  )

  const handleChange = (
    name: 'email' | 'mfaCode' | 'password' | 'confirmPassword', value: string | string[],
  ) => {
    onSubmitError(null)
    switch (name) {
    case 'email':
      setEmail(value as string)
      break
    case 'mfaCode':
      setMfaCode(value as string[])
      break
    case 'password':
      setPassword(value as string)
      break
    case 'confirmPassword':
      setConfirmPassword(value as string)
      break
    }
  }

  const handleResend = useCallback(
    () => {
      fetch(
        routeConfig.IdentityRoute.ResetPasswordCode,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            locale,
            email,
          }),
        },
      )
        .then(parseResponse)
        .then(() => {
          setResent(true)
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [email, locale, onSubmitError],
  )

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault()
      setTouched({
        email: true,
        mfaCode: mfaCode !== null,
        password: mfaCode !== null,
        confirmPassword: mfaCode !== null,
      })

      if (Object.values(errors).some((error) => error !== undefined)) {
        return
      }

      if (mfaCode === null) {
        fetch(
          routeConfig.IdentityRoute.ResetPasswordCode,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              locale,
              email,
            }),
          },
        )
          .then(parseResponse)
          .then(() => {
            setMfaCode(new Array(6).fill(''))
          })
          .catch((error) => {
            onSubmitError(error)
          })
      } else {
        fetch(
          routeConfig.IdentityRoute.ResetPassword,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              code: mfaCode.join(''),
              password,
            }),
          },
        )
          .then(parseResponse)
          .then(() => {
            setSuccess(true)
          })
          .catch((error) => {
            onSubmitError(error)
          })
      }
    },
    [errors, email, mfaCode, locale, onSubmitError, password],
  )

  return {
    values,
    errors: {
      email: touched.email ? errors.email : '',
      mfaCode: touched.mfaCode ? errors.mfaCode : '',
      password: touched.password ? errors.password : '',
      confirmPassword: touched.confirmPassword ? errors.confirmPassword : '',
    },
    handleChange,
    handleSubmit,
    handleResend,
    resent,
    success,
  }
}

export default useResetPasswordForm
