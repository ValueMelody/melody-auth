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
  routeConfig, typeConfig, localeConfig,
} from 'configs'
import { SmsMfaInfo } from 'handlers/identity/mfa'
import {
  handleAuthorizeStep, parseAuthorizeFollowUpValues,
  parseResponse,
} from 'pages/tools/request'

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

  const [currentNumber, setCurrentNumber] = useState<string | null>(null)
  const [allowFallbackToEmailMfa, setAllowFallbackToEmailMfa] = useState<boolean>(false)
  const [countryCode, setCountryCode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [mfaCode, setMfaCode] = useState<string[] | null>(null)
  const [resent, setResent] = useState(false)

  const [touched, setTouched] = useState({
    phoneNumber: false,
    mfaCode: false,
  })

  const values = {
    phoneNumber,
    mfaCode,
  }

  const smsMfaSchema = object({
    phoneNumber: !currentNumber
      ? string()
        .test(
          'is-valid-phone',
          localeConfig.validateError.wrongPhoneFormat[locale],
          function (value) {
            if (!value) return false
            const fullNumber = countryCode + value.trim()
            const regex = /^\+[1-9]\d{1,14}$/
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
    name: 'phoneNumber' | 'mfaCode', value: string | string[],
  ) => {
    onSubmitError(null)
    switch (name) {
    case 'phoneNumber':
      setPhoneNumber(value as string)
      break
    case 'mfaCode':
      setMfaCode(value as string[])
      break
    }
  }

  const getSmsMfaInfo = useCallback(
    () => {
      fetch(
        `${routeConfig.IdentityRoute.AuthorizeSmsMfaInfo}${qs}`,
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
          setCurrentNumber((response as SmsMfaInfo).phoneNumber)
          if ((response as SmsMfaInfo).phoneNumber) {
            setMfaCode(new Array(6).fill(''))
          }
          setAllowFallbackToEmailMfa((response as SmsMfaInfo).allowFallbackToEmailMfa)
          setCountryCode((response as SmsMfaInfo).countryCode)
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [onSubmitError, qs],
  )

  const requestSetupMfa = useCallback(
    () => {
      fetch(
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
    },
    [followUpParams, locale, countryCode, phoneNumber, onSubmitError],
  )

  const handleResend = useCallback(
    () => {
      if (errors.phoneNumber !== undefined) {
        return
      }

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
      } else {
        requestSetupMfa()
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

      if (mfaCode === null) {
        requestSetupMfa()
      } else {
        fetch(
          routeConfig.IdentityRoute.AuthorizeSmsMfa,
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
      }
    },
    [
      errors, setTouched, followUpParams, mfaCode, onSwitchView, locale,
      onSubmitError, requestSetupMfa,
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
  }
}

export default useSmsMfaForm
