import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig, messageConfig, typeConfig, variableConfig,
} from 'configs'
import {
  roleModel, userModel, userRoleModel,
} from 'models'
import { roleDto } from 'dtos'

const isBuiltInRoleName = (name: string) =>
  variableConfig.S2sConfig.builtInRoles.some((role) => role === name)

const throwBuiltInRoleImmutableError = () => {
  throw new errorConfig.Forbidden(messageConfig.RequestError.BuiltInRoleImmutable)
}

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

  if (!role) throw new errorConfig.NotFound(messageConfig.RequestError.RoleNotFound)

  return role
}

export const getUserRoles = async (
  c: Context<typeConfig.Context>, userId: number,
): Promise<string[]> => {
  const roles = await userRoleModel.getAllByUserId(
    c.env.DB,
    userId,
  )
  return roles.map((role) => role.roleName)
}

export const createRole = async (
  c: Context<typeConfig.Context>,
  dto: roleDto.PostRoleDto,
): Promise<roleModel.Record> => {
  if (isBuiltInRoleName(dto.name)) throwBuiltInRoleImmutableError()

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
  dto: roleDto.PutRoleDto,
): Promise<roleModel.Record> => {
  const role = await roleModel.getById(
    c.env.DB,
    roleId,
  )
  if (!role) throw new errorConfig.NotFound(messageConfig.RequestError.RoleNotFound)
  if (isBuiltInRoleName(role.name) || (dto.name !== undefined && isBuiltInRoleName(dto.name))) {
    throwBuiltInRoleImmutableError()
  }

  const updatedRole = await roleModel.update(
    c.env.DB,
    roleId,
    {
      name: dto.name, note: dto.note,
    },
  )
  return updatedRole
}

export const deleteRole = async (
  c: Context<typeConfig.Context>,
  roleId: number,
): Promise<true> => {
  const role = await roleModel.getById(
    c.env.DB,
    roleId,
  )
  if (role && isBuiltInRoleName(role.name)) throwBuiltInRoleImmutableError()

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

export const getUsersByRoleId = async (
  c: Context<typeConfig.Context>,
  roleId: number,
): Promise<userModel.ApiRecord[]> => {
  const userWithRoles = await userRoleModel.getAllByRole(
    c.env.DB,
    roleId,
  )
  const userIds = userWithRoles.map((userWithRole) => userWithRole.userId)

  const users = userIds.length
    ? await userModel.getAll(
      c.env.DB,
      { whereIn: { values: userIds } },
    )
    : []

  const { ENABLE_NAMES: enableNames } = env(c)

  const result = users.map((user) => userModel.convertToApiRecord(
    user,
    enableNames,
  ))

  return result
}
