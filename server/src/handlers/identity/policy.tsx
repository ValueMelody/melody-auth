import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig,
  localeConfig,
  routeConfig, typeConfig,
} from 'configs'
import { identityDto } from 'dtos'
import {
  emailService,
  kvService, userService,
} from 'services'
import { validateUtil } from 'utils'
import {
  ChangeEmail, ChangePassword,
} from 'views'

export const getChangePassword = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authInfo) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  return c.html(<ChangePassword
    redirectUri={authInfo.request.redirectUri}
    logoUrl={logoUrl}
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
  if (!authInfo) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${bodyDto.locale}`)

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

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  return c.html(<ChangeEmail
    redirectUri={authInfo.request.redirectUri}
    logoUrl={logoUrl}
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
  if (!authInfo) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${bodyDto.locale}`)

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
  if (!authInfo) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${bodyDto.locale}`)

  const code = await emailService.sendChangeEmailVerificationCode(
    c,
    bodyDto.email,
    bodyDto.locale,
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
