import {
  createContext, Dispatch,
} from 'react'
import {
  AccessTokenStorage, RefreshTokenStorage,
} from 'web-sdk/dist/definitions'
import {
  GetUserInfo, ProviderConfig,
} from '../../global'

export interface OauthState {
  config: ProviderConfig;
  refreshTokenStorage: RefreshTokenStorage | null;
  accessTokenStorage: AccessTokenStorage | null;
  userInfo: GetUserInfo | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
}

export type DispatchAction =
  | { type: 'setRefreshTokenStorage'; payload: RefreshTokenStorage }
  | { type: 'setAccessTokenStorage'; payload: AccessTokenStorage }
  | { type: 'setUserInfo'; payload: GetUserInfo | null }
  | { type: 'setIsAuthenticating'; payload: boolean }
  | { type: 'logout' }

export type OauthDispatch = Dispatch<DispatchAction>

export interface OauthContext {
  state: OauthState;
  dispatch: OauthDispatch;
}

const oauthContext = createContext<OauthContext>({} as OauthContext)

export default oauthContext
