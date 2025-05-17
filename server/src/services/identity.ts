import { Context } from 'hono'
import { env } from 'hono/adapter'
import { genRandomString } from '@melody-auth/shared'
import {
  errorConfig,
  messageConfig,
  routeConfig,
  typeConfig,
} from 'configs'
import {
  consentService, passkeyService, sessionService, appService, kvService, mfaService,
  scopeService,
  userService,
  emailService,
} from 'services'
import { userModel } from 'models'
import {
  loggerUtil, requestUtil,
} from 'utils'
import { oauthDto } from 'dtos'

export enum AuthorizeStep {
  Account = 0,
  Password = 0,
  Passwordless = 0,
  Social = 0,
  PasskeyVerify = 0,
  PasswordlessVerify = 1,
  Consent = 2,
  MfaEnroll = 3,
  OtpMfa = 4,
  SmsMfa = 5,
  EmailMfa = 6,
  PasskeyEnroll = 7,
}

const getNextPageForPolicy = (
  c: Context<typeConfig.Context>, authCodeBody: typeConfig.AuthCodeBody, isSocialLogin: boolean,
) => {
  let nextPage
  if (!isSocialLogin) {
    const {
      ENABLE_PASSWORD_RESET: enablePasswordReset,
      ENABLE_EMAIL_VERIFICATION: enableEmailVerification,
      ALLOW_PASSKEY_ENROLLMENT: enablePasskeyEnrollment,
    } = env(c)

    switch (authCodeBody.request.policy) {
    case oauthDto.Policy.ChangePassword: {
      if (enablePasswordReset) nextPage = routeConfig.View.ChangePassword
      break
    }
    case oauthDto.Policy.ChangeEmail: {
      if (enableEmailVerification) nextPage = routeConfig.View.ChangeEmail
      break
    }
    case oauthDto.Policy.ResetMfa: {
      nextPage = routeConfig.View.ResetMfa
      break
    }
    case oauthDto.Policy.ManagePasskey: {
      if (enablePasskeyEnrollment) nextPage = routeConfig.View.ManagePasskey
      break
    }
    case oauthDto.Policy.UpdateInfo: {
      nextPage = routeConfig.View.UpdateInfo
      break
    }
    }
  }

  return nextPage
}

export const processPostAuthorize = async (
  c: Context<typeConfig.Context>,
  step: AuthorizeStep,
  authCode: string,
  authCodeBody: typeConfig.AuthCodeBody,
) => {
  const basicInfo = {
    code: authCode,
    redirectUri: authCodeBody.request.redirectUri,
    state: authCodeBody.request.state,
    scopes: authCodeBody.request.scopes,
  }

  const {
    requireEmailMfa: enableEmailMfa,
    requireOtpMfa: enableOtpMfa,
    requireSmsMfa: enableSmsMfa,
    enforceOneMfaEnrollment: enforceMfa,
  } = mfaService.getAuthorizeMfaConfig(
    c,
    authCodeBody,
  )

  const {
    ENABLE_PASSWORDLESS_SIGN_IN: enablePasswordlessSignIn,
    ALLOW_PASSKEY_ENROLLMENT: enablePasskeyEnrollment,
  } = env(c)

  const isSocialLogin = !!authCodeBody.user.socialAccountId

  const requirePasswordlessVerify =
    step < 1 &&
    enablePasswordlessSignIn &&
    !isSocialLogin &&
    !authCodeBody.isFullyAuthorized
  if (requirePasswordlessVerify) {
    return {
      ...basicInfo, nextPage: routeConfig.View.PasswordlessVerify,
    }
  }

  const requireConsent = step < 2 && await consentService.shouldCollectConsent(
    c,
    authCodeBody.user.id,
    authCodeBody.appId,
  )
  if (requireConsent) {
    return {
      ...basicInfo, nextPage: routeConfig.View.Consent,
    }
  }

  const authorizedResult = {
    code: authCode,
    redirectUri: authCodeBody.request.redirectUri,
    state: authCodeBody.request.state,
    scopes: authCodeBody.request.scopes,
    nextPage: undefined,
  }

  if (authCodeBody.isFullyAuthorized) {
    const nextPage = getNextPageForPolicy(
      c,
      authCodeBody,
      isSocialLogin,
    )
    return {
      ...authorizedResult, nextPage,
    }
  }

  const requireMfaEnroll =
    step < 3 &&
    !isSocialLogin &&
    !!enforceMfa?.length &&
    !enableEmailMfa &&
    !enableOtpMfa &&
    !enableSmsMfa &&
    !authCodeBody.user.mfaTypes.length
  if (requireMfaEnroll) {
    return {
      ...basicInfo, nextPage: routeConfig.View.MfaEnroll,
    }
  }

  const requireOtpMfa =
    step < 4 &&
    !isSocialLogin &&
    (enableOtpMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Otp))
  const requireOtpSetup = requireOtpMfa && !authCodeBody.user.otpVerified
  if (requireOtpSetup) {
    return {
      ...basicInfo, nextPage: routeConfig.View.OtpSetup,
    }
  }
  if (requireOtpMfa) {
    return {
      ...basicInfo, nextPage: routeConfig.View.OtpMfa,
    }
  }

  const requireSmsMfa =
    step < 5 &&
    !isSocialLogin &&
    (enableSmsMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Sms))
  if (requireSmsMfa) {
    return {
      ...basicInfo, nextPage: routeConfig.View.SmsMfa,
    }
  }

  const requireEmailMfa =
    step < 6 &&
    !isSocialLogin &&
    (enableEmailMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Email))
  if (requireEmailMfa) {
    return {
      ...basicInfo, nextPage: routeConfig.View.EmailMfa,
    }
  }

  const requirePasskeyEnroll =
    step < 7 &&
    !isSocialLogin &&
    enablePasskeyEnrollment
  if (requirePasskeyEnroll && !authCodeBody.user.skipPasskeyEnroll) {
    const passkey = await passkeyService.getPasskeyByUser(
      c,
      authCodeBody.user.id,
    )
    if (!passkey) {
      return {
        ...basicInfo, nextPage: routeConfig.View.PasskeyEnroll,
      }
    }
  }

  if (step < 8) {
    const nextPage = getNextPageForPolicy(
      c,
      authCodeBody,
      isSocialLogin,
    )
    if (nextPage) {
      return {
        ...basicInfo, nextPage,
      }
    }
  }

  sessionService.setAuthInfoSession(
    c,
    authCodeBody,
  )

  return authorizedResult
}

export const processSignIn = async (
  c: Context<typeConfig.Context>,
  bodyDto: oauthDto.GetAuthorizeDto,
  user: userModel.Record,
) => {
  const app = await appService.verifySPAClientRequest(
    c,
    bodyDto.clientId,
    bodyDto.redirectUri,
  )

  const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)

  const mfaConfig = mfaService.getAppMfaConfig(app)

  const request = new oauthDto.GetAuthorizeDto(bodyDto)
  const authCode = genRandomString(128)
  const authCodeBody = {
    appId: app.id,
    appName: app.name,
    user,
    request,
    mfa: mfaConfig ? mfaService.getAuthCodeBodyMfaConfig(mfaConfig) : undefined,
  }
  await kvService.storeAuthCode(
    c.env.KV,
    authCode,
    authCodeBody,
    codeExpiresIn,
  )

  return {
    authCode,
    authCodeBody,
  }
}

export const processGetAppConsent = async (
  c: Context<typeConfig.Context>,
  request: oauthDto.CoreAuthorizeDto,
) => {
  const app = await appService.verifySPAClientRequest(
    c,
    request.clientId,
    request.redirectUri,
  )

  const scopes = await scopeService.getScopesByName(
    c,
    request.scopes,
  )

  return {
    scopes,
    appName: app.name,
  }
}

export const processResetPassword = async (
  c: Context<typeConfig.Context>,
  email: string,
  locale: typeConfig.Locale,
) => {
  if (!email) throw new errorConfig.Forbidden()

  const ip = requestUtil.getRequestIP(c)
  const { PASSWORD_RESET_EMAIL_THRESHOLD: resetThreshold } = env(c)

  if (resetThreshold) {
    const resetAttempts = await kvService.getPasswordResetAttemptsByIP(
      c.env.KV,
      email,
      ip,
    )
    if (resetAttempts >= resetThreshold) {
      loggerUtil.triggerLogger(
        c,
        loggerUtil.LoggerLevel.Warn,
        messageConfig.RequestError.PasswordResetLocked,
      )
      throw new errorConfig.Forbidden(messageConfig.RequestError.PasswordResetLocked)
    }

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
}

export const allowOtpSwitchToEmailMfa = (
  c: Context<typeConfig.Context>,
  authCodeStore: typeConfig.AuthCodeBody | typeConfig.EmbeddedSessionBodyWithUser,
) => {
  const {
    requireEmailMfa: enableEmailMfa,
    requireOtpMfa: enableOtpMfa,
    allowEmailMfaAsBackup: allowFallback,
  } = mfaService.getAuthorizeMfaConfig(
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
  } = mfaService.getAuthorizeMfaConfig(
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

  const { requireEmailMfa: enableEmailMfa } = mfaService.getAuthorizeMfaConfig(
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
