import { Context } from 'hono'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import { orgModel } from 'models'
import { orgDto } from 'dtos'

export const getOrgs = async (c: Context<typeConfig.Context>): Promise<orgModel.Record[]> => {
  const orgs = await orgModel.getAll(c.env.DB)

  return orgs
}

export const getOrgById = async (
  c: Context<typeConfig.Context>,
  id: number,
): Promise<orgModel.Record> => {
  const org = await orgModel.getById(
    c.env.DB,
    id,
  )

  if (!org) throw new errorConfig.NotFound(messageConfig.RequestError.NoOrg)

  return org
}

export const createOrg = async (
  c: Context<typeConfig.Context>,
  dto: orgDto.PostOrgDto,
): Promise<orgModel.Record> => {
  const org = await orgModel.create(
    c.env.DB,
    {
      name: dto.name, slug: dto.slug,
    },
  )
  return org
}

export const updateOrg = async (
  c: Context<typeConfig.Context>,
  orgId: number,
  dto: orgDto.PutOrgDto,
): Promise<orgModel.Record> => {
  const org = await orgModel.update(
    c.env.DB,
    orgId,
    {
      name: dto.name,
      slug: dto.slug,
      companyLogoUrl: dto.companyLogoUrl,
      fontFamily: dto.fontFamily,
      fontUrl: dto.fontUrl,
      layoutColor: dto.layoutColor,
      labelColor: dto.labelColor,
      primaryButtonColor: dto.primaryButtonColor,
      primaryButtonLabelColor: dto.primaryButtonLabelColor,
      primaryButtonBorderColor: dto.primaryButtonBorderColor,
      secondaryButtonColor: dto.secondaryButtonColor,
      secondaryButtonLabelColor: dto.secondaryButtonLabelColor,
      secondaryButtonBorderColor: dto.secondaryButtonBorderColor,
      criticalIndicatorColor: dto.criticalIndicatorColor,
      emailSenderName: dto.emailSenderName,
      termsLink: dto.termsLink,
      privacyPolicyLink: dto.privacyPolicyLink,
    },
  )
  return org
}

export const deleteOrg = async (
  c: Context<typeConfig.Context>,
  orgId: number,
): Promise<true> => {
  await orgModel.remove(
    c.env.DB,
    orgId,
  )
  return true
}
