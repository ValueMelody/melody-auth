import { Dispatch } from 'react'
import { ProviderConfig } from 'shared'
import { exchangeTokenByAuthCode } from 'web-sdk'

export enum ErrorType {
  Unauthorized = 'Unauthorized',
  FetchUserInfo = 'Failed to fetch user info',
  ExchangeAccessToken = 'Failed to exchange access token',
  ObtainAccessToken = 'Can not obtain access token',
  InvalidRefreshToken = 'Invalid refresh token',
  LoginFailed = 'Unable to initial login flow',
  LogoutFailed = 'Unable to initial logout flow',
  Unknown = 'An error occurs.',
}

export const handleError = (
  e: any, fallback?: string,
) => {
  if (String(e).includes('Unauthorized')) return ErrorType.Unauthorized
  if (fallback) return fallback
  return ErrorType.Unknown
}

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
      if (res?.refreshTokenStorage) {
        dispatch({
          type: 'setAuth',
          payload: {
            refreshTokenStorage: res.refreshTokenStorage,
            idTokenBody: res.idTokenBody,
          },
        })
      }
    })
    .catch((e) => {
      const msg = handleError(
        e,
        ErrorType.ObtainAccessToken,
      )
      dispatch({
        type: 'setAuthenticationError', payload: msg,
      })
    })
}
