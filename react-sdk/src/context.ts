import {
  createContext, Dispatch,
} from 'react'
import {
  GetUserInfoRes,
  AccessTokenStorage, RefreshTokenStorage,
  IdTokenBody, AuthState as SdkAuthState,
} from 'shared'

export interface AuthState extends SdkAuthState {}

export type DispatchAction =
  | { type: 'setAuth'; payload: {
    refreshTokenStorage: RefreshTokenStorage;
    idTokenBody: IdTokenBody | null;
  }; }
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
