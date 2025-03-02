import {
  useCallback, useState,
} from 'hono/jsx'
import { object } from 'yup'
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
import { AuthorizePasskeyVerify } from 'handlers/identity/passkey'

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
  const [passkeyOption, setPasskeyOption] = useState<AuthorizePasskeyVerify['passkeyOption'] | null | false>(null)

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
          if ((response as AuthorizePasskeyVerify).passkeyOption) {
            setPasskeyOption((response as AuthorizePasskeyVerify).passkeyOption)
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

      navigator.credentials.get({
        publicKey: {
          challenge: (window as any).SimpleWebAuthnBrowser.base64URLStringToBuffer(passkeyOption.challenge),
          allowCredentials: passkeyOption.allowCredentials?.map((credential) => ({
            id: (window as any).SimpleWebAuthnBrowser.base64URLStringToBuffer(credential.id),
            type: 'public-key',
          })),
        },
      })
        .then((res) => {
          if (res) {
            submitPasskey(res)
          }
        })
        .catch((error) => {
          onSubmitError(error)
        })
    },
    [passkeyOption, onSubmitError, submitPasskey],
  )

  return {
    passkeyOption, getPasskeyOption, handleVerifyPasskey,
  }
}

export default usePasskeyVerifyForm
