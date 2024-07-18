import { Context } from 'hono'
import { typeConfig } from 'configs'
import { identityDto } from 'dtos'
import { validateUtil } from 'utils'

export const parseAccount = async (
  c: Context<typeConfig.Context>, namesIsRequired: boolean,
) => {
  const reqBody = await c.req.json()

  const bodyDto = namesIsRequired
    ? new identityDto.PostAuthorizeReqBodyWithRequiredNamesDto(reqBody)
    : new identityDto.PostAuthorizeReqBodyWithNamesDto(reqBody)
  await validateUtil.dto(bodyDto)

  return bodyDto
}

export const parsePassword = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeReqBodyWithPasswordDto(reqBody)
  await validateUtil.dto(bodyDto)

  return bodyDto
}

export const parseConsent = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.GetAuthorizeConsentReqQueryDto(reqBody)
  await validateUtil.dto(bodyDto)

  return bodyDto
}
