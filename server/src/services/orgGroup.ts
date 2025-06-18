import { Context } from 'hono'
import { typeConfig } from 'configs'
import { orgGroupModel } from 'models'
import { orgGroupDto } from 'dtos'

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
