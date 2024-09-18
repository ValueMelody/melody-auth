import { Context } from 'hono'
import {
  errorConfig, typeConfig,
} from 'configs'
import { scopeDto } from 'dtos'
import {
  appScopeModel, scopeLocaleModel, scopeModel,
} from 'models'

export const getScopes = async (c: Context<typeConfig.Context>): Promise<scopeModel.Record[]> => {
  const scopes = await scopeModel.getAll(c.env.DB)

  return scopes
}

export const getScopeById = async (
  c: Context<typeConfig.Context>,
  id: number,
): Promise<scopeModel.ApiRecord> => {
  const scope = await scopeModel.getById(
    c.env.DB,
    id,
  )

  if (!scope) throw new errorConfig.NotFound()

  const scopeLocales = await scopeLocaleModel.getAllByScope(
    c.env.DB,
    id,
  )

  return {
    ...scope,
    locales: scopeLocales,
  }
}

export const getScopesByName = async (
  c: Context<typeConfig.Context>,
  names: string[],
): Promise<scopeModel.ApiRecord[]> => {
  const scopes = []
  for (const name of names) {
    const scope = await scopeModel.getByName(
      c.env.DB,
      name,
    )
    if (!scope) continue
    const scopeLocales = await scopeLocaleModel.getAllByScope(
      c.env.DB,
      scope.id,
    )
    scopes.push({
      ...scope,
      locales: scopeLocales,
    })
  }
  return scopes
}

export const createScope = async (
  c: Context<typeConfig.Context>,
  dto: scopeDto.PostScopeReqDto,
): Promise<scopeModel.ApiRecord> => {
  const scope = await scopeModel.create(
    c.env.DB,
    {
      name: dto.name,
      type: dto.type,
      note: dto.note,
    },
  )

  const locales = []
  if (dto.locales) {
    for (const localeReq of dto.locales) {
      const scopeLocale = await scopeLocaleModel.create(
        c.env.DB,
        {
          scopeId: scope.id,
          locale: localeReq.locale,
          value: localeReq.value,
        },
      )
      locales.push(scopeLocale)
    }
  }

  return {
    ...scope,
    locales,
  }
}

export const updateScope = async (
  c: Context<typeConfig.Context>,
  scopeId: number,
  dto: scopeDto.PutScopeReqDto,
): Promise<scopeModel.ApiRecord> => {
  const shouldUpdateScope = dto.name !== undefined || dto.note !== undefined
  const scope = await scopeModel.getById(
    c.env.DB,
    scopeId,
  )

  if (!scope) throw new errorConfig.NotFound()

  const updatedScope = shouldUpdateScope
    ? await scopeModel.update(
      c.env.DB,
      scopeId,
      {
        name: dto.name, note: dto.note,
      },
    )
    : scope

  const locales = []
  if (dto.locales) {
    await scopeLocaleModel.remove(
      c.env.DB,
      scopeId,
    )
    for (const localeReq of dto.locales) {
      const scopeLocale = await scopeLocaleModel.create(
        c.env.DB,
        {
          scopeId: scope.id,
          locale: localeReq.locale,
          value: localeReq.value,
        },
      )
      locales.push(scopeLocale)
    }
  }

  const scopeLocales = dto.locales
    ? locales
    : await scopeLocaleModel.getAllByScope(
      c.env.DB,
      scope.id,
    )

  return {
    ...updatedScope,
    locales: scopeLocales,
  }
}

export const deleteScope = async (
  c: Context<typeConfig.Context>,
  scopeId: number,
): Promise<true> => {
  await scopeModel.remove(
    c.env.DB,
    scopeId,
  )
  await appScopeModel.remove(
    c.env.DB,
    scopeId,
  )
  await scopeLocaleModel.remove(
    c.env.DB,
    scopeId,
  )
  return true
}

export const getAppScopes = async (
  c: Context<typeConfig.Context>, appId: number,
): Promise<string[]> => {
  const appScopes = await appScopeModel.getAllByAppId(
    c.env.DB,
    appId,
  )
  const scopeNames = appScopes.map((appScope) => appScope.scopeName)
  return scopeNames
}

export const verifyAppScopes = async (
  c: Context<typeConfig.Context>, appId: number, scopes: string[],
): Promise<string[]> => {
  const validScopes = await getAppScopes(
    c,
    appId,
  )
  return scopes.filter((scope) => validScopes.includes(scope))
}
