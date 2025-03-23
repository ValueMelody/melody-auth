import { Context } from 'hono'
import { ClientType } from 'shared'
import {
  errorConfig,
  messageConfig,
  typeConfig,
} from 'configs'
import {
  appModel, appScopeModel, scopeModel,
} from 'models'
import {
  requestUtil, timeUtil, loggerUtil,
} from 'utils'
import { scopeService } from 'services'
import { appDto } from 'dtos'

export const verifySPAClientRequest = async (
  c: Context<typeConfig.Context>,
  clientId: string,
  redirectUri: string,
): Promise<appModel.Record> => {
  const app = await appModel.getByClientId(
    c.env.DB,
    clientId,
  )

  if (!app) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoSpaAppFound,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoSpaAppFound)
  }
  if (!app.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.SpaAppDisabled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.SpaAppDisabled)
  }

  if (app.type !== ClientType.SPA) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NotSpaTypeApp,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.NotSpaTypeApp)
  }
  if (!app.redirectUris.includes(requestUtil.stripEndingSlash(redirectUri))) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongRedirectUri,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.WrongRedirectUri)
  }
  return app
}

export const verifyS2SClientRequest = async (
  c: Context<typeConfig.Context>,
  clientId: string,
  clientSecret: string,
): Promise<appModel.Record> => {
  const app = await appModel.getByClientId(
    c.env.DB,
    clientId,
  )
  if (!app) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoS2sAppFound,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoS2sAppFound)
  }
  if (!app.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.S2sAppDisabled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.S2sAppDisabled)
  }

  if (app.type !== ClientType.S2S) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NotS2sTypeApp,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.NotS2sTypeApp)
  }
  if (app.secret !== clientSecret) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongS2sClientSecret,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.WrongS2sClientSecret)
  }
  return app
}

export const getApps = async (c: Context<typeConfig.Context>): Promise<appModel.Record[]> => {
  const apps = await appModel.getAll(c.env.DB)

  return apps
}

export const getAppById = async (
  c: Context<typeConfig.Context>,
  id: number,
): Promise<appModel.ApiRecord> => {
  const app = await appModel.getById(
    c.env.DB,
    id,
  )

  if (!app) throw new errorConfig.NotFound()

  const scopes = await scopeService.getAppScopes(
    c,
    app.id,
  )

  return {
    ...app, scopes,
  }
}

export const createApp = async (
  c: Context<typeConfig.Context>,
  dto: appDto.PostAppDto,
): Promise<appModel.ApiRecord> => {
  const app = await appModel.create(
    c.env.DB,
    {
      name: dto.name,
      type: dto.type,
      redirectUris: dto.redirectUris.join(','),
    },
  )

  const scopes = dto.scopes
  const allScopes = scopes.length ? await scopeModel.getAll(c.env.DB) : []
  const targetScopes = allScopes.filter((scope) => scopes.includes(scope.name))
  for (const scope of targetScopes) {
    await appScopeModel.create(
      c.env.DB,
      {
        appId: app.id, scopeId: scope.id,
      },
    )
  }

  return {
    ...app,
    scopes: targetScopes.map((scope) => scope.name),
  }
}

export const updateApp = async (
  c: Context<typeConfig.Context>,
  appId: number,
  dto: appDto.PutAppDto,
): Promise<appModel.ApiRecord> => {
  const updateDto: appModel.Update = {
    redirectUris: dto.redirectUris ? dto.redirectUris.join(',') : undefined,
    name: dto.name,
  }
  if (dto.isActive !== undefined) updateDto.isActive = dto.isActive ? 1 : 0

  const app = await appModel.getById(
    c.env.DB,
    appId,
  )

  if (!app) throw new errorConfig.NotFound()

  const updatedApp = Object.values(updateDto).some((val) => val !== undefined)
    ? await appModel.update(
      c.env.DB,
      appId,
      updateDto,
    )
    : app

  const appScopes = await appScopeModel.getAllByAppId(
    c.env.DB,
    app.id,
  )

  if (dto.scopes) {
    const scopesToDelete = appScopes.filter((appScope) => !dto.scopes?.includes(appScope.scopeName))

    const allScopes = await scopeModel.getAll(c.env.DB)
    const scopeNamesToCreate = dto.scopes.filter((scope) => appScopes.every((appScope) => appScope.scopeName !== scope))
    const scopesToCreate = scopeNamesToCreate.map((name) => {
      const matched = allScopes.find((scope) => scope.name === name)
      if (!matched) throw new errorConfig.InternalServerError()
      return matched
    })

    const currentTime = timeUtil.getDbCurrentTime()
    for (const scopeToDelete of scopesToDelete) {
      await appScopeModel.update(
        c.env.DB,
        scopeToDelete.id,
        { deletedAt: currentTime },
      )
    }
    for (const scopeToCreate of scopesToCreate) {
      await appScopeModel.create(
        c.env.DB,
        {
          appId: app.id, scopeId: scopeToCreate.id,
        },
      )
    }
  }

  return {
    ...updatedApp,
    scopes: dto.scopes ?? appScopes.map((appScope) => appScope.scopeName),
  }
}

export const deleteApp = async (
  c: Context<typeConfig.Context>,
  appId: number,
): Promise<true> => {
  await appModel.remove(
    c.env.DB,
    appId,
  )
  return true
}
