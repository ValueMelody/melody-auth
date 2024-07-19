import { Context } from 'hono'
import { typeConfig } from 'configs'
import { identityDto } from 'dtos'
import { validateUtil } from 'utils'

export const parseAccount = async (
  c: Context<typeConfig.Context>, namesIsRequired: boolean,
) => {
  const reqBody = await c.req.json()
  const parsedBody = {
    ...reqBody,
    scopes: reqBody.scope.split(' '),
  }

  const bodyDto = namesIsRequired
    ? new identityDto.PostAuthorizeReqBodyWithRequiredNamesDto(parsedBody)
    : new identityDto.PostAuthorizeReqBodyWithNamesDto(parsedBody)
  await validateUtil.dto(bodyDto)

  return bodyDto
}

export const parsePassword = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeReqBodyWithPasswordDto({
    ...reqBody,
    scopes: reqBody.scope.split(' '),
  })
  await validateUtil.dto(bodyDto)

  return bodyDto
}

export const parseConsent = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.GetAuthorizeConsentReqQueryDto(reqBody)
  await validateUtil.dto(bodyDto)

  return bodyDto
}

export const parseReset = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const queryDto = new identityDto.PostAuthorizeResetReqBodyDto({
    email: String(reqBody.email),
    code: String(reqBody.code),
    password: String(reqBody.password),
  })
  await validateUtil.dto(queryDto)

  return queryDto
}
