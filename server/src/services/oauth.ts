import {
  errorConfig, localeConfig,
} from 'configs'
import { appModel } from 'models'

export const verifyApp = async (
  clientId: string, redirectUri: string, db: D1Database,
) => {
  const app = await appModel.getByClientId(
    db,
    clientId,
  )
  if (!app) throw new errorConfig.Forbidden(localeConfig.Error.NoApp)
  if (!app.redirectUris.includes(redirectUri)) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.WrongRedirectUri)
  }
}
