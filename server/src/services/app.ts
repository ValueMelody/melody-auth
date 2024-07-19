import { Context } from 'hono'
import {
  errorConfig, localeConfig,
  typeConfig,
} from 'configs'
import { appModel } from 'models'
import { formatUtil } from 'utils'

export const verifySPAClientRequest = async (
  c: Context<typeConfig.Context>, clientId: string, redirectUri: string,
) => {
  const app = await appModel.getByClientId(
    c.env.DB,
    clientId,
  )
  if (!app) {
    throw new errorConfig.Forbidden(localeConfig.Error.NoApp)
  }

  if (app.type !== typeConfig.ClientType.SPA) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.WrongClientType)
  }
  if (!app.redirectUris.includes(formatUtil.stripEndingSlash(redirectUri))) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.WrongRedirectUri)
  }
  return app
}

export const verifyS2SClientRequest = async (
  c: Context<typeConfig.Context>, clientId: string, clientSecret: string,
) => {
  const app = await appModel.getByClientId(
    c.env.DB,
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
