import { Context } from 'hono'
import { typeConfig } from 'configs'
import { appModel } from 'models'

export const stripEndingSlash = (val: string) => {
  return val.replace(
    /\/$/,
    '',
  )
}

export const getValidScopes = (
  scopes: string[], app: appModel.Record,
) => scopes.filter((scope) => app.scopes.includes(scope))

export const getQueryString = (c: Context<typeConfig.Context>) => c.req.url.split('?')[1]

export const getAuthInfoSessionKeyByClientId = (clientId: string) => {
  return `${typeConfig.SessionKey.AuthInfo}-${clientId}`
}
