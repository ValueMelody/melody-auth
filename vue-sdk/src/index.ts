import {
  GetUserInfoRes, ErrorType,
} from 'shared'
import { AuthProvider } from './plugin'
import { useAuth } from './useAuth'

export type UserInfo = GetUserInfoRes

export {
  AuthProvider,
  useAuth,
  ErrorType,
}
