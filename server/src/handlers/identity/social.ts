import { Context } from 'hono'
import { env } from 'hono/adapter'
import { genRandomString } from 'shared'
import {
  errorConfig, messageConfig, routeConfig, typeConfig,
} from 'configs'
import {
  identityDto, oauthDto,
} from 'dtos'
import {
  appService, jwtService, kvService, userService, identityService,
} from 'services'
import {
  validateUtil, loggerUtil,
} from 'utils'
import {
  appModel, userModel,
} from 'models'

const prepareSocialAuthCode = async (
  c: Context<typeConfig.Context>,
  bodyDto: identityDto.PostAuthorizeSocialSignInDto,
  app: appModel.Record,
  user: userModel.Record,
) => {
  const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)

  const authCode = genRandomString(128)
  const request = new oauthDto.GetAuthorizeDto(bodyDto)
  const authCodeBody = {
    appId: app.id,
    appName: app.name,
    user,
    request,
  }
  await kvService.storeAuthCode(
    c.env.KV,
    authCode,
    authCodeBody,
    codeExpiresIn,
  )
  return {
    authCode, authCodeBody, codeExpiresIn,
  }
}

export const postAuthorizeGoogle = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeSocialSignInDto({
    ...reqBody,
    scopes: reqBody.scope ? reqBody.scope.split(' ') : [],
  })
  await validateUtil.dto(bodyDto)

  const app = await appService.verifySPAClientRequest(
    c,
    bodyDto.clientId,
    bodyDto.redirectUri,
  )

  const googleUser = await jwtService.verifyGoogleCredential(bodyDto.credential)
  if (!googleUser) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoGoogleUser,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoUser)
  }

  const user = await userService.processGoogleAccount(
    c,
    googleUser,
    bodyDto.locale,
    bodyDto.org,
  )

  const {
    authCode, authCodeBody,
  } = await prepareSocialAuthCode(
    c,
    bodyDto,
    app,
    user,
  )

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.Social,
    authCode,
    authCodeBody,
  ))
}

export const postAuthorizeFacebook = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeSocialSignInDto({
    ...reqBody,
    scopes: reqBody.scope ? reqBody.scope.split(' ') : [],
  })
  await validateUtil.dto(bodyDto)

  const app = await appService.verifySPAClientRequest(
    c,
    bodyDto.clientId,
    bodyDto.redirectUri,
  )

  const {
    FACEBOOK_AUTH_CLIENT_ID: facebookClientId, FACEBOOK_AUTH_CLIENT_SECRET: facebookClientSecret,
  } = env(c)

  const facebookUser = await jwtService.verifyFacebookCredential(
    facebookClientId,
    facebookClientSecret,
    bodyDto.credential,
  )
  if (!facebookUser) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoFacebookUser,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoUser)
  }

  const user = await userService.processFacebookAccount(
    c,
    facebookUser,
    bodyDto.locale,
    bodyDto.org,
  )

  const {
    authCode, authCodeBody,
  } = await prepareSocialAuthCode(
    c,
    bodyDto,
    app,
    user,
  )

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.Social,
    authCode,
    authCodeBody,
  ))
}

export const getAuthorizeGithub = async (c: Context<typeConfig.Context>) => {
  const code = c.req.query('code')
  const state = c.req.query('state') ?? ''

  if (!code || !state) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.InvalidGithubAuthorizeRequest,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.InvalidGithubAuthorizeRequest)
  }

  const originRequest = JSON.parse(state)

  const bodyDto = new identityDto.PostAuthorizeSocialSignInDto({
    ...originRequest,
    credential: code,
  })
  await validateUtil.dto(bodyDto)

  const app = await appService.verifySPAClientRequest(
    c,
    bodyDto.clientId,
    bodyDto.redirectUri,
  )

  const {
    GITHUB_AUTH_CLIENT_ID: githubClientId,
    GITHUB_AUTH_CLIENT_SECRET: githubClientSecret,
    GITHUB_AUTH_APP_NAME: githubAppName,
  } = env(c)

  const githubUser = await jwtService.verifyGithubCredential(
    githubClientId,
    githubClientSecret,
    githubAppName,
    bodyDto.credential,
  )
  if (!githubUser) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoGithubUser,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoUser)
  }

  const user = await userService.processGithubAccount(
    c,
    githubUser,
    bodyDto.locale,
    bodyDto.org,
  )

  const {
    authCode, authCodeBody,
  } = await prepareSocialAuthCode(
    c,
    bodyDto,
    app,
    user,
  )

  const detail = await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.Social,
    authCode,
    authCodeBody,
  )

  const qs = `?state=${detail.state}&code=${detail.code}&locale=${bodyDto.locale}`
  const url = detail.nextPage === routeConfig.View.Consent
    ? `${routeConfig.IdentityRoute.ProcessView}${qs}&redirect_uri=${detail.redirectUri}&step=consent`
    : `${detail.redirectUri}${qs}`
  return c.redirect(url)
}

export const getAuthorizeDiscord = async (c: Context<typeConfig.Context>) => {
  const code = c.req.query('code')
  const state = c.req.query('state') ?? ''

  if (!code || !state) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.InvalidDiscordAuthorizeRequest,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.InvalidDiscordAuthorizeRequest)
  }

  const originRequest = JSON.parse(state)

  const bodyDto = new identityDto.PostAuthorizeSocialSignInDto({
    ...originRequest,
    credential: code,
  })
  await validateUtil.dto(bodyDto)

  const app = await appService.verifySPAClientRequest(
    c,
    bodyDto.clientId,
    bodyDto.redirectUri,
  )

  const {
    DISCORD_AUTH_CLIENT_ID: discordClientId,
    DISCORD_AUTH_CLIENT_SECRET: discordClientSecret,
    AUTH_SERVER_URL: serverUrl,
  } = env(c)

  const discordRedirectUri = `${serverUrl}${routeConfig.IdentityRoute.AuthorizeDiscord}`

  const discordUser = await jwtService.verifyDiscordCredential(
    discordClientId,
    discordClientSecret,
    discordRedirectUri,
    bodyDto.credential,
  )

  if (!discordUser) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoDiscordUser,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoUser)
  }

  const user = await userService.processDiscordAccount(
    c,
    discordUser,
    bodyDto.locale,
    bodyDto.org,
  )

  const {
    authCode, authCodeBody,
  } = await prepareSocialAuthCode(
    c,
    bodyDto,
    app,
    user,
  )

  const detail = await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.Social,
    authCode,
    authCodeBody,
  )

  const qs = `?state=${detail.state}&code=${detail.code}&locale=${bodyDto.locale}`
  const url = detail.nextPage === routeConfig.View.Consent
    ? `${routeConfig.IdentityRoute.ProcessView}${qs}&redirect_uri=${detail.redirectUri}&step=consent`
    : `${detail.redirectUri}${qs}`
  return c.redirect(url)
}
