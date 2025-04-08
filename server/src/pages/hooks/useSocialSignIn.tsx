import {
  useCallback, useEffect, useMemo,
  useState,
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
import {
  GetAuthorizeOidcConfigsRes, OidcProviderConfig,
} from 'handlers/identity/social'

export interface UseSocialSignInProps {
  params: AuthorizeParams;
  onSubmitError: (error: string) => void;
  locale: typeConfig.Locale;
  onSwitchView: (view: View) => void;
  oidcProviders?: string[];
}

const useSocialSignIn = ({
  params,
  onSubmitError,
  locale,
  onSwitchView,
  oidcProviders,
}: UseSocialSignInProps) => {
  const [oidcConfigs, setOidcConfigs] = useState<OidcProviderConfig[]>([])
  const [oidcCodeVerifier, setOidcCodeVerifier] = useState<string>('')

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
          onSubmitError(error)
        })
    },
    [params, locale, onSubmitError, onSwitchView],
  )

  const handleFacebookSignIn = useCallback(
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
          onSubmitError(error)
        })
    },
    [params, locale, onSubmitError, onSwitchView],
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

  const handleGetOidcConfigs = useCallback(
    async () => {
      return fetch(
        routeConfig.IdentityRoute.AuthorizeOidcConfigs,
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
          return response as GetAuthorizeOidcConfigsRes
        })
    },
    [],
  )

  useEffect(
    () => {
      if (oidcProviders && oidcProviders.length > 0) {
        handleGetOidcConfigs()
          .then(async (configs) => {
            setOidcConfigs(configs.configs)
            setOidcCodeVerifier(configs.codeVerifier)
          })
      }
    },
    [handleGetOidcConfigs, oidcProviders],
  )

  return {
    handleGoogleSignIn,
    handleFacebookSignIn,
    handleGetOidcConfigs,
    socialSignInState,
    oidcConfigs,
    oidcCodeVerifier,
  }
}

export default useSocialSignIn
