import {
  GetUserInfoRes, ErrorType,
} from '@melody-auth/shared'
import { AuthService } from './auth.service'
import { provideAuth } from './auth.provider'

export type UserInfo = GetUserInfoRes

export {
  AuthService,
  provideAuth,
  ErrorType,
}
