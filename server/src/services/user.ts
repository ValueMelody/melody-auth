import {
  errorConfig, localeConfig,
} from 'configs'
import { Forbidden } from 'configs/error'
import { userModel } from 'models'

export const getUserInfo = async (
  db: D1Database, oauthId: string,
) => {
  const user = await userModel.getByOauthId(
    db,
    oauthId,
  )
  if (!user) {
    throw new errorConfig.Forbidden(localeConfig.Error.NoUser)
  }
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
  if (!user) {
    throw new errorConfig.Forbidden(localeConfig.Error.NoUser)
  }
  return user
}

export const createAccountWithPassword = async (
  db: D1Database, email: string, password: string, firstName: string | null, lastName: string | null,
) => {
  const includeDeleted = true
  const user = await userModel.getByEmail(
    db,
    email,
    includeDeleted,
  )
  if (user && !user.deletedAt) throw new Forbidden(localeConfig.Error.EmailTaken)

  const newUser = user
    ? await userModel.update(
      db,
      user.id,
      {
        password, firstName, lastName, deletedAt: null,
      },
    )
    : await userModel.create(
      db,
      {
        oauthId: crypto.randomUUID(),
        email,
        password,
        firstName,
        lastName,
      },
    )

  if (!newUser) {
    throw new errorConfig.InternalServerError(localeConfig.Error.CanNotCreateUser)
  }
  return newUser
}
