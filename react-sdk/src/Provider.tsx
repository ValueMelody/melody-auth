import React, {
  ReactNode, useReducer,
} from 'react'
import { ProviderConfig } from '../../global'
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
    },
  )

  return (
    <oauthContext.Provider
      value={{
        state, dispatch,
      }}
    >
      {children}
    </oauthContext.Provider>
  )
}
