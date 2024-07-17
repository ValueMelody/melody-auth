import { GetUserInfo } from '../../global'
import { AuthProvider } from './Provider'
import { useAuth } from './useAuth'

export type UserInfo = GetUserInfo

export {
  AuthProvider,
  useAuth,
}
