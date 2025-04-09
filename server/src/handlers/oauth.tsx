import { Context } from 'hono'
import {
  ClientType, PostTokenByAuthCodeRes, PostTokenByRefreshTokenRes, PostTokenByClientCredentialsRes, Scope,
  genRandomString,
} from 'shared'
import { env } from 'hono/adapter'
import {
  errorConfig, messageConfig, routeConfig, typeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import {
  appService, consentService, jwtService, kvService, roleService, scopeService, sessionService, userService,
} from 'services'
import {
  cryptoUtil, loggerUtil, requestUtil, timeUtil, validateUtil,
} from 'utils'
import {
  signInLogModel, userModel,
} from 'models'
import { PopupRedirect } from 'templates'

export const parseGetAuthorizeDto = async (c: Context<typeConfig.Context>): Promise<oauthDto.GetAuthorizeDto> => {
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
    org: c.req.query('org') ?? undefined,
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
    ...queryDto,
    scopes: validScopes,
  }
}

export const createFullAuthorize = async (
  c: Context<typeConfig.Context>, authInfo: typeConfig.AuthCodeBody,
) => {
  const authCode = genRandomString(128)
  const {
    AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn,
  } = env(c)
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
  const queryDto = await parseGetAuthorizeDto(c)
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

    if (!queryDto.policy || queryDto.policy === oauthDto.Policy.SignInOrSignUp) {
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
  return c.redirect(`${routeConfig.IdentityRoute.AuthorizeView}?${queryString}`)
}

export const postTokenAuthCode = async (c: Context<typeConfig.Context>) => {
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

  const isValidChallenge = await cryptoUtil.isValidCodeChallenge(
    bodyDto.codeVerifier,
    authInfo.request.codeChallenge,
    authInfo.request.codeChallengeMethod,
  )
  if (!isValidChallenge) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongCodeVerifier,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongCodeVerifier)
  }

  const isSocialLogin = !!authInfo.user.socialAccountId

  const {
    EMAIL_MFA_IS_REQUIRED: requireEmailMfa,
    OTP_MFA_IS_REQUIRED: requireOtpMfa,
    ENFORCE_ONE_MFA_ENROLLMENT: enforceMfa,
    ENABLE_SIGN_IN_LOG: enableSignInLog,
    SMS_MFA_IS_REQUIRED: requireSmsMfa,
    ENABLE_PASSWORDLESS_SIGN_IN: enablePasswordlessSignIn,
  } = env(c)

  if (!isSocialLogin && !authInfo.isFullyAuthorized) {
    if (enforceMfa?.length && !requireEmailMfa && !requireOtpMfa && !requireSmsMfa) {
      if (!authInfo.user.mfaTypes.length) {
        loggerUtil.triggerLogger(
          c,
          loggerUtil.LoggerLevel.Warn,
          messageConfig.RequestError.MfaNotVerified,
        )
        throw new errorConfig.UnAuthorized(messageConfig.RequestError.MfaNotVerified)
      }
    }

    if (requireOtpMfa || authInfo.user.mfaTypes.includes(userModel.MfaType.Otp)) {
      const isVerified = await kvService.optMfaCodeVerified(
        c.env.KV,
        bodyDto.code,
      )
      if (!isVerified) {
        loggerUtil.triggerLogger(
          c,
          loggerUtil.LoggerLevel.Warn,
          messageConfig.RequestError.MfaNotVerified,
        )
        throw new errorConfig.UnAuthorized(messageConfig.RequestError.MfaNotVerified)
      }
    }

    if (requireSmsMfa || authInfo.user.mfaTypes.includes(userModel.MfaType.Sms)) {
      const isVerified = await kvService.smsMfaCodeVerified(
        c.env.KV,
        bodyDto.code,
      )
      if (!isVerified) {
        loggerUtil.triggerLogger(
          c,
          loggerUtil.LoggerLevel.Warn,
          messageConfig.RequestError.MfaNotVerified,
        )
        throw new errorConfig.UnAuthorized(messageConfig.RequestError.MfaNotVerified)
      }
    }

    if (requireEmailMfa || authInfo.user.mfaTypes.includes(userModel.MfaType.Email)) {
      const isVerified = await kvService.emailMfaCodeVerified(
        c.env.KV,
        bodyDto.code,
      )
      if (!isVerified) {
        loggerUtil.triggerLogger(
          c,
          loggerUtil.LoggerLevel.Warn,
          messageConfig.RequestError.MfaNotVerified,
        )
        throw new errorConfig.UnAuthorized(messageConfig.RequestError.MfaNotVerified)
      }
    }

    if (enablePasswordlessSignIn) {
      const isVerified = await kvService.passwordlessCodeVerified(
        c.env.KV,
        bodyDto.code,
      )
      if (!isVerified) {
        loggerUtil.triggerLogger(
          c,
          loggerUtil.LoggerLevel.Warn,
          messageConfig.RequestError.PasswordlessNotVerified,
        )
        throw new errorConfig.UnAuthorized(messageConfig.RequestError.PasswordlessNotVerified)
      }
    }
  }

  const requireConsent = await consentService.shouldCollectConsent(
    c,
    authInfo.user.id,
    authInfo.appId,
  )
  if (requireConsent) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoConsent,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.NoConsent)
  }

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

  await userService.increaseLoginCount(
    c,
    authInfo.user.id,
  )

  if (enableSignInLog) {
    const ip = requestUtil.getRequestIP(c)
    let detail = null
    if ('cf' in c.req.raw) {
      const cf = c.req.raw.cf as {
        longitude: string;
        continent: string;
        country: string;
        timezone: string;
        region: string;
        regionCode: string;
        latitude: string;
      }
      detail = JSON.stringify({
        longitude: cf.longitude,
        continent: cf.continent,
        country: cf.country,
        timezone: cf.timezone,
        region: cf.region,
        regionCode: cf.regionCode,
        latitude: cf.latitude,
      })
    }
    await signInLogModel.create(
      c.env.DB,
      {
        userId: authInfo.user.id,
        ip: ip ?? null,
        detail,
      },
    )
  }

  return c.json(result)
}

export const postTokenRefreshToken = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.parseBody()

  const bodyDto = new oauthDto.PostTokenRefreshTokenDto({
    grantType: String(reqBody.grant_type),
    refreshToken: String(reqBody.refresh_token),
  })
  await validateUtil.dto(bodyDto)

  const refreshTokenBody = await kvService.getRefreshTokenBody(
    c,
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

  const refreshTokenBody = await kvService.getRefreshTokenBody(
    c,
    token,
  )

  if (!refreshTokenBody || clientId !== refreshTokenBody.clientId) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongRefreshToken,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongRefreshToken)
  }

  await kvService.invalidRefreshToken(
    c.env.KV,
    token,
  )

  c.status(200)
  return c.body(null)
}
