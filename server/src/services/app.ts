import {
  errorConfig, localeConfig,
} from 'configs'
import { appModel } from 'models'

export const verifyClientRequest = async (
  db: D1Database, clientId: string, redirectUri: string,
) => {
  const app = await appModel.getByClientId(
    db,
    clientId,
  )
  if (!app) {
    throw new errorConfig.Forbidden(localeConfig.Error.NoApp)
  }
  if (!app.redirectUris.includes(redirectUri)) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.WrongRedirectUri)
  }
  return app
}
