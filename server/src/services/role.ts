import { Context } from 'hono'
import {
  errorConfig, typeConfig,
} from 'configs'
import {
  roleModel, userRoleModel,
} from 'models'
import { roleDto } from 'dtos'

export const getRoles = async (c: Context<typeConfig.Context>): Promise<roleModel.Record[]> => {
  const roles = await roleModel.getAll(c.env.DB)

  return roles
}

export const getRoleById = async (
  c: Context<typeConfig.Context>,
  id: number,
): Promise<roleModel.Record> => {
  const role = await roleModel.getById(
    c.env.DB,
    id,
  )

  if (!role) throw new errorConfig.NotFound()

  return role
}

export const getUserRoles = async (
  c: Context<typeConfig.Context>, userId: number,
): Promise<string[]> => {
  const roles = await userRoleModel.getAllByUserId(
    c.env.DB,
    userId,
  )
  return roles.map((role) => role.roleName ?? '')
}

export const createRole = async (
  c: Context<typeConfig.Context>,
  dto: roleDto.PostRoleReqDto,
): Promise<roleModel.Record> => {
  const role = await roleModel.create(
    c.env.DB,
    {
      name: dto.name, note: dto.note,
    },
  )
  return role
}

export const updateRole = async (
  c: Context<typeConfig.Context>,
  roleId: number,
  dto: roleDto.PutRoleReqDto,
): Promise<roleModel.Record> => {
  const role = await roleModel.update(
    c.env.DB,
    roleId,
    {
      name: dto.name, note: dto.note,
    },
  )
  return role
}

export const deleteRole = async (
  c: Context<typeConfig.Context>,
  roleId: number,
): Promise<true> => {
  await roleModel.remove(
    c.env.DB,
    roleId,
  )
  await userRoleModel.remove(
    c.env.DB,
    roleId,
  )
  return true
}
