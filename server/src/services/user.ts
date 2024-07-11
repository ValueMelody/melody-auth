import {
  errorConfig, localeConfig,
} from 'configs'
import { userModel } from 'models'

export const getUserInfo = async (
  db: D1Database, oauthId: string,
) => {
  const user = await userModel.getByOauthId(
    db,
    oauthId,
  )
  if (!user) throw new errorConfig.Forbidden(localeConfig.Error.NoUser)
  return user
}

export const verifyPasswordSignIn = async (
  db: D1Database, email: string, password: string,
) => {
  const user = await userModel.getByEmailAndPassword(
    db,
    email,
    password,
  )
  if (!user) throw new errorConfig.Forbidden(localeConfig.Error.NoUser)
  return user
}
