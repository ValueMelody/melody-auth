import { Context } from 'hono'
import { typeConfig } from 'configs'
import { samlService } from 'services'
import { validateUtil } from 'utils'
import { samlDto } from 'dtos'

export const getSamlIdps = async (c: Context<typeConfig.Context>) => {
  const idps = await samlService.getSamlIdps(c)
  return c.json({ idps })
}

export const getSamlIdp = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))
  const idp = await samlService.getSamlIdpById(
    c,
    id,
  )
  return c.json({ idp })
}

export const postIdp = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new samlDto.PostSamlIdpDto(reqBody)
  await validateUtil.dto(bodyDto)

  const idp = await samlService.createIdp(
    c,
    bodyDto,
  )

  c.status(201)
  return c.json({ idp })
}

export const putIdp = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const id = Number(c.req.param('id'))

  const bodyDto = new samlDto.PutSamlIdpDto(reqBody)
  await validateUtil.dto(bodyDto)

  const idp = await samlService.updateIdp(
    c,
    id,
    bodyDto,
  )

  return c.json({ idp })
}

export const deleteIdp = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))

  await samlService.deleteIdp(
    c,
    id,
  )

  c.status(204)
  return c.body(null)
}
