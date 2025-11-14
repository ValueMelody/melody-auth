import { Context } from 'hono'
import { env } from 'hono/adapter'
import { getAuthCodeBody } from './mfa'
import { typeConfig } from 'configs'
import {
  baseDto, identityDto,
} from 'dtos'
import {
  appBannerService,
  identityService,
  kvService,
  orgService,
  userService,
} from 'services'
import {
  requestUtil, validateUtil,
} from 'utils'
import { orgModel } from 'models'

export const postVerifyEmail = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostVerifyEmailDto({
    id: String(reqBody.id),
    code: String(reqBody.code),
  })
  await validateUtil.dto(bodyDto)

  await userService.verifyUserEmail(
    c,
    bodyDto,
  )

  return c.json({ success: true })
}

export const postResetPasswordCode = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new baseDto.ResetPasswordDto(reqBody)

  const email = bodyDto.email
  const locale = requestUtil.getLocaleFromQuery(
    c,
    reqBody.locale,
  )

  await identityService.processResetPassword(
    c,
    email,
    locale,
  )

  return c.json({ success: true })
}

export const postResetPassword = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostResetPasswordDto({
    email: String(reqBody.email),
    code: String(reqBody.code),
    password: String(reqBody.password),
  })
  await validateUtil.dto(bodyDto)

  await userService.resetUserPassword(
    c,
    bodyDto,
  )

  const { UNLOCK_ACCOUNT_VIA_PASSWORD_RESET: allowUnlock } = env(c)
  const ip = requestUtil.getRequestIP(c)
  if (allowUnlock) {
    await kvService.clearFailedLoginAttemptsByIP(
      c.env.KV,
      bodyDto.email,
      ip,
    )
  }

  return c.json({ success: true })
}

export const getAppBanners = async (c: Context<typeConfig.Context>) => {
  const bodyDto = new baseDto.GetAppBannersDto({ clientId: c.req.query('client_id') ?? '' })

  const banners = await appBannerService.getBannersByClientId(
    c,
    bodyDto.clientId,
  )

  return c.json({ banners })
}

export interface GetProcessSwitchOrgRes {
  orgs: orgModel.AuthInfo[];
  activeOrgSlug: string;
}
export const getProcessSwitchOrg = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetProcess(c)
  await validateUtil.dto(queryDto)

  const authCodeStore = await getAuthCodeBody(
    c,
    queryDto.code,
  )

  const orgs = await orgService.getUserOrgs(
    c,
    authCodeStore.user.id,
  )
  const authOrgInfos = orgs.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    companyLogoUrl: org.companyLogoUrl,
  }))

  return c.json({
    orgs: authOrgInfos, activeOrgSlug: authCodeStore.user.orgSlug,
  })
}

export const postProcessSwitchOrg = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostProcessOrgSwitchDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await getAuthCodeBody(
    c,
    bodyDto.code,
  )

  if (authCodeStore.user.orgSlug === bodyDto.org) {
    return c.json(await identityService.processPostAuthorize(
      c,
      identityService.AuthorizeStep.SwitchOrg,
      bodyDto.code,
      authCodeStore,
    ))
  }

  const user = await orgService.switchUserOrg(
    c,
    authCodeStore,
    bodyDto.org,
  )

  const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)
  const newAuthCodeStore = {
    ...authCodeStore,
    user,
  }
  await kvService.storeAuthCode(
    c.env.KV,
    bodyDto.code,
    newAuthCodeStore,
    codeExpiresIn,
  )

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.SwitchOrg,
    bodyDto.code,
    newAuthCodeStore,
  ))
}
