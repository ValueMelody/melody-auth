import { GetUserInfoRes } from 'shared'
import { AuthProvider } from './Provider'
import { useAuth } from './useAuth'

export type UserInfo = GetUserInfoRes

export {
  AuthProvider,
  useAuth,
}
