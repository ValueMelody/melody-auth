import { WritableSignal } from '@angular/core'
import {
  exchangeTokenByAuthCode,
  exchangeTokenByRefreshToken,
} from '@melody-auth/web'
import {
  handleError,
  ErrorType,
  isValidTokens,
  AuthState,
} from '@melody-auth/shared'

export const handleTokenExchangeByAuthCode = (
  code: string,
  requestState: string,
  state: WritableSignal<AuthState>,
  locale?: string,
) => {
  exchangeTokenByAuthCode(
    code,
    requestState,
    state().config,
  )
    .then((res) => {
      state.update((prev) => {
        const newState = { ...prev }

        if (res?.accessTokenStorage) {
          newState.accessTokenStorage = res.accessTokenStorage
          newState.isAuthenticated = true
          newState.isAuthenticating = false
          newState.isLoadingToken = false
          newState.acquireTokenError = ''
          if (prev.config?.onLoginSuccess) {
            prev.config.onLoginSuccess({
              state: requestState,
              locale,
            })
          }
        } else {
          newState.isAuthenticating = false
        }
        if (res?.refreshTokenStorage || res?.idTokenStorage) {
          newState.refreshTokenStorage = res.refreshTokenStorage
          newState.account = res.idTokenStorage?.account ?? null
          newState.idToken = res.idTokenStorage?.idToken ?? null
          newState.checkedStorage = true
        }
        return newState
      })
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
      state.update((prev) => ({
        ...prev,
        authenticationError: msg,
        isAuthenticating: false,
      }))
    })
}

export const acquireToken = async (state: WritableSignal<AuthState>): Promise<string | undefined> => {
  const current = state()
  const {
    hasValidAccessToken, hasValidRefreshToken,
  } = isValidTokens(
    current.accessTokenStorage,
    current.refreshTokenStorage,
    null,
  )

  if (hasValidAccessToken) {
    return current.accessTokenStorage?.accessToken
  }

  if (hasValidRefreshToken) {
    state.update((prev) => ({
      ...prev,
      isLoadingToken: true,
    }))
    try {
      const res = await exchangeTokenByRefreshToken(
        current.config,
        current.refreshTokenStorage?.refreshToken ?? '',
      )
      state.update((prev) => ({
        ...prev,
        accessTokenStorage: res,
        isAuthenticated: true,
        isAuthenticating: false,
        isLoadingToken: false,
        acquireTokenError: '',
      }))
      return res.accessToken
    } catch (e) {
      const errorMsg = handleError(
        e,
        ErrorType.ExchangeAccessToken,
      )
      state.update((prev) => ({
        ...prev,
        acquireTokenError: errorMsg,
        isLoadingToken: false,
        isAuthenticating: false,
      }))
    }
  } else {
    state.update((prev) => ({
      ...prev,
      acquireTokenError: ErrorType.InvalidRefreshToken,
      isLoadingToken: false,
      isAuthenticating: false,
    }))
  }

  return undefined
}
