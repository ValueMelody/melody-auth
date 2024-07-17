import {
  createContext, Dispatch,
} from 'react'
import {
  AccessTokenStorage, RefreshTokenStorage,
} from 'web-sdk/dist/definitions'
import {
  GetUserInfo, ProviderConfig,
} from '../../global'

export interface AuthState {
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

export type AuthDispatch = Dispatch<DispatchAction>

export interface AuthContext {
  state: AuthState;
  dispatch: AuthDispatch;
}

const authContext = createContext<AuthContext>({} as AuthContext)

export default authContext
