import {
  ReactNode, useEffect, useReducer,
} from 'react'
import {
  checkStorage,
  IdTokenBody,
  ProviderConfig,
  RefreshTokenStorage,
  isValidStorage,
  getParams,
  StorageKey,
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

      const {
        storedRefreshToken, storedAccount,
      } = checkStorage(config.storage)

      const params = getParams()

      let parsed: RefreshTokenStorage | null = null
      if (params.refresh_token && params.refresh_token_expires_on) {
        parsed = {
          refreshToken: params.refresh_token,
          expiresOn: parseInt(params.refresh_token_expires_on),
          expiresIn: parseInt(params.refresh_token_expires_in),
        }

        const storage = config.storage === 'sessionStorage' ? window.sessionStorage : window.localStorage
        storage.setItem(
          StorageKey.RefreshToken,
          JSON.stringify(parsed),
        )
      } else if (storedRefreshToken) {
        parsed = JSON.parse(storedRefreshToken)
      }

      if (parsed) {
        const isValid = isValidStorage(parsed)
        if (isValid) {
          const parsedAccount: IdTokenBody = storedAccount ? JSON.parse(storedAccount) : null

          dispatch({
            type: 'setAuth',
            payload: {
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
