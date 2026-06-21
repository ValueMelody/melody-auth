import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  typeConfig,
  errorConfig,
  messageConfig,
} from 'configs'
import { identityDto } from 'dtos'
import {
  identityService, kvService, mfaService, userService,
} from 'services'
import {
  validateUtil, loggerUtil, requestUtil,
} from 'utils'

export const postAuthorizePasswordless = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeWithPasswordlessDto({
    ...reqBody,
    scopes: reqBody.scope ? reqBody.scope.split(' ') : [],
  })
  await validateUtil.dto(bodyDto)

  const user = await userService.getPasswordlessUserOrCreate(
    c,
    bodyDto,
  )

  const {
    authCode, authCodeBody,
  } = await identityService.processSignIn(
    c,
    bodyDto,
    user,
  )

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.Passwordless,
    authCode,
    authCodeBody,
  ))
}

export const postSendPasswordlessCode = async (c: Context<typeConfig.Context>) => {
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

  const isPasswordlessCode = true
  await mfaService.handleSendEmailMfa(
    c,
    bodyDto.code,
    authCodeBody,
    bodyDto.locale,
    isPasswordlessCode,
  )

  return c.json({ success: true })
}

export const postProcessPasswordlessCode = async (c: Context<typeConfig.Context>) => {
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

  const {
    AUTHORIZATION_CODE_EXPIRES_IN: expiresIn,
    MFA_CODE_VERIFY_THRESHOLD: threshold,
  } = env(c)

  let ip: string | undefined
  let failedAttempts = 0
  if (threshold) {
    ip = requestUtil.getRequestIP(c)
    failedAttempts = await kvService.getFailedMfaCodeAttemptsByIP(
      c.env.KV,
      authCodeStore.user.id,
      ip,
    )
    if (failedAttempts >= threshold) {
      loggerUtil.triggerLogger(
        c,
        loggerUtil.LoggerLevel.Warn,
        messageConfig.RequestError.PasswordlessLocked,
      )
      throw new errorConfig.Forbidden(messageConfig.RequestError.PasswordlessLocked)
    }
  }

  const isValid = await kvService.stampPasswordlessCode(
    c.env.KV,
    bodyDto.code,
    bodyDto.mfaCode,
    expiresIn,
  )

  if (!isValid) {
    if (threshold) {
      await kvService.setFailedMfaCodeAttempts(
        c.env.KV,
        authCodeStore.user.id,
        ip,
        failedAttempts + 1,
      )
    }
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongPasswordlessCode,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.WrongCode)
  }

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.PasswordlessVerify,
    bodyDto.code,
    authCodeStore,
  ))
}
