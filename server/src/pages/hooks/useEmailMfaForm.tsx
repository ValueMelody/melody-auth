import { object } from 'yup'
import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import { View } from './useCurrentView'
import {
  codeField, validate,
} from 'pages/tools/form'
import { getFollowUpParams } from 'pages/tools/param'
import {
  routeConfig, typeConfig,
} from 'configs'
import {
  handleAuthorizeStep, parseAuthorizeFollowUpValues,
  parseResponse,
} from 'pages/tools/request'

export interface UseEmailMfaFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
  onSwitchView: (view: View) => void;
}

const useEmailMfaForm = ({
  locale,
  onSubmitError,
  onSwitchView,
}: UseEmailMfaFormProps) => {
  const followUpParams = useMemo(
    () => getFollowUpParams(),
    [],
  )

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const [resent, setResent] = useState(false)
  const [mfaCode, setMfaCode] = useState<string[]>(new Array(6).fill(''))
  const [touched, setTouched] = useState({ mfaCode: false })

  const values = { mfaCode }

  const otpMfaSchema = object({ mfaCode: codeField(locale) })

  const errors = validate(
    otpMfaSchema,
    values,
  )

  const handleChange = (
    name: 'mfaCode', value: string[],
  ) => {
    onSubmitError(null)
    setMfaCode(value)
  }

  const sendEmailMfa = useCallback(
    (isResend: boolean = false) => {
      setIsSending(true)

      fetch(
        routeConfig.IdentityRoute.SendEmailMfa,
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
          }),
        },
      )
        .then(parseResponse)
        .then(() => {
          if (isResend) setResent(true)
        })
        .catch((error) => {
          onSubmitError(error)
        })
        .finally(() => {
          setIsSending(false)
        })
    },
    [onSubmitError, followUpParams, locale],
  )

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault()
      setTouched({ mfaCode: true })

      if (Object.values(errors).some((error) => error !== undefined)) {
        return
      }

      setIsSubmitting(true)

      fetch(
        routeConfig.IdentityRoute.ProcessEmailMfa,
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
            mfaCode: mfaCode.join(''),
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
    [errors, setTouched, followUpParams, mfaCode, onSwitchView, locale, onSubmitError],
  )

  return {
    values,
    resent,
    errors: { mfaCode: touched.mfaCode ? errors.mfaCode : undefined },
    handleChange,
    sendEmailMfa,
    handleSubmit,
    isSubmitting,
    isSending,
  }
}

export default useEmailMfaForm
