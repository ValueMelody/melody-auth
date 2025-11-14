import { Context } from 'hono'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import {
  orgModel, userOrgModel, userModel,
} from 'models'
import { orgDto } from 'dtos'
import { loggerUtil } from 'utils'

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

  if (!org) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoOrg,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoOrg)
  }

  return org
}

export const getOrgBySlug = async (
  c: Context<typeConfig.Context>,
  slug: string,
): Promise<orgModel.Record> => {
  const org = slug
    ? await orgModel.getBySlug(
      c.env.DB,
      slug,
    )
    : null

  if (!org) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoOrg,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoOrg)
  }

  return org
}

export const createOrg = async (
  c: Context<typeConfig.Context>,
  dto: orgDto.PostOrgDto,
): Promise<orgModel.Record> => {
  const org = await orgModel.create(
    c.env.DB,
    {
      name: dto.name,
      slug: dto.slug,
      allowPublicRegistration: dto.allowPublicRegistration ? 1 : 0,
      onlyUseForBrandingOverride: dto.onlyUseForBrandingOverride ? 1 : 0,
    },
  )
  return org
}

export const updateOrg = async (
  c: Context<typeConfig.Context>,
  orgId: number,
  dto: orgDto.PutOrgDto,
): Promise<orgModel.Record> => {
  const allowPublicRegistration = dto.allowPublicRegistration ? 1 : 0
  const onlyUseForBrandingOverride = dto.onlyUseForBrandingOverride ? 1 : 0

  const org = await orgModel.update(
    c.env.DB,
    orgId,
    {
      name: dto.name,
      slug: dto.slug,
      allowPublicRegistration: dto.allowPublicRegistration === undefined ? undefined : allowPublicRegistration,
      onlyUseForBrandingOverride: dto.onlyUseForBrandingOverride === undefined ? undefined : onlyUseForBrandingOverride,
      companyLogoUrl: dto.companyLogoUrl,
      companyEmailLogoUrl: dto.companyEmailLogoUrl,
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

export const getUserOrgs = async (
  c: Context<typeConfig.Context>,
  userId: number,
): Promise<orgModel.Record[]> => {
  const userOrgs = await userOrgModel.getAllByUser(
    c.env.DB,
    userId,
  )
  const orgIds = userOrgs.map((userOrg) => userOrg.orgId)

  const orgs = await orgModel.getAll(c.env.DB)

  const includedOrgs = orgs.filter((org) => !org.onlyUseForBrandingOverride && orgIds.includes(org.id))

  return includedOrgs
}

export const updateUserOrgs = async (
  c: Context<typeConfig.Context>,
  userId: number,
  orgIds: number[],
): Promise<true> => {
  const userOrgs = await userOrgModel.getAllByUser(
    c.env.DB,
    userId,
  )
  const existingOrgIds = userOrgs.map((userOrg) => userOrg.orgId)
  const orgsToCreate = orgIds.filter((orgId) => !existingOrgIds.includes(orgId))
  const orgsToDelete = existingOrgIds.filter((orgId) => !orgIds.includes(orgId))

  for (const orgId of orgsToCreate) {
    await userOrgModel.create(
      c.env.DB,
      {
        userId, orgId,
      },
    )
  }
  for (const orgId of orgsToDelete) {
    const matchedUserOrg = userOrgs.find((userOrg) => userOrg.orgId === orgId)
    if (matchedUserOrg) {
      await userOrgModel.remove(
        c.env.DB,
        matchedUserOrg.id,
      )
    }
  }
  return true
}

export const switchUserOrg = async (
  c: Context<typeConfig.Context>,
  authCodeStore: typeConfig.AuthCodeBody | typeConfig.EmbeddedSessionBodyWithUser,
  orgSlug: string,
) => {
  const userOrgs = await getUserOrgs(
    c,
    authCodeStore.user.id,
  )

  const matchedOrg = userOrgs.find((userOrg) => userOrg.slug === orgSlug)

  if (!matchedOrg) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoOrg,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoOrg)
  }

  const user = await userModel.update(
    c.env.DB,
    authCodeStore.user.id,
    { orgSlug: matchedOrg.slug },
  )

  return user
}
