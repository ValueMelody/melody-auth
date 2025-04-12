import {
  Context, TypedResponse,
} from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig, messageConfig, typeConfig,
  variableConfig,
} from 'configs'
import { identityDto } from 'dtos'
import {
  identityService,
  emailService, kvService, smsService, userService,
} from 'services'
import {
  requestUtil, validateUtil, loggerUtil,
} from 'utils'
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

export const handleSendEmailMfa = async (
  c: Context<typeConfig.Context>,
  authCode: string,
  locale: typeConfig.Locale,
  isPasswordlessCode: boolean = false,
) => {
  const {
    EMAIL_MFA_IS_REQUIRED: enableEmailMfa,
    AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn,
    EMAIL_MFA_EMAIL_THRESHOLD: threshold,
    ENABLE_PASSWORDLESS_SIGN_IN: enablePasswordlessSignIn,
  } = env(c)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    authCode,
  )
  if (!authCodeBody) {
    return {
      result: false,
      reason: messageConfig.RequestError.WrongAuthCode,
    }
  }

  const requireEmailMfa = enableEmailMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Email)
  const couldFallbackAsOtp = allowOtpSwitchToEmailMfa(
    c,
    authCodeBody,
  )
  const couldFallbackAsSms = allowSmsSwitchToEmailMfa(
    c,
    authCodeBody,
  )

  if (
    !authCodeBody.user.email ||
    (!requireEmailMfa && !couldFallbackAsOtp && !couldFallbackAsSms && !enablePasswordlessSignIn)
  ) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.NotSupposeToSendEmailMfa,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.NotSupposeToSendEmailMfa)
  }

  const ip = requestUtil.getRequestIP(c)
  const attempts = await kvService.getEmailMfaEmailAttemptsByIP(
    c.env.KV,
    authCodeBody.user.id,
    ip,
  )

  if (threshold) {
    if (attempts >= threshold) {
      return {
        result: false,
        reason: messageConfig.RequestError.EmailMfaLocked,
      }
    }

    await kvService.setEmailMfaEmailAttempts(
      c.env.KV,
      authCodeBody.user.id,
      ip,
      attempts + 1,
    )
  }

  const mfaCode = await emailService.sendEmailMfa(
    c,
    authCodeBody.user.email,
    authCodeBody.user.orgSlug,
    locale,
  )
  if (mfaCode) {
    if (isPasswordlessCode) {
      await kvService.storePasswordlessCode(
        c.env.KV,
        authCode,
        mfaCode,
        codeExpiresIn,
      )
    } else {
      await kvService.storeEmailMfaCode(
        c.env.KV,
        authCode,
        mfaCode,
        codeExpiresIn,
      )
    }
  }

  return { result: true }
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
): Promise<true> => {
  const {
    SMS_MFA_IS_REQUIRED: enableSmsMfa,
    AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn,
    SMS_MFA_MESSAGE_THRESHOLD: threshold,
  } = env(c)

  const requireSmsMfa = enableSmsMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Sms)

  if (!requireSmsMfa) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.NotSupposeToSendSmsMfa,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.NotSupposeToSendSmsMfa)
  }

  const ip = requestUtil.getRequestIP(c)
  const attempts = await kvService.getSmsMfaMessageAttemptsByIP(
    c.env.KV,
    authCodeBody.user.id,
    ip,
  )

  if (threshold) {
    if (attempts >= threshold) {
      loggerUtil.triggerLogger(
        c,
        loggerUtil.LoggerLevel.Warn,
        messageConfig.RequestError.SmsMfaLocked,
      )
      throw new errorConfig.Forbidden(messageConfig.RequestError.SmsMfaLocked)
    }

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

export interface GetProcessMfaEnrollRes {
  mfaTypes: userModel.MfaType[];
}
export const getProcessMfaEnroll = async (c: Context<typeConfig.Context>)
:Promise<TypedResponse<GetProcessMfaEnrollRes>> => {
  const queryDto = await identityDto.parseGetProcess(c)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authCodeStore) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }

  if (authCodeStore.user.mfaTypes.length) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.MfaEnrolled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.MfaEnrolled)
  }

  const { ENFORCE_ONE_MFA_ENROLLMENT: mfaTypes } = env(c)

  return c.json({ mfaTypes })
}

export const postProcessMfaEnroll = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostProcessMfaEnrollDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeStore) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }

  if (authCodeStore.user.mfaTypes.length) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.MfaEnrolled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.MfaEnrolled)
  }

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

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.MfaEnroll,
    bodyDto.code,
    newAuthCodeStore,
  ))
}

export const postSendEmailMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostProcessDto(reqBody)
  await validateUtil.dto(bodyDto)

  const isPasswordlessCode = false
  const emailRes = await handleSendEmailMfa(
    c,
    bodyDto.code,
    bodyDto.locale,
    isPasswordlessCode,
  )
  if (!emailRes || (!emailRes.result && emailRes.reason === messageConfig.RequestError.WrongAuthCode)) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }

  if (!emailRes.result && emailRes.reason === messageConfig.RequestError.EmailMfaLocked) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.EmailMfaLocked,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.EmailMfaLocked)
  }

  return c.json({ success: true })
}

export const postProcessEmailMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeMfaDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeStore) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }

  const isOtpFallback = allowOtpSwitchToEmailMfa(
    c,
    authCodeStore,
  )

  const isSmsFallback = allowSmsSwitchToEmailMfa(
    c,
    authCodeStore,
  )

  const { AUTHORIZATION_CODE_EXPIRES_IN: expiresIn } = env(c)

  const isValid = await kvService.stampEmailMfaCode(
    c.env.KV,
    bodyDto.code,
    bodyDto.mfaCode,
    expiresIn,
    isOtpFallback,
    isSmsFallback,
  )

  if (!isValid) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongEmailMfaCode,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.WrongMfaCode)
  }

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.EmailMfa,
    bodyDto.code,
    authCodeStore,
  ))
}

export const postSetupSmsMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostSetupSmsMfaDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeBody) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }

  if (authCodeBody.user.smsPhoneNumber && authCodeBody.user.smsPhoneNumberVerified) {
    throw new errorConfig.Forbidden(messageConfig.RequestError.MfaEnrolled)
  }

  await handleSendSmsMfa(
    c,
    bodyDto.phoneNumber,
    bodyDto.code,
    authCodeBody,
    bodyDto.locale,
  )

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

  const bodyDto = new identityDto.PostProcessDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeBody) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }

  if (!authCodeBody.user.smsPhoneNumber) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.SmsMfaNotSetup,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.SmsMfaNotSetup)
  }

  await handleSendSmsMfa(
    c,
    authCodeBody.user.smsPhoneNumber,
    bodyDto.code,
    authCodeBody,
    bodyDto.locale,
  )

  return c.json({ success: true })
}

export interface GetProcessSmsMfaRes {
  allowFallbackToEmailMfa: boolean;
  countryCode: string;
  phoneNumber: string | null;
}
export const getProcessSmsMfa = async (c: Context<typeConfig.Context>)
:Promise<TypedResponse<GetProcessSmsMfaRes>> => {
  const queryDto = await identityDto.parseGetProcess(c)
  await validateUtil.dto(queryDto)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authCodeBody) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }

  const { SMS_MFA_IS_REQUIRED: enableSmsMfa } = env(c)

  const requireSmsMfa = enableSmsMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Sms)
  if (!requireSmsMfa) throw new errorConfig.Forbidden()

  if (authCodeBody.user.smsPhoneNumber && authCodeBody.user.smsPhoneNumberVerified) {
    await handleSendSmsMfa(
      c,
      authCodeBody.user.smsPhoneNumber,
      queryDto.code,
      authCodeBody,
      queryDto.locale,
    )
  }

  const phoneNumber = authCodeBody.user.smsPhoneNumber
  const maskedNumber = phoneNumber && authCodeBody.user.smsPhoneNumberVerified
    ? '*'.repeat(phoneNumber.length - 4) + phoneNumber.slice(-4)
    : null

  const allowFallbackToEmailMfa = allowSmsSwitchToEmailMfa(
    c,
    authCodeBody,
  )

  return c.json({
    allowFallbackToEmailMfa,
    countryCode: variableConfig.SmsMfaConfig.CountryCode,
    phoneNumber: maskedNumber,
  })
}

export const postProcessSmsMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeMfaDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeStore) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }

  const { AUTHORIZATION_CODE_EXPIRES_IN: expiresIn } = env(c)

  const isValid = await kvService.stampSmsMfaCode(
    c.env.KV,
    bodyDto.code,
    bodyDto.mfaCode,
    expiresIn,
  )

  if (!isValid) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongSmsMfaCode,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.WrongMfaCode)
  }

  if (!authCodeStore.user.smsPhoneNumberVerified) {
    await userModel.update(
      c.env.DB,
      authCodeStore.user.id,
      { smsPhoneNumberVerified: 1 },
    )
  }

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.SmsMfa,
    bodyDto.code,
    authCodeStore,
  ))
}

export interface GetOtpMfaSetupRes {
  otpUri: string;
}
export const getOtpMfaSetup = async (c: Context<typeConfig.Context>)
:Promise<TypedResponse<GetOtpMfaSetupRes>> => {
  const queryDto = await identityDto.parseGetProcess(c)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authCodeStore) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }

  if (authCodeStore.user.otpVerified) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.OtpAlreadySet,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.OtpAlreadySet)
  }

  let otpSecret = authCodeStore.user.otpSecret
  if (!otpSecret) {
    const user = await userService.genUserOtp(
      c,
      authCodeStore.user.id,
    )

    const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)
    const newAuthCodeStore = {
      ...authCodeStore,
      user,
    }
    await kvService.storeAuthCode(
      c.env.KV,
      queryDto.code,
      newAuthCodeStore,
      codeExpiresIn,
    )

    otpSecret = user.otpSecret
  }

  const otpUri = `otpauth://totp/${authCodeStore.appName}:${authCodeStore.user.email}?secret=${otpSecret}&issuer=melody-auth&algorithm=SHA1&digits=6&period=30`

  return c.json({ otpUri })
}

export interface GetProcessOtpMfaRes {
  allowFallbackToEmailMfa: boolean;
}
export const getProcessOtpMfa = async (c: Context<typeConfig.Context>)
:Promise<TypedResponse<GetProcessOtpMfaRes>> => {
  const queryDto = await identityDto.parseGetProcess(c)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authCodeBody) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }

  const allowFallbackToEmailMfa = allowOtpSwitchToEmailMfa(
    c,
    authCodeBody,
  )

  return c.json({ allowFallbackToEmailMfa })
}

export const postProcessOtpMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeMfaDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeStore) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }

  if (!authCodeStore.user.otpSecret) throw new errorConfig.Forbidden()

  const ip = requestUtil.getRequestIP(c)
  const failedAttempts = await kvService.getFailedOtpMfaAttemptsByIP(
    c.env.KV,
    authCodeStore.user.id,
    ip,
  )
  if (failedAttempts >= 5) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.OtpMfaLocked,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.OtpMfaLocked)
  }

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
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongOtpMfaCode,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.WrongMfaCode)
  }

  if (!authCodeStore.user.otpVerified) {
    await userService.markOtpAsVerified(
      c,
      authCodeStore.user.id,
    )
  }

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.OtpMfa,
    bodyDto.code,
    authCodeStore,
  ))
}
