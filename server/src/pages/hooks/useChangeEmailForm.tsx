import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import {
  array, object,
} from 'yup'
import {
  codeField, emailField, validate,
} from 'pages/tools/form'
import {
  routeConfig, typeConfig,
} from 'configs'
import { getFollowUpParams } from 'pages/tools/param'
import {
  parseAuthorizeFollowUpValues, parseResponse,
} from 'pages/tools/request'

export interface UseChangeEmailFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
}

const useChangeEmailForm = ({
  locale,
  onSubmitError,
}: UseChangeEmailFormProps) => {
  const followUpParams = useMemo(
    () => getFollowUpParams(),
    [],
  )

  const [isResending, setIsResending] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [email, setEmail] = useState('')
  const [mfaCode, setMfaCode] = useState<string[] | null>(null)
  const [success, setSuccess] = useState(false)
  const [resent, setResent] = useState(false)
  const [touched, setTouched] = useState({
    email: false,
    mfaCode: false,
  })

  const values = useMemo(
    () => ({
      email,
      mfaCode,
    }),
    [email, mfaCode],
  )

  const changeEmailSchema = object({
    email: emailField(locale),
    mfaCode: mfaCode !== null
      ? codeField(locale)
      : array().nullable(),
  })

  const errors = validate(
    changeEmailSchema,
    values,
  )

  const handleChange = (
    name: 'email' | 'mfaCode', value: string | string[],
  ) => {
    onSubmitError(null)
    switch (name) {
    case 'email':
      setEmail(value as string)
      break
    case 'mfaCode':
      setMfaCode(value as string[])
      break
    }
  }

  const sendCode = useCallback(
    () => {
      return fetch(
        routeConfig.IdentityRoute.ChangeEmailCode,
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
            email,
          }),
        },
      )
    },
    [email, followUpParams, locale],
  )

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault()
      setTouched({
        email: true,
        mfaCode: mfaCode !== null,
      })

      if (Object.values(errors).some((error) => error !== undefined)) {
        return
      }

      setIsSubmitting(true)

      if (mfaCode === null) {
        sendCode()
          .then(parseResponse)
          .then(() => {
            setMfaCode(new Array(6).fill(''))
          })
          .catch((error) => {
            onSubmitError(error)
          })
          .finally(() => {
            setIsSubmitting(false)
          })
      } else {
        fetch(
          routeConfig.IdentityRoute.ChangeEmail,
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
              email,
              verificationCode: mfaCode.join(''),
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
          .finally(() => {
            setIsSubmitting(false)
          })
      }
    },
    [onSubmitError, sendCode, mfaCode, errors, email, followUpParams, locale],
  )

  const handleResend = useCallback(
    () => {
      setIsResending(true)
      sendCode()
        .then(parseResponse)
        .then(() => {
          setResent(true)
          setMfaCode(new Array(6).fill(''))
        })
        .catch((error) => {
          onSubmitError(error)
        })
        .finally(() => {
          setIsResending(false)
        })
    },
    [onSubmitError, sendCode],
  )

  return {
    values,
    errors: {
      email: touched.email ? errors.email : '',
      mfaCode: touched.mfaCode ? errors.mfaCode : '',
    },
    handleChange,
    handleSubmit,
    isSubmitting,
    success,
    resent,
    handleResend,
    isResending,
    redirectUri: followUpParams.redirectUri,
  }
}

export default useChangeEmailForm
