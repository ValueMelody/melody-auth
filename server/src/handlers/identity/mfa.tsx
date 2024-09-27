import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig, localeConfig, routeConfig, typeConfig,
} from 'configs'
import { identityDto } from 'dtos'
import {
  emailService, kvService, smsService, userService,
} from 'services'
import {
  identityUtil,
  requestUtil, validateUtil,
} from 'utils'
import {
  AuthorizeEmailMfaView, AuthorizeOtpMfaView,
  AuthorizeMfaEnrollView,
  AuthorizeSmsMfaView,
} from 'views'
import { AuthCodeBody } from 'configs/type'
import { userModel } from 'models'

const allowOtpSwitchToEmailMfa = (
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

const handleSendEmailMfa = async (
  c: Context<typeConfig.Context>,
  authCode: string,
  locale: typeConfig.Locale,
) => {
  const {
    EMAIL_MFA_IS_REQUIRED: enableEmailMfa,
    AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn,
    EMAIL_MFA_EMAIL_THRESHOLD: threshold,
  } = env(c)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    authCode,
  )
  if (!authCodeBody) return false

  const requireEmailMfa = enableEmailMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Email)
  const couldFallbackAsOtp = allowOtpSwitchToEmailMfa(
    c,
    authCodeBody,
  )
  const couldFallbackAsSms = allowSmsSwitchToEmailMfa(
    c,
    authCodeBody,
  )

  if (!requireEmailMfa && !couldFallbackAsOtp && !couldFallbackAsSms) throw new errorConfig.Forbidden()

  const ip = requestUtil.getRequestIP(c)
  const attempts = await kvService.getEmailMfaEmailAttemptsByIP(
    c.env.KV,
    authCodeBody.user.id,
    ip,
  )

  if (threshold) {
    if (attempts >= threshold) throw new errorConfig.Forbidden(localeConfig.Error.EmailMfaLocked)

    await kvService.setEmailMfaEmailAttempts(
      c.env.KV,
      authCodeBody.user.id,
      ip,
      attempts + 1,
    )
  }

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

  return true
}

const allowSmsSwitchToEmailMfa = (
  c: Context<typeConfig.Context>,
  authCodeStore: AuthCodeBody,
) => {
  if (!authCodeStore.user.smsPhoneNumber || !authCodeStore.user.smsPhoneNumberVerified) return false

  const {
    SMS_MFA_IS_REQUIRED: enableSmsMfa,
    EMAIL_MFA_IS_REQUIRED: enableEmailMfa,
    ALLOW_EMAIL_MFA_AS_BACKUP: allowFallback,
  } = env(c)
  const notEnrolledEmail = !enableEmailMfa && !authCodeStore.user.mfaTypes.includes(userModel.MfaType.Email)
  const enrolledSms = enableSmsMfa || authCodeStore.user.mfaTypes.includes(userModel.MfaType.Sms)

  return allowFallback && notEnrolledEmail && enrolledSms
}

const handleSendSmsMfa = async (
  c: Context<typeConfig.Context>,
  phoneNumber: string,
  authCode: string,
  authCodeBody: typeConfig.AuthCodeBody,
  locale: typeConfig.Locale,
) => {
  const {
    SMS_MFA_IS_REQUIRED: enableSmsMfa,
    AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn,
    SMS_MFA_MESSAGE_THRESHOLD: threshold,
  } = env(c)

  const requireSmsMfa = enableSmsMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Sms)

  if (!requireSmsMfa) throw new errorConfig.Forbidden()

  const ip = requestUtil.getRequestIP(c)
  const attempts = await kvService.getSmsMfaMessageAttemptsByIP(
    c.env.KV,
    authCodeBody.user.id,
    ip,
  )

  if (threshold) {
    if (attempts >= threshold) throw new errorConfig.Forbidden(localeConfig.Error.SmsMfaLocked)

    await kvService.setSmsMfaMessageAttempts(
      c.env.KV,
      authCodeBody.user.id,
      ip,
      attempts + 1,
    )
  }

  const mfaCode = await smsService.sendSmsMfa(
    c,
    phoneNumber,
    locale,
  )
  if (mfaCode) {
    await kvService.storeSmsMfaCode(
      c.env.KV,
      authCode,
      mfaCode,
      codeExpiresIn,
    )
  }

  return true
}

export const getAuthorizeMfaEnroll = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authCodeStore) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)

  if (authCodeStore.user.mfaTypes.length) throw new errorConfig.Forbidden(localeConfig.Error.MfaEnrolled)

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
    ENFORCE_ONE_MFA_ENROLLMENT: mfaTypes,
  } = env(c)

  return c.html(<AuthorizeMfaEnrollView
    logoUrl={logoUrl}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    mfaTypes={mfaTypes}
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
  if (!authCodeStore) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

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
  if (!authCodeStore) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)

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
  if (!authCodeBody) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)

  const allowSwitch = allowOtpSwitchToEmailMfa(
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
  if (!authCodeStore) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

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

export const getAuthorizeSmsMfa = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)
  await validateUtil.dto(queryDto)

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
    SMS_MFA_IS_REQUIRED: enableSmsMfa,
  } = env(c)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authCodeBody) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)

  const requireSmsMfa = enableSmsMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Sms)
  if (!requireSmsMfa) throw new errorConfig.Forbidden()

  if (authCodeBody.user.smsPhoneNumber && authCodeBody.user.smsPhoneNumberVerified) {
    await handleSendSmsMfa(
      c,
      authCodeBody.user.smsPhoneNumber,
      queryDto.code,
      authCodeBody,
      queryDto.locale || locales[0],
    )
  }

  const phoneNumber = authCodeBody.user.smsPhoneNumber
  const maskedNumber = phoneNumber && authCodeBody.user.smsPhoneNumberVerified
    ? '*'.repeat(phoneNumber.length - 4) + phoneNumber.slice(-4)
    : null

  const allowSwitch = allowSmsSwitchToEmailMfa(
    c,
    authCodeBody,
  )

  return c.html(<AuthorizeSmsMfaView
    phoneNumber={maskedNumber}
    logoUrl={logoUrl}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    showEmailMfaBtn={allowSwitch}
  />)
}

export const postAuthorizeSmsMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeMfaReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeStore) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

  const { AUTHORIZATION_CODE_EXPIRES_IN: expiresIn } = env(c)

  const isValid = await kvService.stampSmsMfaCode(
    c.env.KV,
    bodyDto.code,
    bodyDto.mfaCode,
    expiresIn,
  )

  if (!isValid) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.WrongMfaCode)
  }

  if (!authCodeStore.user.smsPhoneNumberVerified) {
    await userModel.update(
      c.env.DB,
      authCodeStore.user.id,
      { smsPhoneNumberVerified: 1 },
    )
  }

  return c.json(await identityUtil.processPostAuthorize(
    c,
    identityUtil.AuthorizeStep.SmsMfa,
    bodyDto.code,
    authCodeStore,
  ))
}

export const postSetupSmsMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const { SUPPORTED_LOCALES: locales } = env(c)

  const bodyDto = new identityDto.PostSetupSmsMfaReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeBody) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

  if (authCodeBody.user.smsPhoneNumber && authCodeBody.user.smsPhoneNumberVerified) throw new errorConfig.Forbidden()

  const smsRes = await handleSendSmsMfa(
    c,
    bodyDto.phoneNumber,
    bodyDto.code,
    authCodeBody,
    bodyDto.locale || locales[0],
  )
  if (!smsRes) throw new errorConfig.Forbidden()

  await userModel.update(
    c.env.DB,
    authCodeBody.user.id,
    {
      smsPhoneNumber: bodyDto.phoneNumber,
      smsPhoneNumberVerified: 0,
    },
  )

  return c.json({ success: true })
}

export const resendSmsMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const { SUPPORTED_LOCALES: locales } = env(c)

  const bodyDto = new identityDto.PostAuthorizeFollowUpReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeBody) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

  if (!authCodeBody.user.smsPhoneNumber) throw new errorConfig.Forbidden()

  const smsRes = await handleSendSmsMfa(
    c,
    authCodeBody.user.smsPhoneNumber,
    bodyDto.code,
    authCodeBody,
    bodyDto.locale || locales[0],
  )
  if (!smsRes) throw new errorConfig.Forbidden()

  return c.json({ success: true })
}

export const getAuthorizeEmailMfa = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)
  await validateUtil.dto(queryDto)

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  const emailRes = await handleSendEmailMfa(
    c,
    queryDto.code,
    queryDto.locale,
  )
  if (!emailRes) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)

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
  if (!authCodeStore) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

  const isOtpFallback = allowOtpSwitchToEmailMfa(
    c,
    authCodeStore,
  )

  const isSmsFallback = allowSmsSwitchToEmailMfa(
    c,
    authCodeStore,
  )

  const isValid = await kvService.stampEmailMfaCode(
    c.env.KV,
    bodyDto.code,
    bodyDto.mfaCode,
    expiresIn,
    isOtpFallback,
    isSmsFallback,
  )

  if (!isValid) throw new errorConfig.UnAuthorized(localeConfig.Error.WrongMfaCode)

  return c.json(await identityUtil.processPostAuthorize(
    c,
    identityUtil.AuthorizeStep.EmailMfa,
    bodyDto.code,
    authCodeStore,
  ))
}

export const postResendEmailMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const { SUPPORTED_LOCALES: locales } = env(c)

  const bodyDto = new identityDto.PostAuthorizeFollowUpReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const emailRes = await handleSendEmailMfa(
    c,
    bodyDto.code,
    bodyDto.locale || locales[0],
  )
  if (!emailRes) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

  return c.json({ success: true })
}
