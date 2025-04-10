import {
  useCallback, useContext,
  useMemo,
} from 'react'
import {
  triggerLogin, logout,
  exchangeTokenByRefreshToken, getUserInfo,
} from '@melody-auth/web'
import {
  AuthorizeMethod, LoginProps, LoginPopupProps, isValidTokens, ErrorType, handleError,
} from 'shared'
import authContext, { AuthContext } from './context'
import { handleTokenExchangeByAuthCode } from './utils'

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

  const login = useCallback(
    (
      method: AuthorizeMethod, props?: LoginProps,
    ) => {
      if (state.authenticationError) return
      if (state.isAuthenticating) throw new Error('Please wait until isAuthenticating=false')
      if (state.isAuthenticated && (!props?.policy || props?.policy === 'sign_in_or_sign_up')) throw new Error('Already authenticated, please logout first')
      try {
        triggerLogin(
          method,
          state.config,
          {
            ...props,
            authorizePopupHandler: ({
              state: requestState, code,
            }) => handleTokenExchangeByAuthCode(
              code,
              requestState,
              state.config,
              dispatch,
              props?.locale,
            ),
          },
        )
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
    [state.config, state.isAuthenticating, state.isAuthenticated, dispatch, state.authenticationError],
  )

  const loginRedirect = useCallback(
    (props?: LoginProps) => {
      login(
        'redirect',
        props,
      )
    },
    [login],
  )

  const loginPopup = useCallback(
    (props?: LoginPopupProps) => {
      login(
        'popup',
        props,
      )
    },
    [login],
  )

  const acquireToken = useCallback(
    async () => {
      const accessTokenStorage = state.accessTokenStorage
      const refreshTokenStorage = state.refreshTokenStorage

      const {
        hasValidAccessToken, hasValidRefreshToken,
      } = isValidTokens(
        accessTokenStorage,
        refreshTokenStorage,
      )

      if (hasValidAccessToken) return accessTokenStorage?.accessToken

      if (hasValidRefreshToken) {
        dispatch({
          type: 'setIsLoadingToken', payload: true,
        })
        try {
          const res = await exchangeTokenByRefreshToken(
            state.config,
            refreshTokenStorage?.refreshToken ?? '',
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
          { accessToken: accessToken ?? '' },
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

  const logoutRedirect = useCallback(
    async ({
      postLogoutRedirectUri = '',
      localOnly = false,
    }: {
      postLogoutRedirectUri?: string;
      localOnly?: boolean;
    }) => {
      const accessToken = await acquireToken()
      const isLocalOnly = !accessToken || !refreshToken || localOnly

      try {
        await logout(
          state.config,
          accessToken ?? '',
          refreshToken,
          postLogoutRedirectUri,
          isLocalOnly,
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
    [state.config, refreshToken, dispatch, acquireToken],
  )

  return {
    loginRedirect,
    loginPopup,
    refreshToken,
    logoutRedirect,
    accessToken,
    isAuthenticated,
    acquireUserInfo,
    acquireToken,
    isAuthenticating,
    account: state.account,
    userInfo: state.userInfo,
    isLoadingToken: state.isLoadingToken,
    isLoadingUserInfo: state.isLoadingUserInfo,
    authenticationError: state.authenticationError,
    acquireTokenError: state.acquireTokenError,
    acquireUserInfoError: state.acquireUserInfoError,
    loginError: state.loginError,
    logoutError: state.logoutError,
  }
}
