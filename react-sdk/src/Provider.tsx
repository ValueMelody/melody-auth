import React, {
  ReactNode, useReducer,
} from 'react'
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
  case 'setIsLoading':
    return {
      ...state, isLoading: action.payload,
    }
  case 'setAccessTokenStorage':
    return {
      ...state, accessTokenStorage: action.payload,
    }
  case 'setRefreshTokenStorage':
    return {
      ...state, refreshTokenStorage: action.payload,
    }
  }
}

export const OauthProvider = ({
  children,
  ...config
}: ProviderProps) => {
  const [state, dispatch] = useReducer(
    reducer,
    {
      config,
      isLoading: true,
      accessTokenStorage: null,
      refreshTokenStorage: null,
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
