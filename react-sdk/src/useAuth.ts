import {
  useCallback, useContext,
  useMemo,
} from 'react'
import {
  loginRedirect as rawLoginRedirect, logout,
  exchangeTokenByRefreshToken, getUserInfo,
} from 'web-sdk'
import authContext, { AuthContext } from './context'
import {
  ErrorType, handleError,
} from './utils'

export const useAuth = () => {
  const context = useContext<AuthContext>(authContext)
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
      if (state.isAuthenticating) throw new Error('Please wait until isAuthenticating=false')
      if (state.isAuthenticated) throw new Error('Already authenticated, please logout first')
      try {
        rawLoginRedirect(state.config)
      } catch (e) {
        const msg = handleError(
          e,
          ErrorType.LoginFailed,
        )
        dispatch({
          type: 'setLoginError', payload: msg,
        })
      }
    },
    [state.config, state.isAuthenticating, state.isAuthenticated, dispatch],
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

      try {
        await logout(
          state.config,
          accessToken,
          refreshToken,
          postLogoutRedirectUri,
          localOnly,
        )
      } catch (e) {
        const msg = handleError(
          e,
          ErrorType.LogoutFailed,
        )
        dispatch({
          type: 'setLogoutError', payload: msg,
        })
      }
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
        dispatch({
          type: 'setIsLoadingToken', payload: true,
        })
        try {
          const res = await exchangeTokenByRefreshToken(
            state.config,
            refreshTokenStorage.refreshToken,
          )
          dispatch({
            type: 'setAccessTokenStorage', payload: res,
          })
          return res.accessToken
        } catch (e) {
          const errorMsg = handleError(
            e,
            ErrorType.ExchangeAccessToken,
          )
          dispatch({
            type: 'setAcquireTokenError', payload: errorMsg,
          })
        }
      } else {
        dispatch({
          type: 'setAcquireTokenError', payload: ErrorType.InvalidRefreshToken,
        })
      }

      return ''
    },
    [state.accessTokenStorage, state.refreshTokenStorage, state.config, dispatch],
  )

  const acquireUserInfo = useCallback(
    async () => {
      if (state.userInfo) return state.userInfo

      dispatch({
        type: 'setIsLoadingUserInfo', payload: true,
      })

      const accessToken = await acquireToken()
      try {
        const res = await getUserInfo(
          state.config,
          { accessToken },
        )

        dispatch({
          type: 'setUserInfo', payload: res,
        })
        return res
      } catch (e) {
        const errorMsg = handleError(
          e,
          ErrorType.FetchUserInfo,
        )
        dispatch({
          type: 'setAcquireUserInfoError', payload: errorMsg,
        })
      }
    },
    [acquireToken, state.config, state.userInfo, dispatch],
  )

  return {
    loginRedirect,
    refreshToken,
    logoutRedirect,
    accessToken,
    isAuthenticated,
    acquireUserInfo,
    acquireToken,
    isAuthenticating,
    isLoadingToken: state.isLoadingToken,
    isLoadingUserInfo: state.isLoadingUserInfo,
    authenticationError: state.authenticationError,
    acquireTokenError: state.acquireTokenError,
    acquireUserInfoError: state.acquireUserInfoError,
    loginError: state.loginError,
    logoutError: state.logoutError,
  }
}
