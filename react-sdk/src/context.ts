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
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  authenticationError: string;
  checkedStorage: boolean;
  userInfo: GetUserInfoRes | null;
  isLoadingUserInfo: boolean;
  acquireUserInfoError: string;
  accessTokenStorage: AccessTokenStorage | null;
  isLoadingToken: boolean;
  acquireTokenError: string;
  loginError: string;
  logoutError: string;
}

export type DispatchAction =
  | { type: 'setRefreshTokenStorage'; payload: RefreshTokenStorage }
  | { type: 'setAccessTokenStorage'; payload: AccessTokenStorage }
  | { type: 'setUserInfo'; payload: GetUserInfoRes | null }
  | { type: 'setIsAuthenticating'; payload: boolean }
  | { type: 'setCheckedStorage'; payload: boolean }
  | { type: 'setIsLoadingUserInfo'; payload: boolean }
  | { type: 'setAcquireUserInfoError'; payload: string }
  | { type: 'setIsLoadingToken'; payload: boolean }
  | { type: 'setAcquireTokenError'; payload: string }
  | { type: 'setAuthenticationError'; payload: string }
  | { type: 'setLoginError'; payload: string }
  | { type: 'setLogoutError'; payload: string }

export type AuthDispatch = Dispatch<DispatchAction>

export interface AuthContext {
  state: AuthState;
  dispatch: AuthDispatch;
}

const authContext = createContext<AuthContext>({} as AuthContext)

export default authContext
