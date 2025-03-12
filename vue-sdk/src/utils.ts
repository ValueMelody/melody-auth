import {
  exchangeTokenByAuthCode, exchangeTokenByRefreshToken,
} from '@melody-auth/web'
import {
  handleError, ErrorType, isValidTokens,
} from 'shared'
import { AuthState } from './context'

export const handleTokenExchangeByAuthCode = (
  code: string,
  requestState: string,
  state: AuthState,
  locale?: string,
) => {
  exchangeTokenByAuthCode(
    code,
    requestState,
    state.config,
  )
    .then((res) => {
      if (res?.accessTokenStorage) {
        state.accessTokenStorage = res.accessTokenStorage
        state.isAuthenticated = true
        state.isAuthenticating = false
        state.isLoadingToken = false
        state.acquireTokenError = ''
        if (state.config.onLoginSuccess) {
          state.config.onLoginSuccess({
            state: requestState,
            locale,
          })
        }
      } else {
        state.isAuthenticating = false
      }
      if (res?.refreshTokenStorage) {
        state.refreshTokenStorage = res.refreshTokenStorage
        state.account = res.idTokenBody
        state.checkedStorage = true
      }
    })
    .catch((e) => {
      const msg = handleError(
        e,
        ErrorType.ObtainAccessToken,
      )
      state.authenticationError = msg
      state.isAuthenticating = false
    })
}

export const acquireToken = async (state: AuthState) => {
  const {
    hasValidAccessToken, hasValidRefreshToken,
  } = isValidTokens(
    state.accessTokenStorage,
    state.refreshTokenStorage,
  )

  if (hasValidAccessToken) return state.accessTokenStorage?.accessToken

  if (hasValidRefreshToken) {
    state.isLoadingToken = true
    try {
      const res = await exchangeTokenByRefreshToken(
        state.config,
        state.refreshTokenStorage?.refreshToken ?? '',
      )

      state.accessTokenStorage = res
      state.isAuthenticated = true
      state.isAuthenticating = false
      state.isLoadingToken = false
      state.acquireTokenError = ''
      return res.accessToken
    } catch (e) {
      const errorMsg = handleError(
        e,
        ErrorType.ExchangeAccessToken,
      )
      state.acquireTokenError = errorMsg
      state.isLoadingToken = false
      state.isAuthenticating = false
    }
  } else {
    state.acquireTokenError = ErrorType.InvalidRefreshToken
    state.isLoadingToken = false
    state.isAuthenticating = false
  }
}
