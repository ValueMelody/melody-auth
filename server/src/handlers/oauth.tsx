import { Context } from 'hono'
import {
  ClientType, PostTokenByClientCredentialsRes,
  genRandomString,
} from '@melody-auth/shared'
import { env } from 'hono/adapter'
import {
  errorConfig, messageConfig, routeConfig, typeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import {
  appService, jwtService, kvService, oauthService, scopeService, sessionService, userService,
} from 'services'
import {
  loggerUtil, requestUtil, timeUtil, validateUtil,
} from 'utils'
import { PopupRedirect } from 'templates'
import {
  authCodeHook, clientCredentialsHook,
} from 'hooks'
import { appModel } from 'models'
import { prepareOidcRedirect } from 'services/identity'

export const parseGetAuthorizeDto = async (c: Context<typeConfig.Context>): Promise<{
  queryDto: oauthDto.GetAuthorizeDto;
  app: appModel.Record;
}> => {
  const queryDto = new oauthDto.GetAuthorizeDto({
    clientId: c.req.query('client_id') ?? '',
    redirectUri: c.req.query('redirect_uri') ?? '',
    responseType: c.req.query('response_type') ?? '',
    state: c.req.query('state') ?? '',
    codeChallenge: c.req.query('code_challenge') ?? '',
    codeChallengeMethod: c.req.query('code_challenge_method') ?? '',
    scopes: c.req.query('scope')?.split(' ') ?? [],
    authorizeMethod: c.req.query('authorize_method') ?? '',
    locale: requestUtil.getLocaleFromQuery(
      c,
      c.req.query('locale'),
    ),
    policy: c.req.query('policy') ?? undefined,
    org: c.req.query('org') ?? c.get('detectedOrgSlug') ?? undefined,
  })
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

  return {
    queryDto: {
      ...queryDto,
      scopes: validScopes,
    },
    app,
  }
}

export const createFullAuthorize = async (
  c: Context<typeConfig.Context>, authInfo: typeConfig.AuthCodeBody,
) => {
  const authCode = genRandomString(128)
  const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)
  await kvService.storeAuthCode(
    c.env.KV,
    authCode,
    {
      appId: authInfo.appId,
      appName: authInfo.appName,
      user: authInfo.user,
      request: authInfo.request,
      isFullyAuthorized: true,
    },
    codeExpiresIn,
  )

  return authCode
}

export const getAuthorize = async (c: Context<typeConfig.Context>) => {
  const { queryDto } = await parseGetAuthorizeDto(c)
  const stored = sessionService.getAuthInfoSession(
    c,
    queryDto.clientId,
  )

  if (stored && stored.request.clientId === queryDto.clientId) {
    const authCode = await createFullAuthorize(
      c,
      {
        appId: stored.appId,
        appName: stored.appName,
        user: stored.user,
        request: queryDto,
      },
    )

    if (
      !queryDto.policy ||
      queryDto.policy === oauthDto.Policy.SignInOrSignUp ||
      queryDto.policy.startsWith(oauthDto.Policy.SamSso) ||
      queryDto.policy.startsWith(oauthDto.Policy.Oidc)
    ) {
      if (queryDto.authorizeMethod === 'popup') {
        return c.html(<PopupRedirect
          code={authCode}
          queryDto={queryDto}
        />)
      } else {
        const url = `${queryDto.redirectUri}?code=${authCode}&state=${queryDto.state}`
        return c.redirect(url)
      }
    } else {
      const queryString = `step=${queryDto.policy}&state=${queryDto.state}&code=${authCode}&locale=${queryDto.locale}&redirect_uri=${queryDto.redirectUri}&org=${queryDto.org}`
      return c.redirect(`${routeConfig.IdentityRoute.ProcessView}?${queryString}`)
    }
  }

  const queryString = requestUtil.getQueryString(c)

  const {
    ENABLE_SAML_SSO_AS_SP: enableSamlSso,
    OIDC_AUTH_PROVIDERS: oidcAuthProviders,
  } = env(c)

  if (enableSamlSso && queryDto.policy?.startsWith(oauthDto.Policy.SamSso)) {
    return c.redirect(`${routeConfig.InternalRoute.SamlSp}/login?${queryString}`)
  }

  if (oidcAuthProviders?.length && queryDto.policy?.startsWith(oauthDto.Policy.Oidc)) {
    const url = await prepareOidcRedirect(
      c,
      queryDto.policy,
      queryDto,
    )

    return c.redirect(url)
  }

  return c.redirect(`${routeConfig.IdentityRoute.AuthorizeView}?${queryString}`)
}

export const postTokenAuthCode = async (c: Context<typeConfig.Context>) => {
  await authCodeHook.preTokenExchangeWithAuthCode()

  const reqBody = await c.req.parseBody()

  const bodyDto = new oauthDto.PostTokenAuthCodeDto({
    grantType: String(reqBody.grant_type),
    code: String(reqBody.code),
    codeVerifier: String(reqBody.code_verifier),
  })
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

  const result = await oauthService.handleAuthCodeTokenExchange(
    c,
    authInfo,
    bodyDto,
  )

  await authCodeHook.postTokenExchangeWithAuthCode()

  return c.json(result)
}

export const postTokenRefreshToken = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.parseBody()

  const bodyDto = new oauthDto.PostTokenRefreshTokenDto({
    grantType: String(reqBody.grant_type),
    refreshToken: String(reqBody.refresh_token),
  })
  await validateUtil.dto(bodyDto)

  const result = await oauthService.handleRefreshTokenTokenExchange(
    c,
    bodyDto,
  )

  return c.json(result)
}

export const postTokenClientCredentials = async (c: Context<typeConfig.Context>) => {
  await clientCredentialsHook.preTokenClientCredentials()

  const basicAuth = c.get('basic_auth_body')!
  const reqBody = await c.req.parseBody()

  const bodyDto = new oauthDto.PostTokenClientCredentialsDto({
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

  await clientCredentialsHook.postTokenClientCredentials()
  return c.json(result)
}

export const getLogout = async (c: Context<typeConfig.Context>) => {
  const queryDto = new oauthDto.GetLogoutDto({
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

export const revokeToken = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.parseBody()
  const token = String(reqBody.token)
  const tokenTypeHint = String(reqBody.token_type_hint)

  if (!token) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongRefreshToken,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongRefreshToken)
  }

  if (tokenTypeHint !== 'refresh_token') {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongTokenTypeHint,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongTokenTypeHint)
  }

  const { username: clientId } = c.get('basic_auth_body')!

  await oauthService.handleInvalidRefreshToken(
    c,
    token,
    clientId,
  )

  c.status(200)
  return c.body(null)
}
