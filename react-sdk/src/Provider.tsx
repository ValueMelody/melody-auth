import {
  ReactNode, useEffect, useReducer,
} from 'react'
import {
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
    }
  case 'setRefreshTokenStorage':
    return {
      ...state,
      refreshTokenStorage: action.payload,
      checkedStorage: true,
    }
  case 'setUserInfo':
    return {
      ...state, userInfo: action.payload,
    }
  case 'setIsAuthenticating':
    return {
      ...state, isAuthenticating: action.payload,
    }
  case 'setCheckedStorage':
    return {
      ...state, checkedStorage: action.payload,
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
      isAuthenticated: false,
      config,
      userInfo: null,
      accessTokenStorage: null,
      refreshTokenStorage: null,
      checkedStorage: false,
    },
  )

  useEffect(
    () => {
      if (typeof window === 'undefined') return

      const storage = config.storage === 'localStorage' ? window.localStorage : window.sessionStorage
      const stored = storage.getItem(StorageKey.RefreshToken)
      if (stored) {
        const parsed: RefreshTokenStorage = JSON.parse(stored)
        const currentTimestamp = new Date().getTime() / 1000
        const isValid = parsed.refreshToken && parsed.expiresOn && parsed.expiresOn >= currentTimestamp + 5
        if (isValid) {
          dispatch({
            type: 'setRefreshTokenStorage', payload: parsed,
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
