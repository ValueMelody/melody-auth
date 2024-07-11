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
  request: oauthDto.GetAuthorizeReqQueryDto,
  user: userModel.Record,
) => {
  const { AUTHORIZATION_CODE_EXPIRES_IN } = env(c)
  const codeExpiresIn = Number(AUTHORIZATION_CODE_EXPIRES_IN)
  const codeExpiresAt = currentTimestamp + codeExpiresIn
  const authBody: typeConfig.AuthCodeBody = {
    request,
    user: {
      oauthId: user.oauthId,
      email: user.email,
    },
    exp: codeExpiresAt,
  }

  const authCode = await sign(
    authBody as unknown as JWTPayload,
    c.env.AUTHORIZATION_CODE_JWT_SECRET,
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
  context: Context<typeConfig.Context>, accessToken: string,
) => {
  let accessTokenBody: typeConfig.AccessTokenBody
  try {
    accessTokenBody = await verify(
      accessToken,
      context.env.ACCESS_TOKEN_JWT_SECRET,
    ) as unknown as typeConfig.AccessTokenBody
  } catch (e) {
    throw new errorConfig.UnAuthorized()
  }

  return accessTokenBody
}

export const genAccessToken = async (
  c: Context<typeConfig.Context>,
  currentTimestamp: number,
  oauthId: string,
  scope: string[],
) => {
  const { ACCESS_TOKEN_EXPIRES_IN } = env(c)
  const accessTokenExpiresIn = Number(ACCESS_TOKEN_EXPIRES_IN)
  const accessTokenExpiresAt = currentTimestamp + accessTokenExpiresIn
  const accessTokenBody: typeConfig.AccessTokenBody = {
    sub: oauthId,
    scope,
    exp: accessTokenExpiresAt,
  }
  const accessToken = await sign(
    accessTokenBody as unknown as JWTPayload,
    c.env.ACCESS_TOKEN_JWT_SECRET,
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
  oauthId: string,
  scope: string[],
) => {
  const { REFRESH_TOKEN_EXPIRES_IN } = env(c)
  const refreshTokenExpiresIn = Number(REFRESH_TOKEN_EXPIRES_IN)
  const refreshTokenExpiresAt = currentTimestamp + refreshTokenExpiresIn
  const refreshTokenBody: typeConfig.RefreshTokenBody = {
    sub: oauthId,
    scope,
    exp: refreshTokenExpiresAt,
  }
  const refreshToken = await sign(
    refreshTokenBody as unknown as JWTPayload,
    c.env.REFRESH_TOKEN_JWT_SECRET,
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
  clientId: string,
  oauthId: string,
  email: string | null,
) => {
  const { ID_TOKEN_EXPIRES_IN } = env(c)
  const idTokenExpiresIn = Number(ID_TOKEN_EXPIRES_IN)
  const idTokenExpiresAt = currentTimestamp + idTokenExpiresIn
  const idToken = await sign(
    {
      iss: 'Melody Oauth',
      sub: oauthId,
      aud: clientId,
      exp: idTokenExpiresAt,
      iat: currentTimestamp,
      email,
    },
    c.env.ID_TOKEN_JWT_SECRET,
  )
  return { idToken }
}
