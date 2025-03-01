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
  cryptoUtil, requestUtil, timeUtil, validateUtil,
} from 'utils'
import {
  signInLogModel, userModel,
} from 'models'
import { Policy } from 'dtos/oauth'
import { PopupRedirect } from 'views'

export const parseGetAuthorizeDto = async (c: Context<typeConfig.Context>): Promise<oauthDto.GetAuthorizeReqDto> => {
  const queryDto = new oauthDto.GetAuthorizeReqDto({
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
    EMAIL_MFA_IS_REQUIRED: enableEmailMfa,
    OTP_MFA_IS_REQUIRED: enableOtpMfa,
    SMS_MFA_IS_REQUIRED: enableSmsMfa,
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

  if (enableOtpMfa || authInfo.user.mfaTypes.includes(userModel.MfaType.Otp)) {
    await kvService.markOtpMfaVerified(
      c.env.KV,
      authCode,
      codeExpiresIn,
    )
  }

  if (enableSmsMfa || authInfo.user.mfaTypes.includes(userModel.MfaType.Sms)) {
    await kvService.markSmsMfaVerified(
      c.env.KV,
      authCode,
      codeExpiresIn,
    )
  }

  if (enableEmailMfa || authInfo.user.mfaTypes.includes(userModel.MfaType.Email)) {
    await kvService.markEmailMfaVerified(
      c.env.KV,
      authCode,
      codeExpiresIn,
    )
  }

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

    if (!queryDto.policy || queryDto.policy === Policy.SignInOrSignUp) {
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
      let baseUrl = ''
      switch (queryDto.policy) {
      case Policy.ChangePassword: {
        baseUrl = routeConfig.IdentityRoute.ChangePassword
        break
      }
      case Policy.ChangeEmail: {
        baseUrl = routeConfig.IdentityRoute.ChangeEmail
        break
      }
      case Policy.ResetMfa: {
        baseUrl = routeConfig.IdentityRoute.ResetMfa
        break
      }
      case Policy.ManagePasskey: {
        baseUrl = routeConfig.IdentityRoute.ManagePasskey
        break
      }
      case Policy.UpdateInfo: {
        baseUrl = routeConfig.IdentityRoute.UpdateInfo
        break
      }
      }
      if (baseUrl) {
        return c.redirect(`${baseUrl}?state=${queryDto.state}&code=${authCode}&locale=${queryDto.locale}&redirect_uri=${queryDto.redirectUri}&org=${queryDto.org}`)
      }
    }
  }

  const queryString = requestUtil.getQueryString(c)
  // [jsx/dom] For testing with new views only, do not change
  // return c.redirect(`${routeConfig.IdentityRoute.AuthorizeView}?${queryString}`)
  return c.redirect(`${routeConfig.IdentityRoute.AuthorizePassword}?${queryString}`)
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
  if (!authInfo) throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)

  const isValidChallenge = await cryptoUtil.isValidCodeChallenge(
    bodyDto.codeVerifier,
    authInfo.request.codeChallenge,
    authInfo.request.codeChallengeMethod,
  )
  if (!isValidChallenge) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongCodeVerifier)
  }

  const isSocialLogin = !!authInfo.user.socialAccountId

  const {
    EMAIL_MFA_IS_REQUIRED: requireEmailMfa,
    OTP_MFA_IS_REQUIRED: requireOtpMfa,
    ENFORCE_ONE_MFA_ENROLLMENT: enforceMfa,
    ENABLE_SIGN_IN_LOG: enableSignInLog,
    SMS_MFA_IS_REQUIRED: requireSmsMfa,
  } = env(c)

  if (!isSocialLogin) {
    if (enforceMfa?.length && !requireEmailMfa && !requireOtpMfa && !requireSmsMfa) {
      if (!authInfo.user.mfaTypes.length) throw new errorConfig.UnAuthorized(localeConfig.Error.MfaNotVerified)
    }

    if (requireOtpMfa || authInfo.user.mfaTypes.includes(userModel.MfaType.Otp)) {
      const isVerified = await kvService.optMfaCodeVerified(
        c.env.KV,
        bodyDto.code,
      )
      if (!isVerified) throw new errorConfig.UnAuthorized(localeConfig.Error.MfaNotVerified)
    }

    if (requireSmsMfa || authInfo.user.mfaTypes.includes(userModel.MfaType.Sms)) {
      const isVerified = await kvService.smsMfaCodeVerified(
        c.env.KV,
        bodyDto.code,
      )
      if (!isVerified) throw new errorConfig.UnAuthorized(localeConfig.Error.MfaNotVerified)
    }

    if (requireEmailMfa || authInfo.user.mfaTypes.includes(userModel.MfaType.Email)) {
      const isVerified = await kvService.emailMfaCodeVerified(
        c.env.KV,
        bodyDto.code,
      )
      if (!isVerified) throw new errorConfig.UnAuthorized(localeConfig.Error.MfaNotVerified)
    }
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

export const revokeToken = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.parseBody()
  const token = String(reqBody.token)
  const tokenTypeHint = String(reqBody.token_type_hint)

  if (!token) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongRefreshToken)
  }

  if (tokenTypeHint !== 'refresh_token') {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongTokenType)
  }

  const { username: clientId } = c.get('basic_auth_body')!

  const refreshTokenBody = await kvService.getRefreshTokenBody(
    c.env.KV,
    token,
  )

  if (!refreshTokenBody || clientId !== refreshTokenBody.clientId) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongRefreshToken)
  }

  await kvService.invalidRefreshToken(
    c.env.KV,
    token,
  )

  c.status(200)
  return c.body(null)
}
