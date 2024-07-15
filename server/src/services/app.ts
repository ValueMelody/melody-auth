import {
  errorConfig, localeConfig,
  typeConfig,
} from 'configs'
import { appModel } from 'models'

export const verifySPAClientRequest = async (
  db: D1Database, clientId: string, redirectUri: string,
) => {
  const app = await appModel.getByClientId(
    db,
    clientId,
  )
  if (!app) {
    throw new errorConfig.Forbidden(localeConfig.Error.NoApp)
  }

  if (app.type !== typeConfig.ClientType.SPA) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.WrongClientType)
  }
  if (!app.redirectUris.includes(redirectUri)) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.WrongRedirectUri)
  }
  return app
}

export const verifyS2SClientRequest = async (
  db: D1Database, clientId: string, clientSecret: string,
) => {
  const app = await appModel.getByClientId(
    db,
    clientId,
  )
  if (!app) {
    throw new errorConfig.Forbidden(localeConfig.Error.NoApp)
  }
  if (app.type !== typeConfig.ClientType.S2S) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.WrongClientType)
  }
  if (app.secret !== clientSecret) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.WrongClientSecret)
  }
  return app
}
