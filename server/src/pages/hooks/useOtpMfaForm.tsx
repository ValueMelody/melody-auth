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
} from 'pages/tools/request'
import {
  OtpMfaInfo, OtpSetupInfo,
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
        `${routeConfig.IdentityRoute.AuthorizeOtpSetupInfo}${qs}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
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
          setOtpUri((response as OtpSetupInfo).otpUri)
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
        `${routeConfig.IdentityRoute.AuthorizeOtpMfaInfo}${qs}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
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
          setAllowFallbackToEmailMfa((response as OtpMfaInfo).allowFallbackToEmailMfa)
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [onSubmitError, qs],
  )

  const handleMfa = useCallback(
    (e: Event) => {
      e.preventDefault()
      setTouched({ mfaCode: true })

      if (Object.values(errors).some((error) => error !== undefined)) {
        return
      }

      fetch(
        routeConfig.IdentityRoute.AuthorizeOtpMfa,
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
    [errors, mfaCode, onSubmitError, followUpParams, locale, onSwitchView],
  )

  return {
    otpUri,
    getOtpSetupInfo,
    getOtpMfaInfo,
    allowFallbackToEmailMfa,
    handleMfa,
    errors: { mfaCode: touched.mfaCode ? errors.mfaCode : undefined },
    values,
    handleChange,
  }
}

export default useOtpMfaForm
