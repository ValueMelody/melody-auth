import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import {
  orgGroupModel, userModel, userOrgGroupModel,
} from 'models'
import { orgGroupDto } from 'dtos'
import { loggerUtil } from 'utils'

export const getOrgGroups = async (
  c: Context<typeConfig.Context>,
  orgId: number,
): Promise<orgGroupModel.Record[]> => {
  const orgGroups = await orgGroupModel.getAll(
    c.env.DB,
    orgId,
  )

  return orgGroups
}

export const getOrgGroupById = async (
  c: Context<typeConfig.Context>,
  orgGroupId: number,
): Promise<orgGroupModel.Record | null> => {
  const orgGroup = await orgGroupModel.getById(
    c.env.DB,
    orgGroupId,
  )

  return orgGroup
}

export const createOrgGroup = async (
  c: Context<typeConfig.Context>,
  dto: orgGroupDto.PostOrgGroupDto,
): Promise<orgGroupModel.Record> => {
  const orgGroup = await orgGroupModel.create(
    c.env.DB,
    dto,
  )

  return orgGroup
}

export const updateOrgGroup = async (
  c: Context<typeConfig.Context>,
  orgGroupId: number,
  dto: orgGroupDto.PutOrgGroupDto,
): Promise<orgGroupModel.Record> => {
  const orgGroup = await orgGroupModel.update(
    c.env.DB,
    orgGroupId,
    { name: dto.name },
  )
  return orgGroup
}

export const deleteOrgGroup = async (
  c: Context<typeConfig.Context>,
  orgGroupId: number,
): Promise<true> => {
  await orgGroupModel.remove(
    c.env.DB,
    orgGroupId,
  )
  return true
}

export const createUserOrgGroup = async (
  c: Context<typeConfig.Context>,
  userId: number,
  orgGroupId: number,
): Promise<true> => {
  return userOrgGroupModel.create(
    c.env.DB,
    {
      userId, orgGroupId,
    },
  )
}

export const deleteUserOrgGroup = async (
  c: Context<typeConfig.Context>,
  userId: number,
  orgGroupId: number,
): Promise<true> => {
  const record = await userOrgGroupModel.getByUserAndOrgGroup(
    c.env.DB,
    userId,
    orgGroupId,
  )

  if (!record) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.OrgGroupNotFound,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.OrgGroupNotFound)
  }

  return userOrgGroupModel.remove(
    c.env.DB,
    record.id,
  )
}

export const getUsersByOrgGroupId = async (
  c: Context<typeConfig.Context>,
  orgGroupId: number,
): Promise<userModel.ApiRecord[]> => {
  const userOrgGroups = await userOrgGroupModel.getAllByOrgGroup(
    c.env.DB,
    orgGroupId,
  )
  const userIds = userOrgGroups.map((userOrgGroup) => userOrgGroup.userId)

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
