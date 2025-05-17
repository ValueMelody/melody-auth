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
  identityService, mfaService,
  kvService, smsService, userService,
} from 'services'
import {
  requestUtil, validateUtil, loggerUtil,
} from 'utils'
import { userModel } from 'models'

const handleSendSmsMfa = async (
  c: Context<typeConfig.Context>,
  phoneNumber: string,
  authCode: string,
  authCodeBody: typeConfig.AuthCodeBody,
  locale: typeConfig.Locale,
): Promise<true> => {
  const {
    AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn,
    SMS_MFA_MESSAGE_THRESHOLD: threshold,
  } = env(c)

  const { requireSmsMfa: enableSmsMfa } = mfaService.getAuthorizeMfaConfig(
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

const getAuthCodeBody = async (
  c: Context<typeConfig.Context>, code: string,
) => {
  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    code,
  )
  if (!authCodeStore) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }
  return authCodeStore
}

export interface GetProcessMfaEnrollRes {
  mfaTypes: userModel.MfaType[];
}
export const getProcessMfaEnroll = async (c: Context<typeConfig.Context>)
:Promise<TypedResponse<GetProcessMfaEnrollRes>> => {
  const queryDto = await identityDto.parseGetProcess(c)

  const authCodeStore = await getAuthCodeBody(
    c,
    queryDto.code,
  )

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

  const authCodeStore = await getAuthCodeBody(
    c,
    bodyDto.code,
  )

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

  const authCodeBody = await getAuthCodeBody(
    c,
    bodyDto.code,
  )

  const isPasswordlessCode = false
  await identityService.handleSendEmailMfa(
    c,
    bodyDto.code,
    authCodeBody,
    bodyDto.locale,
    isPasswordlessCode,
  )

  return c.json({ success: true })
}

export const postProcessEmailMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeMfaDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await getAuthCodeBody(
    c,
    bodyDto.code,
  )

  await identityService.processEmailMfa(
    c,
    bodyDto.code,
    authCodeStore,
    bodyDto.mfaCode,
  )

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

  const authCodeBody = await getAuthCodeBody(
    c,
    bodyDto.code,
  )

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

  const authCodeBody = await getAuthCodeBody(
    c,
    bodyDto.code,
  )

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

  const authCodeBody = await getAuthCodeBody(
    c,
    queryDto.code,
  )

  const { requireSmsMfa: enableSmsMfa } = mfaService.getAuthorizeMfaConfig(
    c,
    authCodeBody,
  )

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

  const allowFallbackToEmailMfa = identityService.allowSmsSwitchToEmailMfa(
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

  const authCodeStore = await getAuthCodeBody(
    c,
    bodyDto.code,
  )

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
  otpSecret: string;
}
export const getOtpMfaSetup = async (c: Context<typeConfig.Context>)
:Promise<TypedResponse<GetOtpMfaSetupRes>> => {
  const queryDto = await identityDto.parseGetProcess(c)

  const authCodeStore = await getAuthCodeBody(
    c,
    queryDto.code,
  )

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

  return c.json({
    otpUri,
    otpSecret,
  })
}

export interface GetProcessOtpMfaRes {
  allowFallbackToEmailMfa: boolean;
}
export const getProcessOtpMfa = async (c: Context<typeConfig.Context>)
:Promise<TypedResponse<GetProcessOtpMfaRes>> => {
  const queryDto = await identityDto.parseGetProcess(c)

  const authCodeBody = await getAuthCodeBody(
    c,
    queryDto.code,
  )

  const allowFallbackToEmailMfa = identityService.allowOtpSwitchToEmailMfa(
    c,
    authCodeBody,
  )

  return c.json({ allowFallbackToEmailMfa })
}

export const postProcessOtpMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeMfaDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await getAuthCodeBody(
    c,
    bodyDto.code,
  )

  await identityService.processOtpMfa(
    c,
    bodyDto.code,
    authCodeStore,
    bodyDto.mfaCode,
  )

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.OtpMfa,
    bodyDto.code,
    authCodeStore,
  ))
}
