import { Context } from 'hono'
import { typeConfig } from 'configs'
import { oauthDto } from 'dtos'
import { appService } from 'services'
import {
  formatUtil, validateUtil,
} from 'utils'

export const getAuthorize = async (c: Context<typeConfig.Context>) => {
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

  const validScopes = formatUtil.getValidScopes(
    queryDto.scopes,
    app,
  )

  return {
    ...queryDto,
    scopes: validScopes,
  }
}

export const postTokenClientCredentials = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.parseBody()

  const bodyDto = new oauthDto.PostTokenClientCredentialsReqDto({
    grantType: String(reqBody.grant_type),
    scopes: reqBody.scope ? String(reqBody.scope).split(' ') : [],
  })
  await validateUtil.dto(bodyDto)

  return bodyDto
}

export const postTokenAuthCode = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.parseBody()

  const bodyDto = new oauthDto.PostTokenAuthCodeReqDto({
    grantType: String(reqBody.grant_type),
    code: String(reqBody.code),
    codeVerifier: String(reqBody.code_verifier),
  })
  await validateUtil.dto(bodyDto)

  return bodyDto
}

export const postTokenRefreshToken = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.parseBody()

  const bodyDto = new oauthDto.PostTokenRefreshTokenReqDto({
    grantType: String(reqBody.grant_type),
    refreshToken: String(reqBody.refresh_token),
  })
  await validateUtil.dto(bodyDto)

  return bodyDto
}

export const getLogout = async (c: Context<typeConfig.Context>) => {
  const queryDto = new oauthDto.GetLogoutReqDto({
    clientId: c.req.query('client_id') ?? '',
    postLogoutRedirectUri: c.req.query('post_logout_redirect_uri') ?? '',
  })

  await validateUtil.dto(queryDto)
  return queryDto
}
