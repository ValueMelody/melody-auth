import {
  useCallback, useContext,
  useMemo,
} from 'react'
import {
  loginRedirect as rawLoginRedirect, logout,
  exchangeTokenByRefreshToken, getUserInfo,
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

  const isAuthenticated = useMemo(
    () => state.isAuthenticated,
    [state.isAuthenticated],
  )
  const isAuthenticating = useMemo(
    () => state.isAuthenticating,
    [state.isAuthenticating],
  )

  const loginRedirect = useCallback(
    () => {
      rawLoginRedirect(state.config)
    },
    [state.config],
  )

  const logoutRedirect = useCallback(
    async ({
      postLogoutRedirectUri = '',
      localOnly = false,
    }: {
      postLogoutRedirectUri?: string;
      localOnly?: boolean;
    }) => {
      if (!accessToken) return

      await logout(
        state.config,
        accessToken,
        refreshToken,
        postLogoutRedirectUri,
        localOnly,
      )
      dispatch({ type: 'logout' })
    },
    [state.config, accessToken, refreshToken, dispatch],
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

  const acquireUserInfo = useCallback(
    async () => {
      if (state.userInfo) return state.userInfo

      const accessToken = await acquireToken()
      const res = await getUserInfo(
        state.config,
        { accessToken },
      )

      dispatch({
        type: 'setUserInfo', payload: res,
      })
      return res
    },
    [acquireToken, state.config, state.userInfo, dispatch],
  )

  return {
    loginRedirect,
    accessToken,
    refreshToken,
    acquireToken,
    acquireUserInfo,
    logoutRedirect,
    isAuthenticated,
    isAuthenticating,
  }
}
