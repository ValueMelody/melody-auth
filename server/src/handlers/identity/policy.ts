import {
  Context, TypedResponse,
} from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig,
  messageConfig,
  typeConfig,
} from 'configs'
import { identityDto } from 'dtos'
import {
  emailService,
  kvService, passkeyService, recoveryCodeService, userService,
} from 'services'
import {
  cryptoUtil, validateUtil, loggerUtil,
} from 'utils'
import {
  userModel, userPasskeyModel,
} from 'models'

const checkAccount = (
  c: Context<typeConfig.Context>, user: userModel.Record,
): string => {
  if (!user.email || user.socialAccountId) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.SocialAccountNotSupported,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.SocialAccountNotSupported)
  }

  return user.email
}

export const postChangePassword = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostChangePasswordDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authInfo) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }
  checkAccount(
    c,
    authInfo.user,
  )

  await userService.changeUserPassword(
    c,
    authInfo.user,
    bodyDto,
  )

  return c.json({ success: true })
}

export const postChangeEmailCode = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostChangeEmailCodeDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authInfo) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }
  const userEmail = checkAccount(
    c,
    authInfo.user,
  )

  const { CHANGE_EMAIL_EMAIL_THRESHOLD: emailThreshold } = env(c)

  if (emailThreshold) {
    const emailAttempts = await kvService.getChangeEmailAttempts(
      c.env.KV,
      userEmail,
    )

    if (emailAttempts >= emailThreshold) {
      loggerUtil.triggerLogger(
        c,
        loggerUtil.LoggerLevel.Warn,
        messageConfig.RequestError.ChangeEmailLocked,
      )
      throw new errorConfig.Forbidden(messageConfig.RequestError.ChangeEmailLocked)
    }

    await kvService.setChangeEmailAttempts(
      c.env.KV,
      userEmail,
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

export const postChangeEmail = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostChangeEmailDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authInfo) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }
  checkAccount(
    c,
    authInfo.user,
  )

  const isCorrectCode = await kvService.verifyChangeEmailCode(
    c.env.KV,
    authInfo.user.id,
    bodyDto.email,
    bodyDto.verificationCode,
  )

  if (!isCorrectCode) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongChangeEmailCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongCode)
  }

  await userService.changeUserEmail(
    c,
    authInfo.user,
    bodyDto,
  )

  return c.json({ success: true })
}

export const postResetMfa = async (c: Context<typeConfig.Context>) => {
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

  await userService.resetUserMfa(
    c,
    authCodeBody.user.authId,
  )

  return c.json({ success: true })
}

export interface GetManagePasskeyRes {
  passkey: userPasskeyModel.Record | null;
  enrollOptions: PublicKeyCredentialCreationOptionsJSON;
}
export const getManagePasskey = async (c: Context<typeConfig.Context>)
: Promise<TypedResponse<GetManagePasskeyRes>> => {
  const queryDto = await identityDto.parseGetProcess(c)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authInfo) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }
  checkAccount(
    c,
    authInfo.user,
  )

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

export const postManagePasskey = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostManagePasskeyDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authInfo) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }
  checkAccount(
    c,
    authInfo.user,
  )

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

export interface PostManageRecoveryCodeRes {
  recoveryCode: string;
}
export const postManageRecoveryCode = async (c: Context<typeConfig.Context>)
: Promise<TypedResponse<PostManageRecoveryCodeRes>> => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostProcessDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authInfo) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }
  checkAccount(
    c,
    authInfo.user,
  )

  const { recoveryCode } = await recoveryCodeService.regenerateRecoveryCode(
    c,
    authInfo,
  )

  return c.json({
    success: true, recoveryCode,
  })
}

export const deleteManagePasskey = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.DeleteManagePasskeyDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authInfo) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }
  checkAccount(
    c,
    authInfo.user,
  )

  const passkey = await passkeyService.getPasskeyByUser(
    c,
    authInfo.user.id,
  )

  if (!passkey) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.PasskeyNotFound,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.PasskeyNotFound)
  }

  await passkeyService.deletePasskey(
    c,
    authInfo.user.id,
    passkey.id,
  )

  return c.json({ success: true })
}

export const postUpdateInfo = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostUpdateInfoDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authInfo) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }
  checkAccount(
    c,
    authInfo.user,
  )

  await userService.updateUser(
    c,
    authInfo.user.authId,
    {
      firstName: bodyDto.firstName, lastName: bodyDto.lastName,
    },
  )

  return c.json({ success: true })
}
