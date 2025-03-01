import {
  Context, TypedResponse,
} from 'hono'
import { env } from 'hono/adapter'
import { PublicKeyCredentialRequestOptionsJSON } from '@simplewebauthn/server'
import {
  errorConfig, localeConfig, routeConfig, typeConfig,
} from 'configs'
import {
  identityDto, oauthDto,
} from 'dtos'
import {
  appService,
  brandingService, identityService,
  kvService, passkeyService,
  userService,
} from 'services'
import {
  cryptoUtil,
  validateUtil,
} from 'utils'
import { AuthorizePasskeyEnrollView } from 'views'
import { oauthHandler } from 'handlers'

export interface AuthorizePasskeyEnrollInfo {
  enrollOptions: passkeyService.EnrollOptions;
}

export const getAuthorizePasskeyEnrollInfo = async (c: Context<typeConfig.Context>)
: Promise<TypedResponse<AuthorizePasskeyEnrollInfo>> => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)
  await validateUtil.dto(queryDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authCodeStore) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

  const enrollOptions = await passkeyService.genPasskeyEnrollOptions(
    c,
    authCodeStore,
  )

  return c.json({ enrollOptions })
}

export const getAuthorizePasskeyEnroll = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)
  await validateUtil.dto(queryDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authCodeStore) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)

  const enrollOptions = await passkeyService.genPasskeyEnrollOptions(
    c,
    authCodeStore,
  )

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  return c.html(<AuthorizePasskeyEnrollView
    branding={await brandingService.getBranding(
      c,
      queryDto.org,
    )}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    queryDto={queryDto}
    enrollOptions={enrollOptions}
  />)
}

export const postAuthorizePasskeyEnroll = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizePasskeyEnrollReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeStore) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

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

export const postAuthorizePasskeyEnrollDecline = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizePasskeyEnrollDeclineReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeStore) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

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

export interface AuthorizePasskeyVerify {
  passkeyOption: PublicKeyCredentialRequestOptionsJSON | null;
}

export const getAuthorizePasskeyVerify = async (c: Context<typeConfig.Context>) => {
  const dto = new identityDto.GetAuthorizePasskeyVerifyReqDto({ email: c.req.query('email') ?? '' })
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

  const bodyDto = new identityDto.PostAuthorizePasskeyVerifyReqDto({
    ...reqBody,
    scopes: reqBody.scope.split(' '),
  })
  await validateUtil.dto(bodyDto)

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

  const app = await appService.verifySPAClientRequest(
    c,
    bodyDto.clientId,
    bodyDto.redirectUri,
  )

  const request = new oauthDto.GetAuthorizeReqDto(bodyDto)

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

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.PasskeyVerify,
    authCode,
    authCodeBody,
  ))
}
