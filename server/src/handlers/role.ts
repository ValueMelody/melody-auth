import { Context } from 'hono'
import { typeConfig } from 'configs'
import { roleService } from 'services'
import { roleDto } from 'dtos'
import { validateUtil } from 'utils'

export const getRoles = async (c: Context<typeConfig.Context>) => {
  const roles = await roleService.getRoles(c)
  return c.json({ roles })
}

export const getRole = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))
  const role = await roleService.getRoleById(
    c,
    id,
  )
  return c.json({ role })
}

export const postRole = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new roleDto.PostRoleReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const role = await roleService.createRole(
    c,
    bodyDto,
  )

  c.status(201)
  return c.json({ role })
}

export const putRole = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const id = Number(c.req.param('id'))

  const bodyDto = new roleDto.PutRoleReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const role = await roleService.updateRole(
    c,
    id,
    bodyDto,
  )

  return c.json({ role })
}

export const deleteRole = async (c: Context<typeConfig.Context>) => {
  const id = Number(c.req.param('id'))

  await roleService.deleteRole(
    c,
    id,
  )

  c.status(204)
  return c.body(null)
}
