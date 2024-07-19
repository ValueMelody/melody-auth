import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  sign, verify,
} from 'hono/jwt'
import { JWTPayload } from 'hono/utils/jwt/types'
import {
  errorConfig, localeConfig, typeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import { userModel } from 'models'

export const getAuthCodeBody = async (
  context: Context<typeConfig.Context>, authCode: string,
) => {
  let authInfo: typeConfig.AuthCodeBody
  try {
    authInfo = await verify(
      authCode,
      context.env.AUTHORIZATION_CODE_JWT_SECRET,
    ) as unknown as typeConfig.AuthCodeBody
  } catch (e) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)
  }

  return authInfo
}

export const genAuthCode = async (
  c: Context<typeConfig.Context>,
  currentTimestamp: number,
  appId: number,
  request: oauthDto.GetAuthorizeReqQueryDto,
  user: userModel.Record,
) => {
  const {
    AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn,
    AUTHORIZATION_CODE_JWT_SECRET: jwtSecret,
  } = env(c)
  const codeExpiresAt = currentTimestamp + codeExpiresIn
  const authBody: typeConfig.AuthCodeBody = {
    request,
    user: {
      id: user.id,
      authId: user.authId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    appId,
    exp: codeExpiresAt,
  }

  const authCode = await sign(
    authBody as unknown as JWTPayload,
    jwtSecret,
  )

  return { authCode }
}

export const getRefreshTokenBody = async (
  context: Context<typeConfig.Context>, refreshToken: string,
) => {
  let refreshTokenBody: typeConfig.RefreshTokenBody
  try {
    refreshTokenBody = await verify(
      refreshToken,
      context.env.REFRESH_TOKEN_JWT_SECRET,
    ) as unknown as typeConfig.RefreshTokenBody
  } catch (e) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongRefreshToken)
  }

  return refreshTokenBody
}

export const getAccessTokenBody = async (
  context: Context<typeConfig.Context>,
  type: typeConfig.ClientType,
  accessToken: string,
) => {
  const {
    SPA_ACCESS_TOKEN_JWT_SECRET,
    S2S_ACCESS_TOKEN_JWT_SECRET,
  } = env(context)
  const jwtSecret = type === typeConfig.ClientType.SPA
    ? SPA_ACCESS_TOKEN_JWT_SECRET
    : S2S_ACCESS_TOKEN_JWT_SECRET

  let accessTokenBody: typeConfig.AccessTokenBody
  try {
    accessTokenBody = await verify(
      accessToken,
      jwtSecret,
    ) as unknown as typeConfig.AccessTokenBody
  } catch (e) {
    throw new errorConfig.UnAuthorized()
  }

  return accessTokenBody
}

export const genAccessToken = async (
  context: Context<typeConfig.Context>,
  type: typeConfig.ClientType,
  currentTimestamp: number,
  sub: string,
  scope: string,
) => {
  const {
    SPA_ACCESS_TOKEN_EXPIRES_IN,
    S2S_ACCESS_TOKEN_EXPIRES_IN,
    SPA_ACCESS_TOKEN_JWT_SECRET,
    S2S_ACCESS_TOKEN_JWT_SECRET,
  } = env(context)

  const isSpa = type === typeConfig.ClientType.SPA
  const accessTokenExpiresIn = isSpa
    ? SPA_ACCESS_TOKEN_EXPIRES_IN
    : S2S_ACCESS_TOKEN_EXPIRES_IN
  const accessTokenSecret = isSpa
    ? SPA_ACCESS_TOKEN_JWT_SECRET
    : S2S_ACCESS_TOKEN_JWT_SECRET
  const accessTokenExpiresAt = currentTimestamp + accessTokenExpiresIn
  const accessTokenBody: typeConfig.AccessTokenBody = {
    sub,
    scope,
    iat: currentTimestamp,
    exp: accessTokenExpiresAt,
  }
  const accessToken = await sign(
    accessTokenBody as unknown as JWTPayload,
    accessTokenSecret,
  )
  return {
    accessToken,
    accessTokenExpiresIn,
    accessTokenExpiresAt,
  }
}

export const genRefreshToken = async (
  c: Context<typeConfig.Context>,
  currentTimestamp: number,
  authId: string,
  clientId: string,
  scope: string,
) => {
  const {
    SPA_REFRESH_TOKEN_EXPIRES_IN: refreshTokenExpiresIn,
    REFRESH_TOKEN_JWT_SECRET: jwtSecret,
  } = env(c)
  const refreshTokenExpiresAt = currentTimestamp + refreshTokenExpiresIn
  const refreshTokenBody: typeConfig.RefreshTokenBody = {
    sub: authId,
    azp: clientId,
    scope,
    iat: currentTimestamp,
    exp: refreshTokenExpiresAt,
  }
  const refreshToken = await sign(
    refreshTokenBody as unknown as JWTPayload,
    jwtSecret,
  )
  return {
    refreshToken,
    refreshTokenExpiresIn,
    refreshTokenExpiresAt,
  }
}

export const genIdToken = async (
  c: Context<typeConfig.Context>,
  currentTimestamp: number,
  authInfo: typeConfig.AuthCodeBody,
) => {
  const {
    ID_TOKEN_EXPIRES_IN: idTokenExpiresIn,
    ID_TOKEN_JWT_SECRET: jwtSecret,
    AUTH_SERVER_URL: authServerUrl,
  } = env(c)
  const idTokenExpiresAt = currentTimestamp + idTokenExpiresIn
  const idToken = await sign(
    {
      iss: authServerUrl,
      sub: authInfo.user.authId,
      azp: authInfo.request.clientId,
      exp: idTokenExpiresAt,
      iat: currentTimestamp,
      email: authInfo.user.email,
      first_name: authInfo.user.firstName,
      last_name: authInfo.user.lastName,
    },
    jwtSecret,
  )
  return { idToken }
}
