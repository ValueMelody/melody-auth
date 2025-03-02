import {
  Context, TypedResponse,
} from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig,
  localeConfig,
  routeConfig, typeConfig,
} from 'configs'
import { identityDto } from 'dtos'
import {
  brandingService,
  emailService,
  kvService, passkeyService, userService,
} from 'services'
import {
  cryptoUtil, validateUtil,
} from 'utils'
import {
  ChangeEmail, ChangePassword, ManagePasskey, ResetMfa, UpdateInfo,
} from 'views'
import {
  userModel, userPasskeyModel,
} from 'models'

const checkAccount = (user: userModel.Record) => {
  if (!user.email || user.socialAccountId) {
    throw new errorConfig.Forbidden(localeConfig.Error.SocialAccountNotSupported)
  }
}

export const getChangePassword = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authInfo) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)
  checkAccount(authInfo.user)

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  return c.html(<ChangePassword
    redirectUri={authInfo.request.redirectUri}
    branding={await brandingService.getBranding(
      c,
      queryDto.org,
    )}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
  />)
}

export const postChangePassword = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostChangePasswordReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authInfo) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)
  checkAccount(authInfo.user)

  await userService.changeUserPassword(
    c,
    authInfo.user,
    bodyDto,
  )

  return c.json({ success: true })
}

export const getChangeEmail = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authInfo) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)
  checkAccount(authInfo.user)

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  return c.html(<ChangeEmail
    redirectUri={authInfo.request.redirectUri}
    branding={await brandingService.getBranding(
      c,
      queryDto.org,
    )}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
  />)
}

export const postChangeEmail = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostChangeEmailReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authInfo) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)
  checkAccount(authInfo.user)

  const isCorrectCode = await kvService.verifyChangeEmailCode(
    c.env.KV,
    authInfo.user.id,
    bodyDto.email,
    bodyDto.verificationCode,
  )

  if (!isCorrectCode) throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)

  await userService.changeUserEmail(
    c,
    authInfo.user,
    bodyDto,
  )

  return c.json({ success: true })
}

export const postVerificationCode = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostChangeEmailCodeReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authInfo) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)
  checkAccount(authInfo.user)

  const { CHANGE_EMAIL_EMAIL_THRESHOLD: emailThreshold } = env(c)

  if (emailThreshold) {
    const emailAttempts = await kvService.getChangeEmailAttempts(
      c.env.KV,
      authInfo.user.email ?? '',
    )

    if (emailAttempts >= emailThreshold) throw new errorConfig.Forbidden(localeConfig.Error.ChangeEmailLocked)

    await kvService.setChangeEmailAttempts(
      c.env.KV,
      authInfo.user.email ?? '',
      emailAttempts + 1,
    )
  }

  const code = await emailService.sendChangeEmailVerificationCode(
    c,
    bodyDto.email,
    bodyDto.locale,
    authInfo.user.orgSlug,
  )
  if (code) {
    await kvService.storeChangeEmailCode(
      c.env.KV,
      authInfo.user.id,
      bodyDto.email,
      code,
    )
  }

  return c.json({ success: true })
}

export const getResetMfa = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authInfo) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)
  checkAccount(authInfo.user)

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  return c.html(<ResetMfa
    redirectUri={authInfo.request.redirectUri}
    branding={await brandingService.getBranding(
      c,
      queryDto.org,
    )}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
  />)
}

export const postResetMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeFollowUpReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeBody) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

  await userService.resetUserMfa(
    c,
    authCodeBody.user.authId,
  )

  return c.json({ success: true })
}

export interface ManagePasskeyInfo {
  passkey: userPasskeyModel.Record | null;
  enrollOptions: passkeyService.EnrollOptions;
}

export const getManagePasskeyInfo = async (c: Context<typeConfig.Context>)
: Promise<TypedResponse<ManagePasskeyInfo>> => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authInfo) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)
  checkAccount(authInfo.user)

  const passkey = await passkeyService.getPasskeyByUser(
    c,
    authInfo.user.id,
  )

  const enrollOptions = await passkeyService.genPasskeyEnrollOptions(
    c,
    authInfo,
  )

  return c.json({
    passkey,
    enrollOptions,
  })
}

export const getManagePasskey = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authInfo) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)
  checkAccount(authInfo.user)

  const passkey = await passkeyService.getPasskeyByUser(
    c,
    authInfo.user.id,
  )

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  const enrollOptions = await passkeyService.genPasskeyEnrollOptions(
    c,
    authInfo,
  )

  return c.html(<ManagePasskey
    passkey={passkey}
    enrollOptions={enrollOptions}
    redirectUri={authInfo.request.redirectUri}
    branding={await brandingService.getBranding(
      c,
      queryDto.org,
    )}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
  />)
}

export const postManagePasskey = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizePasskeyEnrollReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authInfo) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)
  checkAccount(authInfo.user)

  const {
    passkeyId, passkeyPublickey, passkeyCounter,
  } = await passkeyService.processPasskeyEnroll(
    c,
    authInfo,
    bodyDto.enrollInfo,
  )

  await passkeyService.createUserPasskey(
    c,
    authInfo.user.id,
    passkeyId,
    cryptoUtil.uint8ArrayToBase64(passkeyPublickey),
    passkeyCounter,
  )

  return c.json({
    success: true,
    passkey: {
      credentialId: passkeyId,
      counter: passkeyCounter,
    },
  })
}

export const deleteManagePasskey = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.DeleteManagePasskeyReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authInfo) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)
  checkAccount(authInfo.user)

  const passkey = await passkeyService.getPasskeyByUser(
    c,
    authInfo.user.id,
  )

  if (!passkey) throw new errorConfig.Forbidden(localeConfig.Error.InvalidRequest)

  await passkeyService.deletePasskey(
    c,
    authInfo.user.id,
    passkey.id,
  )

  return c.json({ success: true })
}

export const getUpdateInfo = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authInfo) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)
  checkAccount(authInfo.user)

  const user = await userService.getUserByAuthId(
    c,
    authInfo.user.authId,
  )

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  return c.html(<UpdateInfo
    firstName={user.firstName ?? ''}
    lastName={user.lastName ?? ''}
    redirectUri={authInfo.request.redirectUri}
    branding={await brandingService.getBranding(
      c,
      queryDto.org,
    )}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
  />)
}

export const postUpdateInfo = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostUpdateInfoReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authInfo) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)
  checkAccount(authInfo.user)

  await userService.updateUser(
    c,
    authInfo.user.authId,
    {
      firstName: bodyDto.firstName, lastName: bodyDto.lastName,
    },
  )

  return c.json({ success: true })
}
