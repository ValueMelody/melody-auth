import { Context } from 'hono'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import { samlIdpModel } from 'models'
import { samlDto } from 'dtos'

export const getSamlIdps = async (c: Context<typeConfig.Context>): Promise<samlIdpModel.Record[]> => {
  const idps = await samlIdpModel.getAll(c.env.DB)

  return idps
}

export const getSamlIdpById = async (
  c: Context<typeConfig.Context>,
  id: number,
): Promise<samlIdpModel.Record> => {
  const idp = await samlIdpModel.getById(
    c.env.DB,
    id,
  )

  if (!idp) throw new errorConfig.NotFound(messageConfig.RequestError.NoSamlIdp)

  return idp
}

export const createIdp = async (
  c: Context<typeConfig.Context>,
  dto: samlDto.PostSamlIdpDto,
): Promise<samlIdpModel.Record> => {
  const idp = await samlIdpModel.create(
    c.env.DB,
    dto,
  )

  return idp
}

export const updateIdp = async (
  c: Context<typeConfig.Context>,
  idpId: number,
  dto: samlDto.PutSamlIdpDto,
): Promise<samlIdpModel.Record> => {
  const idp = await samlIdpModel.update(
    c.env.DB,
    idpId,
    {
      userIdAttribute: dto.userIdAttribute,
      emailAttribute: dto.emailAttribute,
      firstNameAttribute: dto.firstNameAttribute,
      lastNameAttribute: dto.lastNameAttribute,
      metadata: dto.metadata,
      isActive: dto.isActive === undefined ? undefined : (dto.isActive ? 1 : 0),
    },
  )
  return idp
}

export const deleteIdp = async (
  c: Context<typeConfig.Context>,
  idpId: number,
): Promise<true> => {
  await samlIdpModel.remove(
    c.env.DB,
    idpId,
  )

  return true
}
