import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import { object } from 'yup'
import { View } from './useCurrentView'
import {
  routeConfig, typeConfig,
} from 'configs'
import { getFollowUpParams } from 'pages/tools/param'
import {
  handleAuthorizeStep, parseAuthorizeFollowUpValues,
  parseResponse,
} from 'pages/tools/request'
import {
  GetProcessOtpMfaRes, GetOtpMfaSetupRes,
} from 'handlers/identity/mfa'
import {
  codeField, validate,
} from 'pages/tools/form'

export interface UseOtpMfaFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
  onSwitchView: (view: View) => void;
}

const useOtpMfaForm = ({
  locale,
  onSubmitError,
  onSwitchView,
}: UseOtpMfaFormProps) => {
  const followUpParams = useMemo(
    () => getFollowUpParams(),
    [],
  )
  const qs = `?code=${followUpParams.code}&locale=${locale}&org=${followUpParams.org}`

  const [isVerifyingMfa, setIsVerifyingMfa] = useState(false)

  const [otpUri, setOtpUri] = useState('')
  const [allowFallbackToEmailMfa, setAllowFallbackToEmailMfa] = useState(false)

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

  const getOtpSetupInfo = useCallback(
    () => {
      fetch(
        `${routeConfig.IdentityRoute.OtpMfaSetup}${qs}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
        .then(parseResponse)
        .then((response) => {
          setOtpUri((response as GetOtpMfaSetupRes).otpUri)
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [onSubmitError, qs],
  )

  const getOtpMfaInfo = useCallback(
    () => {
      fetch(
        `${routeConfig.IdentityRoute.ProcessOtpMfa}${qs}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
        .then(parseResponse)
        .then((response) => {
          setAllowFallbackToEmailMfa((response as GetProcessOtpMfaRes).allowFallbackToEmailMfa)
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [onSubmitError, qs],
  )

  const handleVerifyMfa = useCallback(
    (e: Event) => {
      e.preventDefault()
      setTouched({ mfaCode: true })

      if (Object.values(errors).some((error) => error !== undefined)) {
        return
      }

      setIsVerifyingMfa(true)

      fetch(
        routeConfig.IdentityRoute.ProcessOtpMfa,
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
          setIsVerifyingMfa(false)
        })
    },
    [errors, mfaCode, onSubmitError, followUpParams, locale, onSwitchView],
  )

  return {
    otpUri,
    getOtpSetupInfo,
    getOtpMfaInfo,
    allowFallbackToEmailMfa,
    handleVerifyMfa,
    errors: { mfaCode: touched.mfaCode ? errors.mfaCode : undefined },
    values,
    handleChange,
    isVerifyingMfa,
  }
}

export default useOtpMfaForm
