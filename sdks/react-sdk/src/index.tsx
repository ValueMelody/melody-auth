import {
  GetUserInfoRes, ErrorType,
} from '@melody-auth/shared'
import { AuthProvider, ProviderProps } from './Provider'
import { useAuth } from './useAuth'

export type UserInfo = GetUserInfoRes

export {
  AuthProvider,
  ProviderProps,
  useAuth,
  ErrorType,
}
