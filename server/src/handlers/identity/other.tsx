import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig,
  localeConfig,
  typeConfig,
} from 'configs'
import { identityDto } from 'dtos'
import {
  brandingService,
  kvService,
  userService,
} from 'services'
import {
  requestUtil, validateUtil,
} from 'utils'
import {
  AuthCodeExpired,
  AuthorizeResetView,
  VerifyEmailView,
} from 'views'
import { oauthHandler } from 'handlers'

export const getVerifyEmail = async (c: Context<typeConfig.Context>) => {
  const queryDto = new identityDto.GetVerifyEmailReqDto({
    id: c.req.query('id') ?? '',
    locale: requestUtil.getLocaleFromQuery(
      c,
      c.req.query('locale'),
    ),
  })
  await validateUtil.dto(queryDto)

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  return c.html(<VerifyEmailView
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    branding={brandingService.getDefaultBranding(c)}
    queryDto={queryDto}
  />)
}

export const postVerifyEmail = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostVerifyEmailReqDto({
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

export const getAuthorizeReset = async (c: Context<typeConfig.Context>) => {
  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)
  const queryDto = await oauthHandler.parseGetAuthorizeDto(c)
  const queryString = requestUtil.getQueryString(c)

  return c.html(<AuthorizeResetView
    queryString={queryString}
    branding={brandingService.getDefaultBranding(c)}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
  />)
}

export const postResetCode = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const email = reqBody.email
    ? String(reqBody.email).trim()
      .toLowerCase()
    : ''
  const locale = requestUtil.getLocaleFromQuery(
    c,
    reqBody.locale,
  )
  if (!email) throw new errorConfig.Forbidden()

  const ip = requestUtil.getRequestIP(c)
  const { PASSWORD_RESET_EMAIL_THRESHOLD: resetThreshold } = env(c)

  if (resetThreshold) {
    const resetAttempts = await kvService.getPasswordResetAttemptsByIP(
      c.env.KV,
      email,
      ip,
    )
    if (resetAttempts >= resetThreshold) throw new errorConfig.Forbidden(localeConfig.Error.PasswordResetLocked)

    await kvService.setPasswordResetAttemptsByIP(
      c.env.KV,
      email,
      ip,
      resetAttempts + 1,
    )
  }

  await userService.sendPasswordReset(
    c,
    email,
    locale,
  )
  return c.json({ success: true })
}

export const postAuthorizeReset = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeResetReqDto({
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

export const getAuthCodeExpired = async (c: Context<typeConfig.Context>) => {
  const { SUPPORTED_LOCALES: locales } = env(c)

  const locale = c.req.query('locale') || locales[0]

  return c.html(<AuthCodeExpired
    locale={locale as typeConfig.Locale}
    branding={brandingService.getDefaultBranding(c)}
  />)
}
