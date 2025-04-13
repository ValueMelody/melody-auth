import {
  GetUserInfoRes, ErrorType,
} from 'shared'
import { AuthService } from './auth.service'
import { provideAuth } from './auth.provider'

export type UserInfo = GetUserInfoRes

export {
  AuthService,
  provideAuth,
  ErrorType,
}
