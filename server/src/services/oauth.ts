import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  ClientType, PostTokenByAuthCodeRes, PostTokenByRefreshTokenRes, Scope, genRandomString,
} from '@melody-auth/shared'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import {
  cryptoUtil, loggerUtil, requestUtil, timeUtil,
} from 'utils'
import {
  consentService,
  jwtService,
  kvService,
  mfaService,
  roleService,
  userService,
} from 'services'
import { oauthDto } from 'dtos'
import {
  signInLogModel, userModel,
} from 'models'

export const handleAuthCodeTokenExchange = async (
  c: Context<typeConfig.Context>,
  authInfo: typeConfig.AuthCodeBody,
  bodyDto: oauthDto.PostTokenAuthCodeDto,
) => {
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
    ENABLE_SIGN_IN_LOG: enableSignInLog,
    ENABLE_PASSWORDLESS_SIGN_IN: enablePasswordlessSignIn,
  } = env(c)

  const {
    requireEmailMfa,
    requireOtpMfa,
    requireSmsMfa,
    enforceOneMfaEnrollment: enforceMfa,
  } = mfaService.getAuthorizeMfaConfig(
    c,
    authInfo,
  )

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

  return result
}

export const handleRefreshTokenTokenExchange = async (
  c: Context<typeConfig.Context>,
  bodyDto: oauthDto.PostTokenRefreshTokenDto,
) => {
  const refreshTokenBody = await kvService.getRefreshTokenBody(
    c,
    bodyDto.refreshToken,
  )

  const user = await userService.getUserByAuthId(
    c,
    refreshTokenBody.authId,
  )
  if (!user || !user.isActive) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.UserDisabled,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.UserDisabled)
  }

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
    refreshTokenBody.impersonatedBy,
  )

  const result: PostTokenByRefreshTokenRes = {
    access_token: accessToken,
    expires_in: accessTokenExpiresIn,
    expires_on: accessTokenExpiresAt,
    token_type: 'Bearer',
  }

  return result
}

export const handleInvalidRefreshToken = async (
  c: Context<typeConfig.Context>,
  refreshToken: string,
  clientId: string,
) => {
  const refreshTokenBody = await kvService.getRefreshTokenBody(
    c,
    refreshToken,
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
    refreshToken,
  )
}
