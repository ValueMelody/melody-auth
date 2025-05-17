import {
  Context, TypedResponse,
} from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import { identityDto } from 'dtos'
import {
  identityService, mfaService,
  kvService, userService,
} from 'services'
import {
  validateUtil, loggerUtil,
} from 'utils'
import { userModel } from 'models'

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
  await mfaService.handleSendEmailMfa(
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

  await mfaService.processEmailMfa(
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

  await mfaService.handleSmsMfaSetup(
    c,
    bodyDto.code,
    authCodeBody,
    bodyDto.phoneNumber,
    bodyDto.locale,
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

  await mfaService.handleSendSmsMfaCode(
    c,
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

  const info = await mfaService.getSmsMfaInfo(
    c,
    queryDto.code,
    authCodeBody,
    queryDto.locale,
  )

  return c.json(info)
}

export const postProcessSmsMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeMfaDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await getAuthCodeBody(
    c,
    bodyDto.code,
  )

  await mfaService.processSmsMfa(
    c,
    bodyDto.code,
    authCodeStore,
    bodyDto.mfaCode,
  )

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

  const {
    user, otpUri, otpSecret,
  } = await mfaService.handleGetOtpMfaSetup(
    c,
    authCodeStore,
  )

  if (user) {
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
  }

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

  const allowFallbackToEmailMfa = mfaService.allowOtpSwitchToEmailMfa(
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

  await mfaService.processOtpMfa(
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
