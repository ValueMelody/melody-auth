import { Context } from 'hono'
import { typeConfig } from 'configs'
import { identityDto } from 'dtos'
import { validateUtil } from 'utils'

export const parseGet = async (c: Context<typeConfig.Context>) => {
  const queryDto = new identityDto.GetVerifyEmailReqQueryDto({ id: c.req.query('id') ?? '' })
  await validateUtil.dto(queryDto)

  return queryDto
}

export const parsePost = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const queryDto = new identityDto.PostVerifyEmailReqBodyDto({
    id: String(reqBody.id),
    code: String(reqBody.code),
  })
  await validateUtil.dto(queryDto)

  return queryDto
}
