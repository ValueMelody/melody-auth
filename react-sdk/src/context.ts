import {
  createContext, Dispatch,
} from 'react'
import {
  AccessTokenStorage, RefreshTokenStorage,
} from 'web-sdk/dist/definitions'
import { ProviderConfig } from '../../global'

export interface OauthState {
  config: ProviderConfig;
  refreshTokenStorage: RefreshTokenStorage | null;
  accessTokenStorage: AccessTokenStorage | null;
  isLoading: boolean;
}

export type DispatchAction =
  | { type: 'setIsLoading'; payload: boolean }
  | { type: 'setRefreshTokenStorage'; payload: RefreshTokenStorage | null }
  | { type: 'setAccessTokenStorage'; payload: AccessTokenStorage | null }

export type OauthDispatch = Dispatch<DispatchAction>

export interface OauthContext {
  state: OauthState;
  dispatch: OauthDispatch;
}

const oauthContext = createContext<OauthContext>({} as OauthContext)

export default oauthContext
