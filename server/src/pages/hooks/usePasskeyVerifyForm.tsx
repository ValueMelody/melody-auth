import {
  useCallback, useState,
} from 'hono/jsx'
import { object } from 'yup'
import { startAuthentication } from '@simplewebauthn/browser'
import { View } from './useCurrentView'
import {
  routeConfig, typeConfig,
} from 'configs'
import {
  handleAuthorizeStep, parseAuthorizeBaseValues,
  parseResponse,
} from 'pages/tools/request'
import {
  validate, emailField,
} from 'pages/tools/form'
import { AuthorizeParams } from 'pages/tools/param'
import { GetAuthorizePasskeyVerifyRes } from 'handlers/identity/passkey'

export interface UsePasskeyVerifyFormProps {
  email: string;
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
  onSwitchView: (view: View) => void;
  params: AuthorizeParams;
}

const usePasskeyVerifyForm = ({
  email,
  locale,
  onSubmitError,
  onSwitchView,
  params,
}: UsePasskeyVerifyFormProps) => {
  const [passkeyOption, setPasskeyOption] = useState<GetAuthorizePasskeyVerifyRes['passkeyOption'] | null | false>(null)

  const [isVerifyingPasskey, setIsVerifyingPasskey] = useState(false)

  const signInSchema = object({ email: emailField(locale) })

  const errors = validate(
    signInSchema,
    { email },
  )

  const getPasskeyOption = useCallback(
    async () => {
      if (errors.email) {
        return onSubmitError(errors.email)
      }

      fetch(`${routeConfig.IdentityRoute.AuthorizePasskeyVerify}?email=${email}`)
        .then(parseResponse)
        .then((response) => {
          if ((response as GetAuthorizePasskeyVerifyRes).passkeyOption) {
            setPasskeyOption((response as GetAuthorizePasskeyVerifyRes).passkeyOption)
          } else {
            setPasskeyOption(false)
          }
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [email, onSubmitError, errors.email],
  )

  const submitPasskey = useCallback(
    (res: Credential) => {
      fetch(
        routeConfig.IdentityRoute.AuthorizePasskeyVerify,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...parseAuthorizeBaseValues(
              params,
              locale,
            ),
            passkeyInfo: res,
            email,
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
    },
    [email, onSubmitError, params, locale, onSwitchView],
  )

  const handleVerifyPasskey = useCallback(
    () => {
      if (!passkeyOption) {
        return
      }

      setIsVerifyingPasskey(true)

      startAuthentication({ optionsJSON: passkeyOption })
        .then((res) => {
          if (res) {
            submitPasskey(res)
          }
        })
        .catch((error) => {
          onSubmitError(error)
        })
        .finally(() => {
          setIsVerifyingPasskey(false)
        })
    },
    [passkeyOption, onSubmitError, submitPasskey],
  )

  return {
    passkeyOption,
    getPasskeyOption,
    handleVerifyPasskey,
    isVerifyingPasskey,
  }
}

export default usePasskeyVerifyForm
