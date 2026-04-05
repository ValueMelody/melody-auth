import {
  useCallback, useEffect, useMemo, useState,
} from 'hono/jsx'
import { object } from 'yup'
import {
  confirmPasswordField, passwordField, validate,
} from 'pages/tools/form'
import {
  routeConfig, typeConfig,
} from 'configs'
import { parseResponse } from 'pages/tools/request'
import { getInvitationParams } from 'pages/tools/param'

export interface UseAcceptInvitationFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
}

const useAcceptInvitationForm = ({
  locale,
  onSubmitError,
}: UseAcceptInvitationFormProps) => {
  const invitationParams = useMemo(
    () => getInvitationParams(),
    [],
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const [signinUrl, setSigninUrl] = useState<string | null>(null)

  useEffect(
    () => {
      const token = invitationParams.invitationToken
      if (!token) {
        setIsTokenValid(false)
        return
      }
      fetch(
        `${routeConfig.IdentityRoute.AcceptInvitation}?invitationToken=${encodeURIComponent(token)}`,
        { method: 'GET' },
      )
        .then(parseResponse)
        .then(() => setIsTokenValid(true))
        .catch(() => setIsTokenValid(false))
    },
    [invitationParams.invitationToken],
  )

  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  })

  const values = useMemo(
    () => ({
      password,
      confirmPassword,
    }),
    [password, confirmPassword],
  )

  const schema = object({
    password: passwordField(locale),
    confirmPassword: confirmPasswordField(locale),
  })

  const errors = validate(
    schema,
    values,
  )

  const handleChange = (
    name: 'password' | 'confirmPassword', value: string,
  ) => {
    onSubmitError(null)
    switch (name) {
    case 'password':
      setPassword(value)
      break
    case 'confirmPassword':
      setConfirmPassword(value)
      break
    }
  }

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault()
      setTouched({
        password: true,
        confirmPassword: true,
      })

      if (Object.values(errors).some((error) => error !== undefined)) {
        return
      }

      setIsSubmitting(true)

      fetch(
        routeConfig.IdentityRoute.AcceptInvitation,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: invitationParams.invitationToken,
            password,
          }),
        },
      )
        .then(parseResponse)
        .then(() => {
          setSuccess(true)
          if (invitationParams.signinUrl) setSigninUrl(invitationParams.signinUrl)
        })
        .catch((error) => {
          onSubmitError(error)
        })
        .finally(() => {
          setIsSubmitting(false)
        })
    },
    [password, invitationParams.invitationToken, invitationParams.signinUrl, onSubmitError, errors],
  )

  return {
    values,
    errors: {
      password: touched.password ? errors.password : undefined,
      confirmPassword: touched.confirmPassword ? errors.confirmPassword : undefined,
    },
    handleChange,
    handleSubmit,
    success,
    isSubmitting,
    isTokenValid,
    signinUrl,
  }
}

export default useAcceptInvitationForm
