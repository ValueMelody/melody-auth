import { Context } from 'hono'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import {
  orgGroupModel, userOrgGroupModel,
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

export const getUserOrgGroups = async (
  c: Context<typeConfig.Context>, userId: number,
): Promise<userOrgGroupModel.UserOrgGroup[]> => {
  const userOrgGroups = await userOrgGroupModel.getAllByUser(
    c.env.DB,
    userId,
  )
  const orgGroups = userOrgGroups.map((userOrgGroup) => ({
    orgGroupId: userOrgGroup.orgGroupId,
    orgGroupName: userOrgGroup.orgGroupName,
  }))
  return orgGroups
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
    throw new errorConfig.Forbidden(messageConfig.RequestError.OrgGroupNotFound)
  }

  return userOrgGroupModel.remove(
    c.env.DB,
    record.id,
  )
}
