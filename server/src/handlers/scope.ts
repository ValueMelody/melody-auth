import { Context } from 'hono'
import { typeConfig } from 'configs'
import { scopeService } from 'services'
import { scopeDto } from 'dtos'
import { validateUtil } from 'utils'

export const getScopes = async (c: Context<typeConfig.Context>) => {
  const scopes = await scopeService.getScopes(c)
  return c.json({ scopes })
}

export const getScope = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))
  const scope = await scopeService.getScopeById(
    c,
    id,
  )
  return c.json({ scope })
}

export const postScope = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new scopeDto.PostScopeDto({
    name: String(reqBody.name),
    type: reqBody.type,
    note: reqBody.note,
    locales: reqBody.locales,
  })
  await validateUtil.dto(bodyDto)

  const scope = await scopeService.createScope(
    c,
    bodyDto,
  )

  c.status(201)
  return c.json({ scope })
}

export const putScope = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const id = Number(c.req.param('id'))

  const bodyDto = new scopeDto.PutScopeDto(reqBody)
  await validateUtil.dto(bodyDto)

  const scope = await scopeService.updateScope(
    c,
    id,
    bodyDto,
  )

  return c.json({ scope })
}

export const deleteScope = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))

  await scopeService.deleteScope(
    c,
    id,
  )

  c.status(204)
  return c.body(null)
}
