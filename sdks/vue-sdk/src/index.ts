import {
  GetUserInfoRes, ErrorType,
} from '@melody-auth/shared'
import { AuthProvider } from './plugin'
import { useAuth } from './useAuth'

export type UserInfo = GetUserInfoRes

export {
  AuthProvider,
  useAuth,
  ErrorType,
}
