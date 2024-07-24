import { Context } from 'hono'
import { typeConfig } from 'configs'
import { identityDto } from 'dtos'
import { validateUtil } from 'utils'

export const postAuthorizeAccount = async (
  c: Context<typeConfig.Context>, namesIsRequired: boolean,
) => {
  const reqBody = await c.req.json()
  const parsedBody = {
    ...reqBody,
    scopes: reqBody.scope.split(' '),
  }

  const bodyDto = namesIsRequired
    ? new identityDto.PostAuthorizeReqWithRequiredNamesDto(parsedBody)
    : new identityDto.PostAuthorizeReqWithNamesDto(parsedBody)
  await validateUtil.dto(bodyDto)

  return bodyDto
}

export const getAuthorizeConsent = async (c: Context<typeConfig.Context>) => {
  const queryDto = new identityDto.GetAuthorizeConsentReqDto({
    state: c.req.query('state') ?? '',
    redirectUri: c.req.query('redirect_uri') ?? '',
    code: c.req.query('code') ?? '',
  })
  await validateUtil.dto(queryDto)

  return queryDto
}

export const postAuthorizeReset = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const queryDto = new identityDto.PostAuthorizeResetReqDto({
    email: String(reqBody.email),
    code: String(reqBody.code),
    password: String(reqBody.password),
  })
  await validateUtil.dto(queryDto)

  return queryDto
}

export const postAuthorizeConsent = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.GetAuthorizeConsentReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  return bodyDto
}

export const postAuthorizePassword = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeReqWithPasswordDto({
    ...reqBody,
    scopes: reqBody.scope.split(' '),
  })
  await validateUtil.dto(bodyDto)

  return bodyDto
}

export const getVerifyEmail = async (c: Context<typeConfig.Context>) => {
  const queryDto = new identityDto.GetVerifyEmailReqDto({ id: c.req.query('id') ?? '' })
  await validateUtil.dto(queryDto)

  return queryDto
}

export const postVerifyEmail = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const queryDto = new identityDto.PostVerifyEmailReqDto({
    id: String(reqBody.id),
    code: String(reqBody.code),
  })
  await validateUtil.dto(queryDto)

  return queryDto
}

export const postLogout = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.parseBody()
  const bodyDto = new identityDto.PostLogoutReqDto({
    refreshToken: String(reqBody.refresh_token),
    postLogoutRedirectUri: reqBody.post_logout_redirect_uri
      ? String(reqBody.post_logout_redirect_uri)
      : '',
  })
  await validateUtil.dto(bodyDto)
  return bodyDto
}
