import {
  createContext, Dispatch,
} from 'react'
import {
  GetUserInfoRes, ProviderConfig,
  AccessTokenStorage, RefreshTokenStorage,
} from 'shared'

export interface AuthState {
  config: ProviderConfig;
  refreshTokenStorage: RefreshTokenStorage | null;
  accessTokenStorage: AccessTokenStorage | null;
  userInfo: GetUserInfoRes | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
}

export type DispatchAction =
  | { type: 'setRefreshTokenStorage'; payload: RefreshTokenStorage }
  | { type: 'setAccessTokenStorage'; payload: AccessTokenStorage }
  | { type: 'setUserInfo'; payload: GetUserInfoRes | null }
  | { type: 'setIsAuthenticating'; payload: boolean }

export type AuthDispatch = Dispatch<DispatchAction>

export interface AuthContext {
  state: AuthState;
  dispatch: AuthDispatch;
}

const authContext = createContext<AuthContext>({} as AuthContext)

export default authContext
