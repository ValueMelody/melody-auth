import { Context } from 'hono'
import { env } from 'hono/adapter'
import { genRandomString } from '@melody-auth/shared'
import {
  errorConfig, messageConfig,
  routeConfig,
} from 'configs'
import {
  identityService, kvService, userService,
} from 'services'
import * as samlService from 'saml/service'
import {
  oauthHandler, embeddedHandler,
} from 'handlers'
import { oauthDto } from 'dtos'

export const getSamlSpLogin = async (c: Context) => {
  const policy = c.req.query('policy')
  const {
    queryDto, app,
  } = await oauthHandler.parseGetAuthorizeDto(c)

  if (!policy?.startsWith(oauthDto.Policy.SamSso)) {
    throw new errorConfig.Forbidden(messageConfig.RequestError.InvalidPolicy)
  }

  const name = policy.replace(
    oauthDto.Policy.SamSso,
    '',
  )

  const sp = await samlService.createSp(c)

  const { provider: idp } = await samlService.loadIdp(
    c,
    name,
  )

  const { context } = await sp.createLoginRequest(
    idp,
    'redirect',
  )

  const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)

  const authCode = genRandomString(128)
  const authCodeBody = {
    appId: app.id,
    appName: app.name,
    request: queryDto,
  }
  await kvService.storeEmbeddedSession(
    c.env.KV,
    authCode,
    authCodeBody,
    codeExpiresIn,
  )

  const url = new URL(context)
  url.searchParams.set(
    'RelayState',
    authCode,
  )

  return c.redirect(
    url.toString(),
    302,
  )
}

export const getSamlSpMetadata = async (c: Context) => {
  const sp = await samlService.createSp(c)
  return c.text(
    sp.getMetadata(),
    200,
    { 'Content-Type': 'application/xml' },
  )
}

export const postSamlSpAcs = async (c: Context) => {
  const sp = await samlService.createSp(c)
  const body = await c.req.parseBody()
  const sessionId = body.RelayState as string

  const session = await kvService.getEmbeddedSessionBody(
    c.env.KV,
    sessionId,
  )
  if (!session) {
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongSessionId)
  }

  const name = (session.request as oauthDto.GetAuthorizeDto).policy?.replace(
    oauthDto.Policy.SamSso,
    '',
  ) ?? ''

  const {
    provider: idp, record,
  } = await samlService.loadIdp(
    c,
    name,
  )

  try {
    const { extract } = await sp.parseLoginResponse(
      idp,
      'post',
      { body },
    )

    const userId = extract.attributes[record.userIdAttribute]
    const email = record.emailAttribute ? extract.attributes[record.emailAttribute] : null
    const firstName = record.firstNameAttribute ? extract.attributes[record.firstNameAttribute] : null
    const lastName = record.lastNameAttribute ? extract.attributes[record.lastNameAttribute] : null

    const samlUser: userService.SamlUser = {
      userId,
      email: email ?? null,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
    }

    const user = await userService.processSamlAccount(
      c,
      samlUser,
      name,
      'en',
    )

    const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)
    const authCodeBody = embeddedHandler.sessionBodyToAuthCodeBody({
      ...session,
      user,
    })
    await kvService.storeAuthCode(
      c.env.KV,
      sessionId,
      authCodeBody,
      codeExpiresIn,
    )

    const detail = await identityService.processPostAuthorize(
      c,
      identityService.AuthorizeStep.Social,
      sessionId,
      authCodeBody,
    )

    const qs = `?state=${detail.state}&code=${detail.code}&locale=${session.request.locale}`
    const url = detail.nextPage === routeConfig.View.Consent
      ? `${routeConfig.IdentityRoute.ProcessView}${qs}&redirect_uri=${detail.redirectUri}&step=consent`
      : `${detail.redirectUri}${qs}`
    return c.redirect(url)
  } catch (error) {
    console.error(error)
    throw new errorConfig.Forbidden(messageConfig.RequestError.InvalidSamlResponse)
  }
}
