import {
  useCallback, useContext,
  useMemo,
} from 'react'
import {
  loginRedirect as rawLoginRedirect, exchangeTokenByAuthCode,
} from 'web-sdk'
import oauthContext, { OauthContext } from './context'

export const useOauth = () => {
  const context = useContext<OauthContext>(oauthContext)
  const {
    state, dispatch,
  } = context

  const setup = useCallback(
    () => {
      exchangeTokenByAuthCode(state.config)
        .then((res) => {
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
        })
    },
    [state.config, dispatch],
  )

  const loginRedirect = useCallback(
    () => {
      rawLoginRedirect(state.config)
    },
    [state.config],
  )

  const accessToken = useMemo(
    () => state.accessTokenStorage?.accessToken ?? null,
    [state.accessTokenStorage],
  )

  const refreshToken = useMemo(
    () => state.refreshTokenStorage?.refreshToken ?? null,
    [state.refreshTokenStorage],
  )

  return {
    loginRedirect, setup, accessToken, refreshToken,
  }
}
