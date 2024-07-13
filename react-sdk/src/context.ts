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
}

export type DispatchAction =
  | { type: 'setRefreshTokenStorage'; payload: RefreshTokenStorage | null }
  | { type: 'setAccessTokenStorage'; payload: AccessTokenStorage | null }
  | { type: 'setUserInfo'; payload: GetUserInfo | null }
  | { type: 'logout' }

export type OauthDispatch = Dispatch<DispatchAction>

export interface OauthContext {
  state: OauthState;
  dispatch: OauthDispatch;
}

const oauthContext = createContext<OauthContext>({} as OauthContext)

export default oauthContext
