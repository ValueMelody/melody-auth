import {
  useCallback, useMemo,
} from 'hono/jsx'
import { View } from './useCurrentView'
import {
  routeConfig, typeConfig,
} from 'configs'
import {
  handleAuthorizeStep,
  parseAuthorizeBaseValues, parseResponse,
} from 'pages/tools/request'
import { AuthorizeParams } from 'pages/tools/param'

export interface UseSocialSignInProps {
  params: AuthorizeParams;
  handleSubmitError: (error: string) => void;
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
}

const useSocialSignIn = ({
  params,
  handleSubmitError,
  locale,
  onSwitchView,
}: UseSocialSignInProps) => {
  const handleGoogleSignIn = useCallback(
    (response: any) => {
      if (!response.credential) return false

      fetch(
        routeConfig.IdentityRoute.AuthorizeGoogle,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: response.credential,
            ...parseAuthorizeBaseValues(
              params,
              locale,
            ),
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
          handleSubmitError(error)
        })
    },
    [params, locale, handleSubmitError, onSwitchView],
  )

  const handeFacebookSignIn = useCallback(
    (response: any) => {
      if (!response || !response.authResponse || !response.authResponse.accessToken) return false
      fetch(
        routeConfig.IdentityRoute.AuthorizeFacebook,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: response.authResponse.accessToken,
            ...parseAuthorizeBaseValues(
              params,
              locale,
            ),
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
          handleSubmitError(error)
        })
    },
    [params, locale, handleSubmitError, onSwitchView],
  )

  const socialSignInState = useMemo(
    () => {
      return {
        clientId: params.clientId,
        redirectUri: params.redirectUri,
        responseType: params.responseType,
        state: params.state,
        codeChallenge: params.codeChallenge,
        codeChallengeMethod: params.codeChallengeMethod,
        locale,
        policy: params.policy,
        org: params.org,
        scopes: params.scope.split(' '),
      }
    },
    [params, locale],
  )

  return {
    handleGoogleSignIn,
    handeFacebookSignIn,
    socialSignInState,
  }
}

export default useSocialSignIn
