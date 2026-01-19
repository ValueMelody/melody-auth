import {
  useCallback, useState, useEffect,
} from 'hono/jsx'
import { startAuthentication } from '@simplewebauthn/browser'
import { View } from './useCurrentView'
import { InitialProps } from './useInitialProps'
import {
  routeConfig, typeConfig,
} from 'configs'
import {
  handleAuthorizeStep, parseAuthorizeBaseValues,
  parseResponse,
} from 'pages/tools/request'
import { AuthorizeParams } from 'pages/tools/param'
import { GetAuthorizePasskeyVerifyRes } from 'handlers/identity/passkey'

export interface UsePasskeyVerifyFormProps {
  locale: typeConfig.Locale;
  onSubmitError: (error: string | null) => void;
  onSwitchView: (view: View) => void;
  params: AuthorizeParams;
  initialProps: InitialProps;
}

const usePasskeyVerifyForm = ({
  locale,
  onSubmitError,
  onSwitchView,
  params,
  initialProps,
}: UsePasskeyVerifyFormProps) => {
  const [passkeyOption, setPasskeyOption] = useState<GetAuthorizePasskeyVerifyRes['passkeyOption'] | null | false>(null)

  const [isVerifyingPasskey, setIsVerifyingPasskey] = useState(false)

  const getPasskeyOption = useCallback(
    async () => {
      fetch(`${routeConfig.IdentityRoute.AuthorizePasskeyVerify}`)
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
    [onSubmitError],
  )

  useEffect(
    () => {
      if (initialProps.allowPasskey) {
        getPasskeyOption()
      }
    },
    [initialProps.allowPasskey, getPasskeyOption],
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
            challenge: passkeyOption ? passkeyOption.challenge : '',
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
    [onSubmitError, params, locale, onSwitchView, passkeyOption],
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
    handleVerifyPasskey,
    isVerifyingPasskey,
  }
}

export default usePasskeyVerifyForm
