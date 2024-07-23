import { Context } from 'hono'
import { ClientType } from 'shared'
import {
  errorConfig, localeConfig,
  typeConfig,
} from 'configs'
import { appModel } from 'models'
import {
  formatUtil, timeUtil,
} from 'utils'

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

  if (app.type !== ClientType.SPA) {
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
  if (app.type !== ClientType.S2S) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.WrongClientType)
  }
  if (app.secret !== clientSecret) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.WrongClientSecret)
  }
  return app
}

export const getApps = async (
  c: Context<typeConfig.Context>,
  includeDeleted: boolean = false,
) => {
  const apps = await appModel.getAll(
    c.env.DB,
    includeDeleted,
  )

  return apps
}

export const getAppById = async (
  c: Context<typeConfig.Context>,
  id: number,
  includeDeleted: boolean = false,
) => {
  const app = await appModel.getById(
    c.env.DB,
    id,
    includeDeleted,
  )

  if (!app) throw new errorConfig.NotFound()

  return app
}

export const enableApp = async (
  c: Context<typeConfig.Context>,
  id: number,
) => {
  const includeDeleted = true
  const app = await getAppById(
    c,
    id,
    includeDeleted,
  )

  if (!app.deletedAt) throw new errorConfig.NotFound(localeConfig.Error.NoApp)

  await appModel.update(
    c.env.DB,
    app.id,
    { deletedAt: null },
  )
}

export const disableApp = async (
  c: Context<typeConfig.Context>,
  id: number,
) => {
  const app = await getAppById(
    c,
    id,
  )

  await appModel.update(
    c.env.DB,
    app.id,
    { deletedAt: timeUtil.getDbCurrentTime() },
  )
}
