import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  sign, verify,
} from 'hono/jwt'
import { JWTPayload } from 'hono/utils/jwt/types'
import { ClientType } from 'shared'
import {
  errorConfig, typeConfig,
} from 'configs'
import { kvService } from 'services'

export const getAccessTokenBody = async (
  context: Context<typeConfig.Context>,
  type: ClientType,
  accessToken: string,
) => {
  const publicSecret = await kvService.getJwtPublicSecret(context.env.KV)

  let accessTokenBody: typeConfig.AccessTokenBody
  try {
    accessTokenBody = await verify(
      accessToken,
      publicSecret,
      'RS256',
    ) as unknown as typeConfig.AccessTokenBody
  } catch (e) {
    throw new errorConfig.UnAuthorized()
  }

  return accessTokenBody
}

export const genAccessToken = async (
  context: Context<typeConfig.Context>,
  type: ClientType,
  currentTimestamp: number,
  sub: string,
  azp: string,
  scope: string,
  roles?: string[] | null,
) => {
  const {
    SPA_ACCESS_TOKEN_EXPIRES_IN,
    S2S_ACCESS_TOKEN_EXPIRES_IN,
  } = env(context)

  const isSpa = type === ClientType.SPA
  const accessTokenExpiresIn = isSpa
    ? SPA_ACCESS_TOKEN_EXPIRES_IN
    : S2S_ACCESS_TOKEN_EXPIRES_IN
  const privateSecret = await kvService.getJwtPrivateSecret(context.env.KV)
  const accessTokenExpiresAt = currentTimestamp + accessTokenExpiresIn
  const accessTokenBody: typeConfig.AccessTokenBody = {
    sub,
    azp,
    scope,
    iat: currentTimestamp,
    exp: accessTokenExpiresAt,
  }
  if (roles) accessTokenBody.roles = roles

  const accessToken = await sign(
    accessTokenBody as unknown as JWTPayload,
    privateSecret,
    'RS256',
  )
  return {
    accessToken,
    accessTokenExpiresIn,
    accessTokenExpiresAt,
  }
}

export const genIdToken = async (
  c: Context<typeConfig.Context>,
  currentTimestamp: number,
  authInfo: typeConfig.AuthCodeBody,
  roles: string[],
) => {
  const {
    ID_TOKEN_EXPIRES_IN: idTokenExpiresIn,
    AUTH_SERVER_URL: authServerUrl,
  } = env(c)
  const idTokenExpiresAt = currentTimestamp + idTokenExpiresIn
  const body: typeConfig.IdTokenBody = {
    iss: authServerUrl,
    sub: authInfo.user.authId,
    azp: authInfo.request.clientId,
    exp: idTokenExpiresAt,
    iat: currentTimestamp,
    email: authInfo.user.email,
    first_name: authInfo.user.firstName,
    last_name: authInfo.user.lastName,
  }
  body.roles = roles

  const privateSecret = await kvService.getJwtPrivateSecret(c.env.KV)

  const idToken = await sign(
    body as unknown as JWTPayload,
    privateSecret,
    'RS256',
  )
  return { idToken }
}
