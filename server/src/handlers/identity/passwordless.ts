import { Context } from 'hono'
import { env } from 'hono/adapter'
import { handleSendEmailMfa } from './mfa'
import {
  typeConfig,
  errorConfig,
  messageConfig,
} from 'configs'
import { identityDto } from 'dtos'
import {
  identityService, kvService, userService,
} from 'services'
import {
  validateUtil, loggerUtil,
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

  const { SUPPORTED_LOCALES: locales } = env(c)

  const bodyDto = new identityDto.PostProcessDto(reqBody)
  await validateUtil.dto(bodyDto)

  const isPasswordlessCode = true
  const emailRes = await handleSendEmailMfa(
    c,
    bodyDto.code,
    bodyDto.locale || locales[0],
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

  const { AUTHORIZATION_CODE_EXPIRES_IN: expiresIn } = env(c)

  const isValid = await kvService.stampPasswordlessCode(
    c.env.KV,
    bodyDto.code,
    bodyDto.mfaCode,
    expiresIn,
  )

  if (!isValid) {
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
