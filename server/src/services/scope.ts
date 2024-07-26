import { Context } from 'hono'
import {
  errorConfig, typeConfig,
} from 'configs'
import {
  oauthDto, scopeDto,
} from 'dtos'
import {
  appScopeModel, scopeModel,
} from 'models'
import { appService } from 'services'
import { validateUtil } from 'utils'

export const getScopes = async (
  c: Context<typeConfig.Context>,
  includeDeleted: boolean = false,
) => {
  const roles = await scopeModel.getAll(
    c.env.DB,
    includeDeleted,
  )

  return roles
}

export const getScopeById = async (
  c: Context<typeConfig.Context>,
  id: number,
  includeDeleted: boolean = false,
) => {
  const scope = await scopeModel.getById(
    c.env.DB,
    id,
    includeDeleted,
  )

  if (!scope) throw new errorConfig.NotFound()

  return scope
}

export const createScope = async (
  c: Context<typeConfig.Context>,
  dto: scopeDto.PostScopeReqDto,
) => {
  const scope = await scopeModel.create(
    c.env.DB,
    {
      name: dto.name, type: dto.type,
    },
  )
  return scope
}

export const updateScope = async (
  c: Context<typeConfig.Context>,
  scopeId: number,
  dto: scopeDto.PutScopeReqDto,
) => {
  const role = await scopeModel.update(
    c.env.DB,
    scopeId,
    { name: dto.name },
  )
  return role
}

export const getAppScopes = async (
  c: Context<typeConfig.Context>, appId: number,
) => {
  const appScopes = await appScopeModel.getAllByAppId(
    c.env.DB,
    appId,
  )
  const scopeNames = appScopes.map((appScope) => appScope.scopeName)
  return scopeNames
}

export const verifyAppScopes = async (
  c: Context<typeConfig.Context>, appId: number, scopes: string[],
) => {
  const validScopes = await getAppScopes(
    c,
    appId,
  )
  return scopes.filter((scope) => validScopes.includes(scope))
}

export const parseGetAuthorizeDto = async (c: Context<typeConfig.Context>) => {
  const queryDto = new oauthDto.GetAuthorizeReqDto({
    clientId: c.req.query('client_id') ?? '',
    redirectUri: c.req.query('redirect_uri') ?? '',
    responseType: c.req.query('response_type') ?? '',
    state: c.req.query('state') ?? '',
    codeChallenge: c.req.query('code_challenge') ?? '',
    codeChallengeMethod: c.req.query('code_challenge_method') ?? '',
    scopes: c.req.query('scope')?.split(' ') ?? [],
  })
  await validateUtil.dto(queryDto)

  const app = await appService.verifySPAClientRequest(
    c,
    queryDto.clientId,
    queryDto.redirectUri,
  )

  const validScopes = await verifyAppScopes(
    c,
    app.id,
    queryDto.scopes,
  )

  return {
    ...queryDto,
    scopes: validScopes,
  }
}
