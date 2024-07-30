import { Context } from 'hono'
import {
  ClientType, PostTokenByAuthCodeRes, PostTokenByRefreshTokenRes, PostTokenByClientCredentialsRes, Scope,
  genRandomString,
} from 'shared'
import { env } from 'hono/adapter'
import {
  errorConfig, localeConfig, routeConfig, typeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import {
  appService, consentService, jwtService, kvService, roleService, scopeService, sessionService, userService,
} from 'services'
import {
  cryptoUtil, formatUtil, timeUtil, validateUtil,
} from 'utils'

export const getAuthorize = async (c: Context<typeConfig.Context>) => {
  const queryDto = await scopeService.parseGetAuthorizeDto(c)

  const stored = sessionService.getAuthInfoSession(
    c,
    queryDto.clientId,
  )
  if (stored && stored.request.clientId === queryDto.clientId) {
    const authCode = genRandomString(128)
    const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)
    await kvService.storeAuthCode(
      c.env.KV,
      authCode,
      {
        appId: stored.appId,
        user: stored.user,
        request: queryDto,
      },
      codeExpiresIn,
    )

    const url = `${queryDto.redirectUri}?code=${authCode}&state=${queryDto.state}`
    return c.redirect(url)
  }

  const queryString = formatUtil.getQueryString(c)
  return c.redirect(`${routeConfig.InternalRoute.Identity}/authorize-password?${queryString}`)
}

export const postTokenAuthCode = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.parseBody()

  const bodyDto = new oauthDto.PostTokenAuthCodeReqDto({
    grantType: String(reqBody.grant_type),
    code: String(reqBody.code),
    codeVerifier: String(reqBody.code_verifier),
  })
  await validateUtil.dto(bodyDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )

  const isValidChallenge = await cryptoUtil.isValidCodeChallenge(
    bodyDto.codeVerifier,
    authInfo.request.codeChallenge,
    authInfo.request.codeChallengeMethod,
  )
  if (!isValidChallenge) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongCodeVerifier)
  }

  const requireConsent = await consentService.shouldCollectConsent(
    c,
    authInfo.user.id,
    authInfo.appId,
  )
  if (requireConsent) throw new errorConfig.UnAuthorized(localeConfig.Error.NoConsent)

  const userRoles = await roleService.getUserRoles(
    c,
    authInfo.user.id,
  )
  const authId = authInfo.user.authId
  const scope = authInfo.request.scopes.join(' ')
  const currentTimestamp = timeUtil.getCurrentTimestamp()

  const {
    accessToken,
    accessTokenExpiresIn,
    accessTokenExpiresAt,
  } = await jwtService.genAccessToken(
    c,
    ClientType.SPA,
    currentTimestamp,
    authId,
    authInfo.request.clientId,
    scope,
    userRoles,
  )

  const result: PostTokenByAuthCodeRes = {
    access_token: accessToken,
    expires_in: accessTokenExpiresIn,
    expires_on: accessTokenExpiresAt,
    not_before: currentTimestamp,
    token_type: 'Bearer',
    scope: authInfo.request.scopes.join(' '),
  }

  if (authInfo.request.scopes.includes(Scope.OfflineAccess)) {
    const { SPA_REFRESH_TOKEN_EXPIRES_IN: refreshTokenExpiresIn } = env(c)
    const refreshToken = genRandomString(128)
    const refreshTokenExpiresAt = currentTimestamp + refreshTokenExpiresIn

    result.refresh_token = refreshToken
    result.refresh_token_expires_in = refreshTokenExpiresIn
    result.refresh_token_expires_on = refreshTokenExpiresAt

    await kvService.storeRefreshToken(
      c.env.KV,
      refreshToken,
      {
        authId, clientId: authInfo.request.clientId, scope, roles: userRoles,
      },
      refreshTokenExpiresIn,
    )
  }

  if (authInfo.request.scopes.includes(Scope.OpenId)) {
    const { idToken } = await jwtService.genIdToken(
      c,
      currentTimestamp,
      authInfo,
      userRoles,
    )
    result.id_token = idToken
  }

  return c.json(result)
}

export const postTokenRefreshToken = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.parseBody()

  const bodyDto = new oauthDto.PostTokenRefreshTokenReqDto({
    grantType: String(reqBody.grant_type),
    refreshToken: String(reqBody.refresh_token),
  })
  await validateUtil.dto(bodyDto)

  const refreshTokenBody = await kvService.getRefreshTokenBody(
    c.env.KV,
    bodyDto.refreshToken,
  )

  const {
    accessToken,
    accessTokenExpiresIn,
    accessTokenExpiresAt,
  } = await jwtService.genAccessToken(
    c,
    ClientType.SPA,
    timeUtil.getCurrentTimestamp(),
    refreshTokenBody.authId,
    refreshTokenBody.clientId,
    refreshTokenBody.scope,
    refreshTokenBody.roles,
  )

  const result: PostTokenByRefreshTokenRes = {
    access_token: accessToken,
    expires_in: accessTokenExpiresIn,
    expires_on: accessTokenExpiresAt,
    token_type: 'Bearer',
  }

  return c.json(result)
}

export const postTokenClientCredentials = async (c: Context<typeConfig.Context>) => {
  const basicAuth = c.get('basic_auth_body')!
  const reqBody = await c.req.parseBody()

  const bodyDto = new oauthDto.PostTokenClientCredentialsReqDto({
    grantType: String(reqBody.grant_type),
    scopes: reqBody.scope ? String(reqBody.scope).split(' ') : [],
  })
  await validateUtil.dto(bodyDto)

  const app = await appService.verifyS2SClientRequest(
    c,
    basicAuth.username,
    basicAuth.password,
  )

  const validScopes = await scopeService.verifyAppScopes(
    c,
    app.id,
    bodyDto.scopes,
  )

  const {
    accessToken,
    accessTokenExpiresIn,
    accessTokenExpiresAt,
  } = await jwtService.genAccessToken(
    c,
    ClientType.S2S,
    timeUtil.getCurrentTimestamp(),
    basicAuth.username,
    basicAuth.username,
    validScopes.join(' '),
  )

  const result: PostTokenByClientCredentialsRes = {
    access_token: accessToken,
    expires_in: accessTokenExpiresIn,
    expires_on: accessTokenExpiresAt,
    token_type: 'Bearer',
    scope: validScopes.join(' '),
  }

  return c.json(result)
}

export const getLogout = async (c: Context<typeConfig.Context>) => {
  const queryDto = new oauthDto.GetLogoutReqDto({
    clientId: c.req.query('client_id') ?? '',
    postLogoutRedirectUri: c.req.query('post_logout_redirect_uri') ?? '',
  })

  await validateUtil.dto(queryDto)

  sessionService.removeAuthInfoSession(
    c,
    queryDto.clientId,
  )

  return c.redirect(queryDto.postLogoutRedirectUri)
}

export const getUserInfo = async (c: Context<typeConfig.Context>) => {
  const accessTokenBody = c.get('access_token_body')!

  const user = await userService.getUserInfo(
    c,
    accessTokenBody.sub,
  )

  return c.json(user)
}
