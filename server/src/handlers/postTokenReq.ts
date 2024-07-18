import { Context } from 'hono'
import { typeConfig } from 'configs'
import { oauthDto } from 'dtos'
import { validateUtil } from 'utils'

export const parseAuthCode = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.parseBody()

  const bodyDto = new oauthDto.PostTokenAuthCodeReqBodyDto({
    grantType: String(reqBody.grant_type),
    code: String(reqBody.code),
    codeVerifier: String(reqBody.code_verifier),
  })
  await validateUtil.dto(bodyDto)

  return bodyDto
}

export const parseRefreshToken = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.parseBody()

  const bodyDto = new oauthDto.PostTokenRefreshTokenReqBodyDto({
    grantType: String(reqBody.grant_type),
    refreshToken: String(reqBody.refresh_token),
  })
  await validateUtil.dto(bodyDto)

  return bodyDto
}

export const parseClientCredentials = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.parseBody()

  const bodyDto = new oauthDto.PostTokenClientCredentialsReqBodyDto({
    grantType: String(reqBody.grant_type),
    clientId: String(reqBody.client_id),
    secret: String(reqBody.client_secret),
    scopes: reqBody.scope ? String(reqBody.scope).split(',') : [],
  })
  await validateUtil.dto(bodyDto)

  return bodyDto
}
