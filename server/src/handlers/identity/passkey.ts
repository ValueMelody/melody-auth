import {
  Context, TypedResponse,
} from 'hono'
import { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import {
  baseDto,
  identityDto, oauthDto,
} from 'dtos'
import {
  appService,
  identityService,
  kvService,
  passkeyService,
  sessionService,
  userService,
} from 'services'
import {
  cryptoUtil,
  validateUtil,
  loggerUtil,
} from 'utils'
import { oauthHandler } from 'handlers'

export interface GetProcessPasskeyEnrollRes {
  enrollOptions: PublicKeyCredentialCreationOptionsJSON;
}
export const getProcessPasskeyEnroll = async (c: Context<typeConfig.Context>)
: Promise<TypedResponse<GetProcessPasskeyEnrollRes>> => {
  const queryDto = await identityDto.parseGetProcess(c)
  await validateUtil.dto(queryDto)

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

  const enrollOptions = await passkeyService.genPasskeyEnrollOptions(
    c,
    authCodeStore,
  )

  return c.json({ enrollOptions })
}

export const postProcessPasskeyEnroll = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostProcessPasskeyEnrollDto(reqBody)
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
    passkeyId, passkeyPublickey, passkeyCounter,
  } = await passkeyService.processPasskeyEnroll(
    c,
    authCodeStore,
    bodyDto.enrollInfo,
  )

  await passkeyService.createUserPasskey(
    c,
    authCodeStore.user.id,
    passkeyId,
    cryptoUtil.uint8ArrayToBase64(passkeyPublickey),
    passkeyCounter,
  )

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.PasskeyEnroll,
    bodyDto.code,
    authCodeStore,
  ))
}

export const postProcessPasskeyEnrollDecline = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostProcessPasskeyEnrollDeclineDto(reqBody)
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

  if (bodyDto.remember) {
    await userService.skipUserPasskeyEnroll(
      c,
      authCodeStore.user,
    )
  }

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.PasskeyEnroll,
    bodyDto.code,
    authCodeStore,
  ))
}

export interface GetAuthorizePasskeyVerifyRes {
  passkeyOption: PublicKeyCredentialRequestOptionsJSON | null;
}
export const getAuthorizePasskeyVerify = async (c: Context<typeConfig.Context>)
: Promise<TypedResponse<GetAuthorizePasskeyVerifyRes>> => {
  const dto = new baseDto.PasskeyVerifyDto({ email: c.req.query('email') ?? '' })
  await validateUtil.dto(dto)

  const options = await passkeyService.genPasskeyVerifyOptions(
    c,
    dto.email,
  )

  if (!options) return c.json({ passkeyOption: null })

  await kvService.setPasskeyVerifyChallenge(
    c.env.KV,
    dto.email,
    options.challenge,
  )

  return c.json({ passkeyOption: options })
}

export const postAuthorizePasskeyVerify = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizePasskeyVerifyDto({
    ...reqBody,
    scopes: reqBody.scope.split(' '),
  })
  await validateUtil.dto(bodyDto)

  const app = await appService.verifySPAClientRequest(
    c,
    bodyDto.clientId,
    bodyDto.redirectUri,
  )

  const {
    user, newCounter, passkeyId,
  } = await passkeyService.processPasskeyVerify(
    c,
    bodyDto.email,
    bodyDto.passkeyInfo,
  )

  await passkeyService.updatePasskeyCounter(
    c,
    passkeyId,
    newCounter,
  )

  const request = new oauthDto.GetAuthorizeDto(bodyDto)

  const authCodeBody = {
    appId: app.id,
    appName: app.name,
    user,
    request,
    isFullyAuthorized: true,
  }

  const authCode = await oauthHandler.createFullAuthorize(
    c,
    authCodeBody,
  )

  sessionService.setAuthInfoSession(
    c,
    authCodeBody,
  )

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.PasskeyVerify,
    authCode,
    authCodeBody,
  ))
}
