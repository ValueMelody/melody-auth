import {
  ReactNode, useEffect, useReducer,
} from 'react'
import {
  RefreshTokenStorage, StorageKey,
} from 'web-sdk/dist/definitions'
import { ProviderConfig } from '../../global'
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
      ...state, refreshTokenStorage: action.payload,
    }
  case 'setUserInfo':
    return {
      ...state, userInfo: action.payload,
    }
  case 'setIsAuthenticating':
    return {
      ...state, isAuthenticating: action.payload,
    }
  case 'logout':
    return {
      ...state,
      isAuthenticating: false,
      isAuthenticated: false,
      accessTokenStorage: null,
      refreshTokenStorage: null,
      userInfo: null,
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
    },
  )

  useEffect(
    () => {
      if (typeof window === 'undefined') return
      const storage = config.storage === 'localStorage' ? window.localStorage : window.sessionStorage
      const stored = storage.getItem(StorageKey.RefreshToken)
      if (!stored) return
      const parsed: RefreshTokenStorage = JSON.parse(stored)
      const currentTimestamp = new Date().getTime() / 1000
      const isValid = parsed.refreshToken && parsed.expiresOn && parsed.expiresOn >= currentTimestamp + 5
      if (isValid) {
        dispatch({
          type: 'setRefreshTokenStorage', payload: parsed,
        })
      }
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
