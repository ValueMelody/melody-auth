import {
  ReactNode, useEffect, useReducer,
} from 'react'
import {
  checkStorage,
  ProviderConfig,
  isValidTokens,
  loadRefreshTokenStorageFromParams,
  IdTokenStorage,
} from '@melody-auth/shared'
import Setup from './Setup'
import authContext, {
  AuthState, DispatchAction,
} from './context'

export interface ProviderProps extends ProviderConfig {
  children: ReactNode;
}

export const reducer = (
  state: AuthState, action: DispatchAction,
) => {
  switch (action.type) {
  case 'setAccessTokenStorage':
    return {
      ...state,
      accessTokenStorage: action.payload,
      isAuthenticated: true,
      isAuthenticating: false,
      isLoadingToken: false,
      acquireTokenError: '',
    }
  case 'setAuth':
    return {
      ...state,
      refreshTokenStorage: action.payload.refreshTokenStorage,
      account: action.payload.idTokenBody,
      idToken: action.payload.idToken,
      checkedStorage: true,
    }
  case 'setIsAuthenticating':
    return {
      ...state, isAuthenticating: action.payload,
    }
  case 'setAuthenticationError':
    return {
      ...state,
      authenticationError: action.payload,
      isAuthenticating: false,
    }
  case 'setCheckedStorage':
    return {
      ...state, checkedStorage: action.payload,
    }
  case 'setIsLoadingUserInfo':
    return {
      ...state, isLoadingUserInfo: action.payload,
    }
  case 'setAcquireUserInfoError':
    return {
      ...state,
      acquireUserInfoError: action.payload,
      isLoadingUserInfo: false,
    }
  case 'setUserInfo':
    return {
      ...state,
      userInfo: action.payload,
      isLoadingUserInfo: false,
      acquireUserInfoError: '',
    }
  case 'setAcquireTokenError':
    return {
      ...state,
      acquireTokenError: action.payload,
      isLoadingToken: false,
      isAuthenticating: false,
    }
  case 'setIsLoadingToken':
    return {
      ...state,
      isLoadingToken: true,
    }
  case 'setLoginError':
    return {
      ...state,
      loginError: action.payload,
    }
  case 'setLogoutError':
    return {
      ...state,
      logoutError: action.payload,
    }
  }
}

export const AuthProvider = ({
  children,
  ...config
}: ProviderProps) => {
  const [state, dispatch] = useReducer(
    reducer,
    {
      isAuthenticating: true,
      authenticationError: '',
      isAuthenticated: false,
      config,
      userInfo: null,
      account: null,
      idToken: null,
      accessTokenStorage: null,
      refreshTokenStorage: null,
      checkedStorage: false,
      isLoadingUserInfo: false,
      acquireUserInfoError: '',
      isLoadingToken: false,
      acquireTokenError: '',
      loginError: '',
      logoutError: '',
    },
  )

  useEffect(
    () => {
      if (typeof window === 'undefined') return

      let parsedRefreshToken = loadRefreshTokenStorageFromParams(config.storage)

      const {
        storedRefreshToken, storedIdToken,
      } = checkStorage(config.storage)

      if (!parsedRefreshToken && storedRefreshToken) {
        parsedRefreshToken = JSON.parse(storedRefreshToken)
      }

      const parsedIdToken: IdTokenStorage = storedIdToken ? JSON.parse(storedIdToken) : null

      if (parsedRefreshToken || parsedIdToken) {
        const {
          hasValidIdToken, hasValidRefreshToken,
        } = isValidTokens(
          null,
          parsedRefreshToken,
          parsedIdToken,
        )
        const account = parsedIdToken?.account

        if (hasValidRefreshToken || !!account) {
          dispatch({
            type: 'setAuth',
            payload: {
              refreshTokenStorage: hasValidRefreshToken ? parsedRefreshToken : null,
              idTokenBody: account ?? null,
              idToken: hasValidIdToken ? parsedIdToken.idToken : null,
            },
          })
          return
        }
      }
      dispatch({
        type: 'setCheckedStorage', payload: true,
      })
    },
    [config.storage],
  )

  return (
    <authContext.Provider
      value={{
        state, dispatch,
      }}
    >
      <Setup />
      {children}
    </authContext.Provider>
  )
}
