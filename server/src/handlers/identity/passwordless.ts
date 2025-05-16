import { Context } from 'hono'
import { env } from 'hono/adapter'
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
  await identityService.handleSendEmailMfa(
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
