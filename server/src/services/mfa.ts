import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  adapterConfig,
  errorConfig, messageConfig, typeConfig, variableConfig,
} from 'configs'
import {
  appModel, userModel,
} from 'models'
import {
  emailService, kvService, smsService, userService,
} from 'services'
import {
  requestUtil, loggerUtil,
} from 'utils'
import { genRandomString } from '@melody-auth/shared'
import { setCookie } from 'hono/cookie'

export interface MfaConfig {
  requireEmailMfa: boolean;
  requireOtpMfa: boolean;
  requireSmsMfa: boolean;
  enforceOneMfaEnrollment: string[];
  allowEmailMfaAsBackup: boolean;
}

const getSystemMfaConfig = (c: Context<typeConfig.Context>): MfaConfig => {
  const {
    EMAIL_MFA_IS_REQUIRED: requireEmailMfa,
    OTP_MFA_IS_REQUIRED: requireOtpMfa,
    SMS_MFA_IS_REQUIRED: requireSmsMfa,
    ENFORCE_ONE_MFA_ENROLLMENT: enforceOneMfaEnrollment,
    ALLOW_EMAIL_MFA_AS_BACKUP: allowEmailMfaAsBackup,
  } = env(c)

  return {
    requireEmailMfa,
    requireOtpMfa,
    requireSmsMfa,
    enforceOneMfaEnrollment,
    allowEmailMfaAsBackup,
  }
}

export const getAppMfaConfig = (app: appModel.Record): MfaConfig | null => {
  if (!app.useSystemMfaConfig) {
    return {
      requireEmailMfa: app.requireEmailMfa,
      requireOtpMfa: app.requireOtpMfa,
      requireSmsMfa: app.requireSmsMfa,
      allowEmailMfaAsBackup: app.allowEmailMfaAsBackup,
      enforceOneMfaEnrollment: [],
    }
  }

  return null
}

export const getAuthCodeBodyMfaConfig = (mfaConfig: MfaConfig): typeConfig.AuthCodeBodyMfaConfig => {
  return {
    e: mfaConfig.requireEmailMfa,
    o: mfaConfig.requireOtpMfa,
    s: mfaConfig.requireSmsMfa,
    b: mfaConfig.allowEmailMfaAsBackup,
  }
}

export const getAuthorizeMfaConfig = (
  c: Context<typeConfig.Context>,
  authCodeBody: typeConfig.AuthCodeBody | typeConfig.EmbeddedSessionBodyWithUser,
): MfaConfig => {
  if (authCodeBody.mfa) {
    return {
      requireEmailMfa: authCodeBody.mfa.e,
      requireOtpMfa: authCodeBody.mfa.o,
      requireSmsMfa: authCodeBody.mfa.s,
      allowEmailMfaAsBackup: authCodeBody.mfa.b,
      enforceOneMfaEnrollment: [],
    }
  }

  return getSystemMfaConfig(c)
}

export const allowOtpSwitchToEmailMfa = (
  c: Context<typeConfig.Context>,
  authCodeStore: typeConfig.AuthCodeBody | typeConfig.EmbeddedSessionBodyWithUser,
) => {
  const {
    requireEmailMfa: enableEmailMfa,
    requireOtpMfa: enableOtpMfa,
    allowEmailMfaAsBackup: allowFallback,
  } = getAuthorizeMfaConfig(
    c,
    authCodeStore,
  )

  const notEnrolledEmail = !enableEmailMfa && !authCodeStore.user.mfaTypes.includes(userModel.MfaType.Email)
  const enrolledOtp = enableOtpMfa || authCodeStore.user.mfaTypes.includes(userModel.MfaType.Otp)

  return allowFallback && notEnrolledEmail && enrolledOtp
}

export const allowSmsSwitchToEmailMfa = (
  c: Context<typeConfig.Context>,
  authCodeStore: typeConfig.AuthCodeBody | typeConfig.EmbeddedSessionBodyWithUser,
) => {
  const {
    requireEmailMfa: enableEmailMfa,
    requireSmsMfa: enableSmsMfa,
    allowEmailMfaAsBackup: allowFallback,
  } = getAuthorizeMfaConfig(
    c,
    authCodeStore,
  )

  const notEnrolledEmail = !enableEmailMfa && !authCodeStore.user.mfaTypes.includes(userModel.MfaType.Email)
  const enrolledSms = enableSmsMfa || authCodeStore.user.mfaTypes.includes(userModel.MfaType.Sms)

  return allowFallback && notEnrolledEmail && enrolledSms
}

export const handleSendEmailMfa = async (
  c: Context<typeConfig.Context>,
  authCode: string,
  authCodeBody: typeConfig.AuthCodeBody | typeConfig.EmbeddedSessionBodyWithUser,
  locale: typeConfig.Locale,
  isPasswordlessCode: boolean = false,
) => {
  const {
    AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn,
    EMAIL_MFA_EMAIL_THRESHOLD: threshold,
    ENABLE_PASSWORDLESS_SIGN_IN: enablePasswordlessSignIn,
  } = env(c)

  const { requireEmailMfa: enableEmailMfa } = getAuthorizeMfaConfig(
    c,
    authCodeBody,
  )

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
      loggerUtil.triggerLogger(
        c,
        loggerUtil.LoggerLevel.Warn,
        messageConfig.RequestError.EmailMfaLocked,
      )
      throw new errorConfig.Forbidden(messageConfig.RequestError.EmailMfaLocked)
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

export const processEmailMfa = async (
  c: Context<typeConfig.Context>,
  authCode: string,
  authCodeStore: typeConfig.AuthCodeBody | typeConfig.EmbeddedSessionBodyWithUser,
  mfaCode: string,
) => {
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
    authCode,
    mfaCode,
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
}

export const handleGetOtpMfaSetup = async (
  c: Context<typeConfig.Context>,
  authCodeStore: typeConfig.AuthCodeBody | typeConfig.EmbeddedSessionBodyWithUser,
) => {
  if (authCodeStore.user.otpVerified) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.OtpAlreadySet,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.OtpAlreadySet)
  }

  let otpSecret = authCodeStore.user.otpSecret
  let user = null
  if (!otpSecret) {
    user = await userService.genUserOtp(
      c,
      authCodeStore.user.id,
    )

    otpSecret = user.otpSecret
  }

  const otpUri = `otpauth://totp/${authCodeStore.appName}:${authCodeStore.user.email}?secret=${otpSecret}&issuer=melody-auth&algorithm=SHA1&digits=6&period=30`

  return {
    otpUri,
    otpSecret,
    user,
  }
}

export const processOtpMfa = async (
  c: Context<typeConfig.Context>,
  authCode: string,
  authCodeStore: typeConfig.AuthCodeBody | typeConfig.EmbeddedSessionBodyWithUser,
  mfaCode: string,
) => {
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
    authCode,
    mfaCode,
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
}

export const handleSmsMfaSetup = async (
  c: Context<typeConfig.Context>,
  authCode: string,
  authCodeStore: typeConfig.AuthCodeBody | typeConfig.EmbeddedSessionBodyWithUser,
  phoneNumber: string,
  locale: typeConfig.Locale,
) => {
  if (authCodeStore.user.smsPhoneNumber && authCodeStore.user.smsPhoneNumberVerified) {
    throw new errorConfig.Forbidden(messageConfig.RequestError.MfaEnrolled)
  }

  await handleSendSmsMfa(
    c,
    phoneNumber,
    authCode,
    authCodeStore,
    locale,
  )

  await userModel.update(
    c.env.DB,
    authCodeStore.user.id,
    {
      smsPhoneNumber: phoneNumber,
      smsPhoneNumberVerified: 0,
    },
  )
}

export const handleSendSmsMfa = async (
  c: Context<typeConfig.Context>,
  phoneNumber: string,
  authCode: string,
  authCodeBody: typeConfig.AuthCodeBody | typeConfig.EmbeddedSessionBodyWithUser,
  locale: typeConfig.Locale,
): Promise<true> => {
  const {
    AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn,
    SMS_MFA_MESSAGE_THRESHOLD: threshold,
  } = env(c)

  const { requireSmsMfa: enableSmsMfa } = getAuthorizeMfaConfig(
    c,
    authCodeBody,
  )

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

export const getSmsMfaInfo = async (
  c: Context<typeConfig.Context>,
  authCode: string,
  authCodeStore: typeConfig.AuthCodeBody | typeConfig.EmbeddedSessionBodyWithUser,
  locale: typeConfig.Locale,
) => {
  const { requireSmsMfa: enableSmsMfa } = getAuthorizeMfaConfig(
    c,
    authCodeStore,
  )

  const requireSmsMfa = enableSmsMfa || authCodeStore.user.mfaTypes.includes(userModel.MfaType.Sms)
  if (!requireSmsMfa) throw new errorConfig.Forbidden()

  if (authCodeStore.user.smsPhoneNumber && authCodeStore.user.smsPhoneNumberVerified) {
    await handleSendSmsMfa(
      c,
      authCodeStore.user.smsPhoneNumber,
      authCode,
      authCodeStore,
      locale,
    )
  }

  const phoneNumber = authCodeStore.user.smsPhoneNumber
  const maskedNumber = phoneNumber && authCodeStore.user.smsPhoneNumberVerified
    ? '*'.repeat(phoneNumber.length - 4) + phoneNumber.slice(-4)
    : null

  const allowFallbackToEmailMfa = allowSmsSwitchToEmailMfa(
    c,
    authCodeStore,
  )

  return {
    allowFallbackToEmailMfa,
    countryCode: variableConfig.SmsMfaConfig.CountryCode,
    phoneNumber: maskedNumber,
  }
}

export const processSmsMfa = async (
  c: Context<typeConfig.Context>,
  authCode: string,
  authCodeStore: typeConfig.AuthCodeBody | typeConfig.EmbeddedSessionBodyWithUser,
  mfaCode: string,
) => {
  const { AUTHORIZATION_CODE_EXPIRES_IN: expiresIn } = env(c)

  const isValid = await kvService.stampSmsMfaCode(
    c.env.KV,
    authCode,
    mfaCode,
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
}

export const handleSendSmsMfaCode = async (
  c: Context<typeConfig.Context>,
  authCode: string,
  authCodeStore: typeConfig.AuthCodeBody | typeConfig.EmbeddedSessionBodyWithUser,
  locale: typeConfig.Locale,
) => {
  if (!authCodeStore.user.smsPhoneNumber) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.SmsMfaNotSetup,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.SmsMfaNotSetup)
  }

  await handleSendSmsMfa(
    c,
    authCodeStore.user.smsPhoneNumber,
    authCode,
    authCodeStore,
    locale,
  )
}

export const getMfaEnrollmentInfo = async (
  c: Context<typeConfig.Context>,
  authCodeStore: typeConfig.AuthCodeBody | typeConfig.EmbeddedSessionBodyWithUser,
) => {
  if (authCodeStore.user.mfaTypes.length) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.MfaEnrolled,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.MfaEnrolled)
  }

  const { ENFORCE_ONE_MFA_ENROLLMENT: mfaTypes } = env(c)

  return { mfaTypes }
}

export const processMfaEnrollment = async (
  c: Context<typeConfig.Context>,
  authCodeStore: typeConfig.AuthCodeBody | typeConfig.EmbeddedSessionBodyWithUser,
  type: userModel.MfaType,
) => {
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
    type,
  )

  return user
}

export const rememberEmailMfaDevice = async (
  c: Context<typeConfig.Context>,
  rememberDevice: boolean,
  userId: number,
) => {
  const { ENABLE_MFA_REMEMBER_DEVICE: enableMfaRememberDevice } = env(c)

  if (rememberDevice && enableMfaRememberDevice) {
    const deviceId = genRandomString(24)
    const cookieValue = genRandomString(128)

    const cookieKey = adapterConfig.getEmailMfaRememberDeviceCookieKey(userId)
    setCookie(
      c,
      cookieKey,
      `${deviceId}-${cookieValue}`,
      {
        httpOnly: true,
        secure: true,
        path: '/',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sameSite: 'strict',
      },
    )

    await kvService.storeEmailMfaRememberDevice(
      c.env.KV,
      userId,
      deviceId,
      cookieValue,
    )
  }
}

export const rememberSmsMfaDevice = async (
  c: Context<typeConfig.Context>,
  rememberDevice: boolean,
  userId: number,
) => {
  const { ENABLE_MFA_REMEMBER_DEVICE: enableMfaRememberDevice } = env(c)

  if (rememberDevice && enableMfaRememberDevice) {
    const deviceId = genRandomString(24)
    const cookieValue = genRandomString(128)

    const cookieKey = adapterConfig.getSmsMfaRememberDeviceCookieKey(userId)
    setCookie(
      c,
      cookieKey,
      `${deviceId}-${cookieValue}`,
      {
        httpOnly: true,
        secure: true,
        path: '/',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sameSite: 'strict',
      },
    )

    await kvService.storeSmsMfaRememberDevice(
      c.env.KV,
      userId,
      deviceId,
      cookieValue,
    )
  }
}

export const rememberOtpMfaDevice = async (
  c: Context<typeConfig.Context>,
  rememberDevice: boolean,
  userId: number,
) => {
  const { ENABLE_MFA_REMEMBER_DEVICE: enableMfaRememberDevice } = env(c)

  if (rememberDevice && enableMfaRememberDevice) {
    const deviceId = genRandomString(24)
    const cookieValue = genRandomString(128)

    const cookieKey = adapterConfig.getOtpMfaRememberDeviceCookieKey(userId)
    setCookie(
      c,
      cookieKey,
      `${deviceId}-${cookieValue}`,
      {
        httpOnly: true,
        secure: true,
        path: '/',
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        sameSite: 'strict',
      },
    )

    await kvService.storeOtpMfaRememberDevice(
      c.env.KV,
      userId,
      deviceId,
      cookieValue,
    )
  }
}