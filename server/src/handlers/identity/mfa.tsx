import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig, localeConfig, typeConfig,
} from 'configs'
import { identityDto } from 'dtos'
import {
  emailService, kvService, userService,
} from 'services'
import {
  identityUtil,
  requestUtil, validateUtil,
} from 'utils'
import {
  AuthorizeEmailMfaView, AuthorizeOtpMfaView,
  AuthorizeMfaEnrollView,
} from 'views'
import { AuthCodeBody } from 'configs/type'
import { userModel } from 'models'

const handleSendEmailMfa = async (
  c: Context<typeConfig.Context>,
  authCode: string,
  locale: typeConfig.Locale,
) => {
  const {
    EMAIL_MFA_IS_REQUIRED: enableEmailMfa,
    AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn,
  } = env(c)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    authCode,
  )
  const requireEmailMfa = enableEmailMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Email)
  const couldFallback = allowSwitchToEmailMfa(
    c,
    authCodeBody,
  )

  if (!requireEmailMfa && !couldFallback) throw new errorConfig.Forbidden()

  const mfaCode = await emailService.sendEmailMfa(
    c,
    authCodeBody.user,
    locale,
  )
  if (mfaCode) {
    await kvService.storeEmailMfaCode(
      c.env.KV,
      authCode,
      mfaCode,
      codeExpiresIn,
    )
  }
}

const allowSwitchToEmailMfa = (
  c: Context<typeConfig.Context>,
  authCodeStore: AuthCodeBody,
) => {
  const {
    OTP_MFA_IS_REQUIRED: enableOtpMfa,
    EMAIL_MFA_IS_REQUIRED: enableEmailMfa,
    ALLOW_EMAIL_MFA_AS_BACKUP: allowFallback,
  } = env(c)
  const notEnrolledEmail = !enableEmailMfa && !authCodeStore.user.mfaTypes.includes(userModel.MfaType.Email)
  const enrolledOtp = enableOtpMfa || authCodeStore.user.mfaTypes.includes(userModel.MfaType.Otp)

  return allowFallback && notEnrolledEmail && enrolledOtp
}

export const getAuthorizeMfaEnroll = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )

  if (authCodeStore.user.mfaTypes.length) throw new errorConfig.Forbidden(localeConfig.Error.MfaEnrolled)

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  return c.html(<AuthorizeMfaEnrollView
    logoUrl={logoUrl}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
  />)
}

export const postAuthorizeMfaEnroll = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeEnrollReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (authCodeStore.user.mfaTypes.length) throw new errorConfig.Forbidden(localeConfig.Error.MfaEnrolled)

  const user = await userService.enrollUserMfa(
    c,
    authCodeStore.user.authId,
    bodyDto.type,
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

  return c.json(await identityUtil.processPostAuthorize(
    c,
    identityUtil.AuthorizeStep.MfaEnroll,
    bodyDto.code,
    newAuthCodeStore,
  ))
}

export const getAuthorizeOtpSetup = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )

  if (authCodeStore.user.otpVerified) throw new errorConfig.Forbidden(localeConfig.Error.OtpAlreadySet)

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  const otp = `otpauth://totp/${authCodeStore.appName}:${authCodeStore.user.email}?secret=${authCodeStore.user.otpSecret}&issuer=melody-auth&algorithm=SHA1&digits=6&period=30`

  return c.html(<AuthorizeOtpMfaView
    logoUrl={logoUrl}
    otp={otp}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    showEmailMfaBtn={false}
  />)
}

export const getAuthorizeOtpMfa = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  const allowSwitch = allowSwitchToEmailMfa(
    c,
    authCodeBody,
  )

  return c.html(<AuthorizeOtpMfaView
    logoUrl={logoUrl}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    showEmailMfaBtn={allowSwitch}
  />)
}

export const postAuthorizeOtpMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeMfaReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )

  if (!authCodeStore.user.otpSecret) throw new errorConfig.Forbidden()

  const ip = requestUtil.getRequestIP(c)
  const failedAttempts = await kvService.getFailedOtpMfaAttemptsByIP(
    c.env.KV,
    authCodeStore.user.id,
    ip,
  )
  if (failedAttempts >= 5) throw new errorConfig.Forbidden(localeConfig.Error.OtpMfaLocked)

  const { AUTHORIZATION_CODE_EXPIRES_IN: expiresIn } = env(c)

  const isValid = await kvService.stampOtpMfaCode(
    c.env.KV,
    bodyDto.code,
    bodyDto.mfaCode,
    authCodeStore.user.otpSecret,
    expiresIn,
  )

  if (!isValid) {
    await kvService.setFailedOtpMfaAttempts(
      c.env.KV,
      authCodeStore.user.id,
      ip,
      failedAttempts + 1,
    )
    throw new errorConfig.UnAuthorized(localeConfig.Error.WrongMfaCode)
  }

  if (!authCodeStore.user.otpVerified) {
    await userService.markOtpAsVerified(
      c,
      authCodeStore.user.id,
    )
  }

  return c.json(await identityUtil.processPostAuthorize(
    c,
    identityUtil.AuthorizeStep.OtpMfa,
    bodyDto.code,
    authCodeStore,
  ))
}

export const getAuthorizeEmailMfa = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)
  await validateUtil.dto(queryDto)

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  await handleSendEmailMfa(
    c,
    queryDto.code,
    queryDto.locale,
  )

  return c.html(<AuthorizeEmailMfaView
    logoUrl={logoUrl}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
  />)
}

export const postAuthorizeEmailMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeMfaReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const { AUTHORIZATION_CODE_EXPIRES_IN: expiresIn } = env(c)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )

  const isFallback = allowSwitchToEmailMfa(
    c,
    authCodeStore,
  )

  const isValid = await kvService.stampEmailMfaCode(
    c.env.KV,
    bodyDto.code,
    bodyDto.mfaCode,
    expiresIn,
    isFallback,
  )

  if (!isValid) throw new errorConfig.UnAuthorized(localeConfig.Error.WrongMfaCode)

  return c.json(await identityUtil.processPostAuthorize(
    c,
    identityUtil.AuthorizeStep.OtpEmail,
    bodyDto.code,
    authCodeStore,
  ))
}

export const postResendEmailMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeResendEmailMfaDto(reqBody)
  await validateUtil.dto(bodyDto)

  await handleSendEmailMfa(
    c,
    bodyDto.code,
    bodyDto.locale,
  )

  return c.json({ success: true })
}
