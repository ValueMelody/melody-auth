import {
  useCallback, useContext,
  useMemo,
} from 'react'
import {
  loginRedirect as rawLoginRedirect, exchangeTokenByAuthCode, exchangeTokenByRefreshToken,
} from 'web-sdk'
import oauthContext, { OauthContext } from './context'

export const useOauth = () => {
  const context = useContext<OauthContext>(oauthContext)
  const {
    state, dispatch,
  } = context

  const accessToken = useMemo(
    () => state.accessTokenStorage?.accessToken ?? null,
    [state.accessTokenStorage],
  )

  const refreshToken = useMemo(
    () => state.refreshTokenStorage?.refreshToken ?? null,
    [state.refreshTokenStorage],
  )

  const setup = useCallback(
    async () => {
      const res = await exchangeTokenByAuthCode(state.config)
      if (res?.accessTokenStorage) {
        dispatch({
          type: 'setAccessTokenStorage', payload: res.accessTokenStorage,
        })
      }

      if (res?.refreshTokenStorage) {
        dispatch({
          type: 'setRefreshTokenStorage', payload: res.refreshTokenStorage,
        })
      }
    },
    [state.config, dispatch],
  )

  const loginRedirect = useCallback(
    () => {
      rawLoginRedirect(state.config)
    },
    [state.config],
  )

  const acquireToken = useCallback(
    async () => {
      const currentTimeStamp = new Date().getTime() / 1000

      const accessTokenStorage = state.accessTokenStorage
      const hasValidToken = !!accessTokenStorage?.accessToken && currentTimeStamp < accessTokenStorage.expiresOn - 5
      if (hasValidToken) return accessTokenStorage.accessToken

      const refreshTokenStorage = state.refreshTokenStorage
      const hasValidRefreshToken =
        !!refreshTokenStorage?.refreshToken &&
        currentTimeStamp < refreshTokenStorage.expiresOn - 5
      if (hasValidRefreshToken) {
        const res = await exchangeTokenByRefreshToken(
          state.config,
          refreshTokenStorage.refreshToken,
        )
        dispatch({
          type: 'setAccessTokenStorage', payload: res,
        })
        return res.accessToken
      }

      return ''
    },
    [state.accessTokenStorage, state.refreshTokenStorage, state.config, dispatch],
  )

  return {
    loginRedirect, setup, accessToken, refreshToken, acquireToken,
  }
}
