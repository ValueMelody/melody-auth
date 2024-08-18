import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  sign, verify, decode,
} from 'hono/jwt'
import { JWTPayload } from 'hono/utils/jwt/types'
import {
  ClientType, IdTokenBody,
} from 'shared'
import { SignatureKey } from 'hono/utils/jwt/jws'
import {
  errorConfig, typeConfig,
} from 'configs'
import { kvService } from 'services'

export const getAccessTokenBody = async (
  context: Context<typeConfig.Context>,
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
  const body: IdTokenBody = {
    iss: authServerUrl,
    sub: authInfo.user.authId,
    azp: authInfo.request.clientId,
    exp: idTokenExpiresAt,
    iat: currentTimestamp,
    email: authInfo.user.email,
    locale: authInfo.user.locale,
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

export interface GoogleUser {
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  id: string;
}

export const verifyGoogleCredential = async (credential: string) => {
  const decoded = decode(credential)
  const header = decoded.header as unknown as { kid: string }

  const response = await fetch('https://www.googleapis.com/oauth2/v3/certs')
  const certs = await response.json() as { keys: { kid: string }[] }
  const publicKey = certs.keys.find((key) => key.kid === header.kid)
  const result = await verify(
    credential,
    publicKey as unknown as SignatureKey,
    'RS256',
  )
  if ('iss' in result && result.iss === 'https://accounts.google.com' && 'email' in result) {
    const user = {
      firstName: result.given_name,
      lastName: result.family_name,
      email: result.email,
      emailVerified: result.email_verified,
      id: result.sub,
    } as GoogleUser
    return user
  }

  return undefined
}
