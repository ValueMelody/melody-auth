import {
  useState, useMemo,
} from 'hono/jsx'
import { object } from 'yup'
import {
  routeConfig, typeConfig,
} from 'configs'
import { getFollowUpParams } from 'pages/tools/param'
import {
  parseAuthorizeFollowUpValues, parseResponse,
} from 'pages/tools/request'
import {
  passwordField, confirmPasswordField, validate,
} from 'pages/tools/form'

export interface UseChangePasswordFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
}

const useChangePasswordForm = ({
  locale,
  onSubmitError,
}: UseChangePasswordFormProps) => {
  const followUpParams = useMemo(
    () => getFollowUpParams(),
    [],
  )

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  })
  const [success, setSuccess] = useState(false)

  const values = useMemo(
    () => ({
      password,
      confirmPassword,
    }),
    [password, confirmPassword],
  )

  const updateInfoSchema = object({
    password: passwordField(locale),
    confirmPassword: confirmPasswordField(locale),
  })

  const errors = validate(
    updateInfoSchema,
    values,
  )

  const handleChange = (
    name: 'password' | 'confirmPassword',
    value: string,
  ) => {
    onSubmitError(null)
    setSuccess(false)
    switch (name) {
    case 'password':
      setPassword(value)
      break
    case 'confirmPassword':
      setConfirmPassword(value)
      break
    }
  }

  const handleSubmit = (e: Event) => {
    e.preventDefault()

    setTouched({
      password: true,
      confirmPassword: true,
    })

    if (Object.values(errors).some((error) => error !== undefined)) {
      return
    }

    fetch(
      routeConfig.IdentityRoute.ChangePassword,
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...parseAuthorizeFollowUpValues(
            followUpParams,
            locale,
          ),
          password,
        }),
      },
    )
      .then(parseResponse)
      .then(() => {
        setSuccess(true)
        setPassword('')
        setConfirmPassword('')
        setTouched({
          password: false,
          confirmPassword: false,
        })
      })
      .catch((error) => {
        onSubmitError(error)
      })
  }

  return {
    values,
    errors: {
      password: touched.password ? errors.password : undefined,
      confirmPassword: touched.confirmPassword ? errors.confirmPassword : undefined,
    },
    handleChange,
    handleSubmit,
    success,
    redirectUri: followUpParams.redirectUri,
  }
}

export default useChangePasswordForm
