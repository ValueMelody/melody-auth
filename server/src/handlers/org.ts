import { Context } from 'hono'
import { typeConfig } from 'configs'
import {
  orgService, userService,
} from 'services'
import { orgDto } from 'dtos'
import { validateUtil } from 'utils'
import { PaginationDto } from 'dtos/common'

export const getOrgs = async (c: Context<typeConfig.Context>) => {
  const orgs = await orgService.getOrgs(c)
  return c.json({ orgs })
}

export const getOrg = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))
  const org = await orgService.getOrgById(
    c,
    id,
  )
  return c.json({ org })
}

export const postOrg = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new orgDto.PostOrgDto(reqBody)
  await validateUtil.dto(bodyDto)

  const org = await orgService.createOrg(
    c,
    bodyDto,
  )

  c.status(201)
  return c.json({ org })
}

export const putOrg = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const id = Number(c.req.param('id'))

  const bodyDto = new orgDto.PutOrgDto(reqBody)
  await validateUtil.dto(bodyDto)

  const org = await orgService.updateOrg(
    c,
    id,
    bodyDto,
  )

  return c.json({ org })
}

export const deleteOrg = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))

  await orgService.deleteOrg(
    c,
    id,
  )

  c.status(204)
  return c.body(null)
}

export const getOrgUsers = async (c: Context<typeConfig.Context>) => {
  const orgId = Number(c.req.param('id'))

  const {
    page_size: pageSize,
    page_number: pageNumber,
    search,
  } = c.req.query()
  const pagination = pageSize && pageNumber
    ? new PaginationDto({
      pageSize: Number(pageSize),
      pageNumber: Number(pageNumber),
    })
    : undefined

  const result = await userService.getUsers(
    c,
    search || undefined,
    pagination,
    orgId,
  )
  return c.json(result)
}
