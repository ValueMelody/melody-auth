import { Context } from 'hono'
import { env } from 'hono/adapter'
import { genRandomString } from '@melody-auth/shared'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import {
  appService, identityService, kvService, mfaService, oauthService, scopeService,
  userService,
} from 'services'
import {
  embeddedDto, oauthDto,
} from 'dtos'
import {
  loggerUtil, validateUtil,
} from 'utils'
import {
  authCodeHook, signInHook,
} from 'hooks'

const sessionBodyToAuthCodeBody = (sessionBody: typeConfig.EmbeddedSessionBody): typeConfig.AuthCodeBody => {
  if (!sessionBody.user) {
    throw new errorConfig.NotFound(messageConfig.RequestError.WrongSessionId)
  }

  return {
    ...sessionBody,
    user: sessionBody.user,
    request: {
      ...sessionBody.request,
      state: '',
      responseType: 'code',
    },
  }
}

export const initiate = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const queryDto = new oauthDto.CoreAuthorizeDto(reqBody)
  await validateUtil.dto(queryDto)

  const app = await appService.verifySPAClientRequest(
    c,
    queryDto.clientId,
    queryDto.redirectUri,
  )

  const validScopes = await scopeService.verifyAppScopes(
    c,
    app.id,
    queryDto.scopes,
  )

  const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)
  const mfaConfig = mfaService.getAppMfaConfig(app)

  const sessionId = genRandomString(128)
  const embeddedSessionBody: typeConfig.EmbeddedSessionBody = {
    appId: app.id,
    appName: app.name,
    request: {
      ...queryDto,
      scopes: validScopes,
    },
    mfa: mfaConfig ? mfaService.getAuthCodeBodyMfaConfig(mfaConfig) : undefined,
  }
  await kvService.storeEmbeddedSession(
    c.env.KV,
    sessionId,
    embeddedSessionBody,
    codeExpiresIn,
  )

  return c.json({ sessionId })
}

export const signIn = async (c: Context<typeConfig.Context>) => {
  await signInHook.preSignIn()

  const reqBody = await c.req.json()

  const bodyDto = new embeddedDto.SignInDto(reqBody)
  await validateUtil.dto(bodyDto)

  const sessionBody = await kvService.getEmbeddedSessionBody(
    c.env.KV,
    bodyDto.sessionId,
  )
  if (!sessionBody) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongSessionId,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.WrongSessionId)
  }

  const user = await userService.verifyPasswordSignIn(
    c,
    bodyDto,
  )

  const sessionBodyWithUser = {
    ...sessionBody,
    user,
  }

  const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)
  await kvService.storeEmbeddedSession(
    c.env.KV,
    bodyDto.sessionId,
    sessionBodyWithUser,
    codeExpiresIn,
  )

  const result = await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.Password,
    bodyDto.sessionId,
    sessionBodyToAuthCodeBody(sessionBodyWithUser),
  )

  await signInHook.postSignIn()

  return c.json({
    sessionId: bodyDto.sessionId,
    nextStep: result.nextPage,
    success: !result.nextPage,
  })
}

export const tokenExchange = async (c: Context<typeConfig.Context>) => {
  await authCodeHook.preTokenExchangeWithAuthCode()

  const reqBody = await c.req.json()

  const bodyDto = new embeddedDto.TokenExchangeDto(reqBody)
  await validateUtil.dto(bodyDto)

  const sessionBody = await kvService.getEmbeddedSessionBody(
    c.env.KV,
    bodyDto.sessionId,
  )

  if (!sessionBody) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongSessionId,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongSessionId)
  }

  const result = await oauthService.handleAuthCodeTokenExchange(
    c,
    sessionBodyToAuthCodeBody(sessionBody),
    {
      ...bodyDto,
      code: bodyDto.sessionId,
      grantType: oauthDto.TokenGrantType.AuthorizationCode,
    },
  )

  await authCodeHook.postTokenExchangeWithAuthCode()

  return c.json(result)
}

export const tokenRefresh = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new embeddedDto.TokenRefreshDto(reqBody)
  await validateUtil.dto(bodyDto)

  const result = await oauthService.handleRefreshTokenTokenExchange(
    c,
    {
      ...bodyDto,
      grantType: oauthDto.TokenGrantType.RefreshToken,
    },
  )

  return c.json(result)
}
