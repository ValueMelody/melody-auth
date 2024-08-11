import {
  ReactNode, useEffect, useReducer,
} from 'react'
import {
  IdTokenBody,
  ProviderConfig, RefreshTokenStorage, StorageKey,
} from 'shared'
import Setup from './Setup'
import authContext, {
  AuthState, DispatchAction,
} from './context'

export interface ProviderProps extends ProviderConfig {
  children: ReactNode;
}

const reducer = (
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

      const storage = config.storage === 'sessionStorage' ? window.sessionStorage : window.localStorage
      const stored = storage.getItem(StorageKey.RefreshToken)
      const storedAccount = storage.getItem(StorageKey.Account)
      if (stored) {
        const parsed: RefreshTokenStorage = JSON.parse(stored)
        const currentTimestamp = new Date().getTime() / 1000
        const isValid = parsed.refreshToken && parsed.expiresOn && parsed.expiresOn >= currentTimestamp + 5
        if (isValid) {
          const parsedAccount: IdTokenBody = storedAccount ? JSON.parse(storedAccount) : null

          dispatch({
            type: 'setAuth', payload: {
              refreshTokenStorage: parsed,
              idTokenBody: parsedAccount,
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
