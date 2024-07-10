import {
  errorConfig, localeConfig,
} from 'configs'
import {
  appModel, userModel,
} from 'models'

export const getAppEntity = async (
  db: D1Database, clientId: string, redirectUri: string,
) => {
  const app = await appModel.getByClientId(
    db,
    clientId,
  )
  if (!app) throw new errorConfig.Forbidden(localeConfig.Error.NoApp)
  if (!app.redirectUris.includes(redirectUri)) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.WrongRedirectUri)
  }
  return app
}

export const getUserEntityByEmailAndPassword = async (
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
