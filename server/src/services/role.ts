import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig, typeConfig,
} from 'configs'
import {
  roleModel, userRoleModel,
} from 'models'
import { roleDto } from 'dtos'

export const getRoles = async (
  c: Context<typeConfig.Context>,
  includeDeleted: boolean = false,
) => {
  const roles = await roleModel.getAll(
    c.env.DB,
    includeDeleted,
  )

  return roles
}

export const getRoleById = async (
  c: Context<typeConfig.Context>,
  id: number,
  includeDeleted: boolean = false,
) => {
  const role = await roleModel.getById(
    c.env.DB,
    id,
    includeDeleted,
  )

  if (!role) throw new errorConfig.NotFound()

  return role
}

export const getUserRoles = async (
  c: Context<typeConfig.Context>, userId: number,
) => {
  const { ENABLE_USER_ROLE } = env(c)
  if (!ENABLE_USER_ROLE) return null

  const roles = await userRoleModel.getAllByUserId(
    c.env.DB,
    userId,
  )
  return roles.map((role) => role.roleName ?? '')
}

export const createRole = async (
  c: Context<typeConfig.Context>,
  dto: roleDto.PostRoleReqDto,
) => {
  const role = await roleModel.create(
    c.env.DB,
    { name: dto.name },
  )
  return role
}

export const updateRole = async (
  c: Context<typeConfig.Context>,
  roleId: number,
  dto: roleDto.PutRoleReqDto,
) => {
  const role = await roleModel.update(
    c.env.DB,
    roleId,
    { name: dto.name },
  )
  return role
}
