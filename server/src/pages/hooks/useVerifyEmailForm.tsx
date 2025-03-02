import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import { object } from 'yup'
import {
  codeField, validate,
} from 'pages/tools/form'
import {
  routeConfig, typeConfig,
} from 'configs'
import { parseResponse } from 'pages/tools/request'
import { getVerifyEmailParams } from 'pages/tools/param'

export interface UseVerifyEmailFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
}

const useVerifyEmailForm = ({
  locale,
  onSubmitError,
}: UseVerifyEmailFormProps) => {
  const verifyEmailParams = useMemo(
    () => getVerifyEmailParams(),
    [],
  )

  const [mfaCode, setMfaCode] = useState<string[]>([])
  const [success, setSuccess] = useState(false)

  const [touched, setTouched] = useState({ mfaCode: false })

  const values = useMemo(
    () => ({ mfaCode }),
    [mfaCode],
  )

  const verifyEmailSchema = object({ mfaCode: codeField(locale) })

  const errors = validate(
    verifyEmailSchema,
    values,
  )

  const handleChange = (
    name: 'mfaCode', value: string[],
  ) => {
    onSubmitError(null)
    switch (name) {
    case 'mfaCode':
      setMfaCode(value)
      break
    }
  }

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault()
      setTouched({ mfaCode: true })

      if (Object.values(errors).some((error) => error !== undefined)) {
        return
      }

      fetch(
        routeConfig.IdentityRoute.VerifyEmail,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: mfaCode.join(''),
            id: verifyEmailParams.id,
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
    },
    [mfaCode, verifyEmailParams.id, onSubmitError, errors],
  )

  return {
    values,
    errors: { mfaCode: touched.mfaCode ? errors.mfaCode : '' },
    handleChange,
    handleSubmit,
    success,
  }
}

export default useVerifyEmailForm
