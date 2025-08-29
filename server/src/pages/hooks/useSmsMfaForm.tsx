import {
  useCallback, useMemo, useState,
} from 'hono/jsx'
import {
  array, string, object,
} from 'yup'
import { View } from './useCurrentView'
import { getFollowUpParams } from 'pages/tools/param'
import {
  codeField, validate,
} from 'pages/tools/form'
import {
  routeConfig, typeConfig,
  variableConfig,
} from 'configs'
import { GetProcessSmsMfaRes } from 'handlers/identity/mfa'
import {
  handleAuthorizeStep, parseAuthorizeFollowUpValues,
  parseResponse,
} from 'pages/tools/request'
import { validateError } from 'pages/tools/locale'

export interface UseSmsMfaFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
  onSwitchView: (view: View) => void;
}

const useSmsMfaForm = ({
  locale,
  onSubmitError,
  onSwitchView,
}: UseSmsMfaFormProps) => {
  const followUpParams = useMemo(
    () => getFollowUpParams(),
    [],
  )
  const qs = `?code=${followUpParams.code}&locale=${locale}&org=${followUpParams.org}`

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const [currentNumber, setCurrentNumber] = useState<string | null>(null)
  const [allowFallbackToEmailMfa, setAllowFallbackToEmailMfa] = useState<boolean>(false)
  const [countryCode, setCountryCode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [mfaCode, setMfaCode] = useState<string[] | null>(null)
  const [resent, setResent] = useState(false)
  const [rememberDevice, setRememberDevice] = useState(false)

  const [touched, setTouched] = useState({
    phoneNumber: false,
    mfaCode: false,
  })

  const values = {
    phoneNumber,
    mfaCode,
    rememberDevice,
  }

  const smsMfaSchema = object({
    phoneNumber: !currentNumber
      ? string()
        .test(
          'is-valid-phone',
          validateError.wrongPhoneFormat[locale],
          function (value) {
            if (!value) return false
            const fullNumber = countryCode + value.trim()
            const regex = variableConfig.SmsMfaConfig.validationRegex
            return regex.test(fullNumber)
          },
        )
      : string(),
    mfaCode: mfaCode !== null
      ? codeField(locale)
      : array().nullable(),
  })

  const errors = validate(
    smsMfaSchema,
    values,
  )

  const handleChange = (
    name: 'phoneNumber' | 'mfaCode' | 'rememberDevice', value: string | string[] | boolean,
  ) => {
    onSubmitError(null)
    switch (name) {
    case 'phoneNumber':
      setPhoneNumber(value as string)
      break
    case 'mfaCode':
      setMfaCode(value as string[])
      break
    case 'rememberDevice':
      setRememberDevice(value as boolean)
      break
    }
  }

  const getSmsMfaInfo = useCallback(
    () => {
      fetch(
        `${routeConfig.IdentityRoute.ProcessSmsMfa}${qs}`,
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
          setCurrentNumber((response as GetProcessSmsMfaRes).phoneNumber)
          if ((response as GetProcessSmsMfaRes).phoneNumber) {
            setMfaCode(new Array(6).fill(''))
          }
          setAllowFallbackToEmailMfa((response as GetProcessSmsMfaRes).allowFallbackToEmailMfa)
          setCountryCode((response as GetProcessSmsMfaRes).countryCode)
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [onSubmitError, qs],
  )

  const requestSetupMfa = useCallback(
    () => {
      setIsSending(true)

      return fetch(
        routeConfig.IdentityRoute.SetupSmsMfa,
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
            phoneNumber: countryCode + phoneNumber,
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
        .finally(() => {
          setIsSending(false)
        })
    },
    [followUpParams, locale, countryCode, phoneNumber, onSubmitError],
  )

  const handleResend = useCallback(
    () => {
      if (errors.phoneNumber !== undefined) {
        return
      }

      setIsSending(true)

      if (currentNumber) {
        fetch(
          routeConfig.IdentityRoute.ResendSmsMfa,
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
            setMfaCode(new Array(6).fill(''))
            setResent(true)
          })
          .catch((error) => {
            onSubmitError(error)
          })
          .finally(() => {
            setIsSending(false)
          })
      } else {
        requestSetupMfa().finally(() => {
          setIsSending(false)
        })
      }
    },
    [
      setMfaCode, followUpParams, requestSetupMfa, currentNumber, onSubmitError,
      errors.phoneNumber, locale,
    ],
  )

  const handleSubmit = useCallback(
    (e: Event) => {
      e.preventDefault()
      setTouched({
        phoneNumber: true,
        mfaCode: mfaCode !== null,
      })

      if (Object.values(errors).some((error) => error !== undefined)) {
        return
      }

      setIsSubmitting(true)

      if (mfaCode === null) {
        requestSetupMfa().finally(() => {
          setIsSubmitting(false)
        })
      } else {
        fetch(
          routeConfig.IdentityRoute.ProcessSmsMfa,
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
              rememberDevice,
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
      }
    },
    [
      errors, setTouched, followUpParams, mfaCode, onSwitchView, locale,
      onSubmitError, requestSetupMfa, rememberDevice,
    ],
  )

  return {
    currentNumber,
    allowFallbackToEmailMfa,
    countryCode,
    getSmsMfaInfo,
    values,
    errors: {
      phoneNumber: touched.phoneNumber ? errors.phoneNumber : undefined,
      mfaCode: touched.mfaCode ? errors.mfaCode : undefined,
    },
    handleChange,
    handleSubmit,
    handleResend,
    resent,
    isSubmitting,
    isSending,
  }
}

export default useSmsMfaForm
