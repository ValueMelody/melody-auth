import { Dispatch } from 'react'
import {
  ProviderConfig, handleError, ErrorType,
} from '@melody-auth/shared'
import { exchangeTokenByAuthCode } from '@melody-auth/web'

export const handleTokenExchangeByAuthCode = (
  code: string,
  state: string,
  config: ProviderConfig,
  dispatch: Dispatch<any>,
  locale?: string,
) => {
  exchangeTokenByAuthCode(
    code,
    state,
    config,
  )
    .then((res) => {
      if (res?.accessTokenStorage) {
        dispatch({
          type: 'setAccessTokenStorage', payload: res.accessTokenStorage,
        })
        if (config.onLoginSuccess) {
          config.onLoginSuccess({
            state,
            locale,
          })
        }
      } else {
        dispatch({
          type: 'setIsAuthenticating', payload: false,
        })
      }
      if (res?.refreshTokenStorage || res?.idTokenStorage) {
        dispatch({
          type: 'setAuth',
          payload: {
            refreshTokenStorage: res.refreshTokenStorage,
            idTokenBody: res.idTokenStorage?.account ?? null,
            idToken: res.idTokenStorage?.idToken ?? null,
          },
        })
      }
    })
    .catch((e) => {
      const msg = handleError(
        e,
        ErrorType.ObtainAccessToken,
      )
      console.error(
        'Authentication error:',
        msg,
      )
      dispatch({
        type: 'setAuthenticationError', payload: msg,
      })
    })
}
