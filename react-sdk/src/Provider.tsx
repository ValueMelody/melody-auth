import React, {
  ReactNode, useReducer,
} from 'react'
import {
  RefreshTokenStorage, StorageKey,
} from 'web-sdk/dist/definitions'
import { ProviderConfig } from '../../global'
import Setup from './Setup'
import oauthContext, {
  OauthState, DispatchAction,
} from './context'

export interface ProviderProps extends ProviderConfig {
  children: ReactNode;
}

const reducer = (
  state: OauthState, action: DispatchAction,
) => {
  switch (action.type) {
  case 'setAccessTokenStorage':
    return {
      ...state, accessTokenStorage: action.payload,
    }
  case 'setRefreshTokenStorage':
    return {
      ...state, refreshTokenStorage: action.payload,
    }
  case 'setUserInfo':
    return {
      ...state, userInfo: action.payload,
    }
  case 'logout':
    return {
      ...state,
      accessTokenStorage: null,
      refreshTokenStorage: null,
      userInfo: null,
    }
  }
}

export const OauthProvider = ({
  children,
  ...config
}: ProviderProps) => {
  const storage = config.storage === 'localStorage' ? window.localStorage : window.sessionStorage
  const refreshTokenStorage = storage.getItem(StorageKey.RefreshToken)

  const [state, dispatch] = useReducer(
    reducer,
    {
      config,
      userInfo: null,
      accessTokenStorage: null,
      refreshTokenStorage: refreshTokenStorage ? JSON.parse(refreshTokenStorage) as RefreshTokenStorage : null,
    },
  )

  return (
    <oauthContext.Provider
      value={{
        state, dispatch,
      }}
    >
      <Setup />
      {children}
    </oauthContext.Provider>
  )
}
