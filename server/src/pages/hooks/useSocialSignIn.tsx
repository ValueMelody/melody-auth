import {
  useCallback, useMemo,
} from 'hono/jsx'
import {
  routeConfig, typeConfig,
} from 'configs'
import {
  parseAuthorizeBaseValues, parseResponse,
} from 'pages/tools/request'
import { AuthorizeParams } from 'pages/tools/param'
export interface UseSocialSignInProps {
  params: AuthorizeParams;
  handleSubmitError: (error: string) => void;
  locale: typeConfig.Locale;
}

const useSocialSignIn = ({
  params,
  handleSubmitError,
  locale,
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
        .catch((error) => {
          handleSubmitError(error)
        })
    },
    [params, locale, handleSubmitError],
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
        .catch((error) => {
          handleSubmitError(error)
        })
    },
    [params, locale, handleSubmitError],
  )

  const githubSignInState = useMemo(
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
    githubSignInState,
  }
}

export default useSocialSignIn
