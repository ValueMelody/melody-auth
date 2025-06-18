import { Context } from 'hono'
import { typeConfig } from 'configs'
import { orgGroupService } from 'services'
import { validateUtil } from 'utils'
import { orgGroupDto } from 'dtos'

export const getOrgGroups = async (c: Context<typeConfig.Context>) => {
  const { org_id: orgId } = c.req.query()
  const orgGroups = await orgGroupService.getOrgGroups(
    c,
    Number(orgId),
  )
  return c.json({ orgGroups })
}

export const postOrgGroup = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new orgGroupDto.PostOrgGroupDto(reqBody)
  await validateUtil.dto(bodyDto)

  const orgGroup = await orgGroupService.createOrgGroup(
    c,
    bodyDto,
  )

  c.status(201)
  return c.json({ orgGroup })
}

export const putOrgGroup = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const id = Number(c.req.param('id'))

  const bodyDto = new orgGroupDto.PutOrgGroupDto(reqBody)
  await validateUtil.dto(bodyDto)

  const orgGroup = await orgGroupService.updateOrgGroup(
    c,
    id,
    bodyDto,
  )

  return c.json({ orgGroup })
}

export const deleteOrgGroup = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))

  await orgGroupService.deleteOrgGroup(
    c,
    id,
  )

  c.status(204)
  return c.body(null)
}
