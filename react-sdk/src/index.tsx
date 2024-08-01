import { GetUserInfoRes } from 'shared'
import { AuthProvider } from './Provider'
import { useAuth } from './useAuth'
import { ErrorType } from './utils'

export type UserInfo = GetUserInfoRes

export {
  AuthProvider,
  useAuth,
  ErrorType,
}
