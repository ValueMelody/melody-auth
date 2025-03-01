import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import { object } from 'yup'
import {
  routeConfig, typeConfig,
} from 'configs'
import {
  validate, emailField, passwordField,
} from 'pages/tools/form'
import { View } from 'pages/hooks'
import {
  handleAuthorizeStep, parseAuthorizeBaseValues,
} from 'pages/tools/request'
import { AuthorizeParams } from 'pages/tools/param'

export interface UseSignInFormProps {
  locale: typeConfig.Locale;
  params: AuthorizeParams;
  onSubmitError: (error: string | null) => void;
  onSwitchView: (view: View) => void;
}

const useSignInForm = ({
  locale,
  params,
  onSubmitError,
  onSwitchView,
}: UseSignInFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  })

  const values = useMemo(
    () => ({
      email,
      password,
    }),
    [email, password],
  )

  const signInSchema = object({
    email: emailField(locale),
    password: passwordField(locale),
  })

  const errors = validate(
    signInSchema,
    values,
  )

  const handleChange = (
    name: 'email' | 'password', value: string,
  ) => {
    onSubmitError(null)
    switch (name) {
    case 'email':
      setEmail(value)
      break
    case 'password':
      setPassword(value)
      break
    }
  }

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault()
      setTouched({
        email: true,
        password: true,
      })

      if (Object.values(errors).some((error) => error !== undefined)) {
        return
      }

      fetch(
        routeConfig.IdentityRoute.AuthorizePassword,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            ...parseAuthorizeBaseValues(
              params,
              locale,
            ),
          }),
        },
      )
        .then((response) => {
          if (!response.ok) {
            return response.text().then((text) => {
              throw new Error(text)
            })
          }
          return response.json()
        })
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
    },
    [params, locale, onSubmitError, onSwitchView, email, password, errors],
  )

  return {
    values,
    errors: {
      email: touched.email ? errors.email : undefined,
      password: touched.password ? errors.password : undefined,
    },
    handleChange,
    handleSubmit,
  }
}

export default useSignInForm
