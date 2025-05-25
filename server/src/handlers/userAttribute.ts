import { Context } from 'hono'
import { typeConfig } from 'configs'
import { userAttributeService } from 'services'
import { userAttributeDto } from 'dtos'
import { validateUtil } from 'utils'

export const getUserAttributes = async (c: Context<typeConfig.Context>) => {
  const userAttributes = await userAttributeService.getUserAttributes(c)
  return c.json({ userAttributes })
}

export const createUserAttribute = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new userAttributeDto.PostUserAttributeDto(reqBody)
  await validateUtil.dto(bodyDto)

  const userAttribute = await userAttributeService.createUserAttribute(
    c,
    bodyDto,
  )

  c.status(201)
  return c.json({ userAttribute })
}

export const updateUserAttribute = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))

  const reqBody = await c.req.json()

  const bodyDto = new userAttributeDto.PutUserAttributeDto(reqBody)
  await validateUtil.dto(bodyDto)

  const userAttribute = await userAttributeService.updateUserAttribute(
    c,
    id,
    bodyDto,
  )

  return c.json({ userAttribute })
}

export const getUserAttribute = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))

  const userAttribute = await userAttributeService.getUserAttributeById(
    c,
    id,
  )

  return c.json({ userAttribute })
}

export const deleteUserAttribute = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))

  await userAttributeService.deleteUserAttributeById(
    c,
    id,
  )

  c.status(204)
  return c.body(null)
}
