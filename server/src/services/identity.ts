import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  genCodeChallenge, genRandomString,
} from '@melody-auth/shared'
import { getCookie } from 'hono/cookie'
import {
  adapterConfig,
  errorConfig,
  messageConfig,
  routeConfig,
  typeConfig,
  variableConfig,
} from 'configs'
import {
  consentService, passkeyService, sessionService, appService, kvService, mfaService,
  scopeService,
  userService,
} from 'services'
import { userModel } from 'models'
import {
  loggerUtil, requestUtil,
} from 'utils'
import { oauthDto } from 'dtos'

export enum AuthorizeStep {
  Account = 0,
  Password = 0,
  RecoveryCode = 0,
  Passwordless = 0,
  Social = 0,
  PasskeyVerify = 0,
  PasswordlessVerify = 1,
  Consent = 2,
  MfaEnroll = 3,
  OtpMfa = 4,
  SmsMfa = 5,
  EmailMfa = 6,
  PasskeyEnroll = 7,
  RecoveryCodeEnroll = 8,
  SwitchOrg = 9,
}

const getNextPageForPolicy = (
  c: Context<typeConfig.Context>, authCodeBody: typeConfig.AuthCodeBody, isSocialLogin: boolean,
) => {
  let nextPage
  if (!isSocialLogin) {
    const {
      ENABLE_PASSWORD_RESET: enablePasswordReset,
      ENABLE_EMAIL_VERIFICATION: enableEmailVerification,
      ALLOW_PASSKEY_ENROLLMENT: enablePasskeyEnrollment,
      ENABLE_RECOVERY_CODE: enableRecoveryCode,
    } = env(c)

    switch (authCodeBody.request.policy) {
    case oauthDto.Policy.ChangePassword: {
      if (enablePasswordReset) nextPage = routeConfig.View.ChangePassword
      break
    }
    case oauthDto.Policy.ChangeEmail: {
      if (enableEmailVerification) nextPage = routeConfig.View.ChangeEmail
      break
    }
    case oauthDto.Policy.ResetMfa: {
      nextPage = routeConfig.View.ResetMfa
      break
    }
    case oauthDto.Policy.ManagePasskey: {
      if (enablePasskeyEnrollment) nextPage = routeConfig.View.ManagePasskey
      break
    }
    case oauthDto.Policy.ManageRecoveryCode: {
      if (enableRecoveryCode) nextPage = routeConfig.View.ManageRecoveryCode
      break
    }
    case oauthDto.Policy.UpdateInfo: {
      nextPage = routeConfig.View.UpdateInfo
      break
    }
    }
  }

  return nextPage
}

export const processPostAuthorize = async (
  c: Context<typeConfig.Context>,
  step: AuthorizeStep,
  authCode: string,
  authCodeBody: typeConfig.AuthCodeBody,
) => {
  const basicInfo = {
    code: authCode,
    redirectUri: authCodeBody.request.redirectUri,
    state: authCodeBody.request.state,
    scopes: authCodeBody.request.scopes,
  }

  const {
    requireEmailMfa: enableEmailMfa,
    requireOtpMfa: enableOtpMfa,
    requireSmsMfa: enableSmsMfa,
    enforceOneMfaEnrollment: enforceMfa,
  } = mfaService.getAuthorizeMfaConfig(
    c,
    authCodeBody,
  )

  const {
    ENABLE_PASSWORDLESS_SIGN_IN: enablePasswordlessSignIn,
    ALLOW_PASSKEY_ENROLLMENT: enablePasskeyEnrollment,
    ENABLE_RECOVERY_CODE: enableRecoveryCode,
    AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn,
    ENABLE_MFA_REMEMBER_DEVICE: enableMfaRememberDevice,
    ALLOW_USER_SWITCH_ORG_ON_SIGN_IN: allowSwitchOrg,
  } = env(c)

  const isSocialLogin = !!authCodeBody.user.socialAccountId

  const requirePasswordlessVerify =
    step < 1 &&
    enablePasswordlessSignIn &&
    !isSocialLogin &&
    !authCodeBody.isFullyAuthorized
  if (requirePasswordlessVerify) {
    return {
      ...basicInfo, nextPage: routeConfig.View.PasswordlessVerify,
    }
  }

  const requireConsent = step < 2 && await consentService.shouldCollectConsent(
    c,
    authCodeBody.user.id,
    authCodeBody.appId,
  )
  if (requireConsent) {
    return {
      ...basicInfo, nextPage: routeConfig.View.Consent,
    }
  }

  const authorizedResult = {
    code: authCode,
    redirectUri: authCodeBody.request.redirectUri,
    state: authCodeBody.request.state,
    scopes: authCodeBody.request.scopes,
    nextPage: undefined,
  }

  if (authCodeBody.isFullyAuthorized) {
    const nextPage = getNextPageForPolicy(
      c,
      authCodeBody,
      isSocialLogin,
    )
    return {
      ...authorizedResult, nextPage,
    }
  }

  const requireMfaEnroll =
    step < 3 &&
    !isSocialLogin &&
    !!enforceMfa?.length &&
    !enableEmailMfa &&
    !enableOtpMfa &&
    !enableSmsMfa &&
    !authCodeBody.user.mfaTypes.length
  if (requireMfaEnroll) {
    return {
      ...basicInfo, nextPage: routeConfig.View.MfaEnroll,
    }
  }

  const requireOtpMfa =
    step < 4 &&
    !isSocialLogin &&
    (enableOtpMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Otp))
  const requireOtpSetup = requireOtpMfa && !authCodeBody.user.otpVerified
  if (requireOtpSetup) {
    return {
      ...basicInfo, nextPage: routeConfig.View.OtpSetup,
    }
  }
  if (requireOtpMfa) {
    if (!enableMfaRememberDevice) {
      return {
        ...basicInfo, nextPage: routeConfig.View.OtpMfa,
      }
    }

    const cookieKey = adapterConfig.getOtpMfaRememberDeviceCookieKey(authCodeBody.user.id)
    const cookieValue = getCookie(
      c,
      cookieKey,
    )
    const isValid = await kvService.verifyOtpMfaRememberDevice(
      c.env.KV,
      authCodeBody.user.id,
      cookieValue,
    )

    if (isValid) {
      await kvService.bypassOtpMfa(
        c.env.KV,
        authCode,
        codeExpiresIn,
      )
    } else {
      return {
        ...basicInfo, nextPage: routeConfig.View.OtpMfa,
      }
    }
  }

  const requireSmsMfa =
    step < 5 &&
    !isSocialLogin &&
    (enableSmsMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Sms))
  if (requireSmsMfa) {
    if (!enableMfaRememberDevice) {
      return {
        ...basicInfo, nextPage: routeConfig.View.SmsMfa,
      }
    }

    const cookieKey = adapterConfig.getSmsMfaRememberDeviceCookieKey(authCodeBody.user.id)
    const cookieValue = getCookie(
      c,
      cookieKey,
    )
    const isValid = await kvService.verifySmsMfaRememberDevice(
      c.env.KV,
      authCodeBody.user.id,
      cookieValue,
    )

    if (isValid) {
      await kvService.bypassSmsMfa(
        c.env.KV,
        authCode,
        codeExpiresIn,
      )
    } else {
      return {
        ...basicInfo, nextPage: routeConfig.View.SmsMfa,
      }
    }
  }

  const requireEmailMfa =
    step < 6 &&
    !isSocialLogin &&
    (enableEmailMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Email))
  if (requireEmailMfa) {
    if (!enableMfaRememberDevice) {
      return {
        ...basicInfo, nextPage: routeConfig.View.EmailMfa,
      }
    }

    const cookieKey = adapterConfig.getEmailMfaRememberDeviceCookieKey(authCodeBody.user.id)
    const cookieValue = getCookie(
      c,
      cookieKey,
    )
    const isValid = await kvService.verifyEmailMfaRememberDevice(
      c.env.KV,
      authCodeBody.user.id,
      cookieValue,
    )

    if (isValid) {
      await kvService.bypassEmailMfa(
        c.env.KV,
        authCode,
        codeExpiresIn,
      )
    } else {
      return {
        ...basicInfo, nextPage: routeConfig.View.EmailMfa,
      }
    }
  }

  const requirePasskeyEnroll =
    step < 7 &&
    !isSocialLogin &&
    enablePasskeyEnrollment
  if (requirePasskeyEnroll && !authCodeBody.user.skipPasskeyEnroll) {
    const passkey = await passkeyService.getPasskeyByUser(
      c,
      authCodeBody.user.id,
    )
    if (!passkey) {
      return {
        ...basicInfo, nextPage: routeConfig.View.PasskeyEnroll,
      }
    }
  }

  const requireRecoveryCodeEnroll =
    step < 8 &&
    !isSocialLogin &&
    enableRecoveryCode &&
    !authCodeBody.user.recoveryCodeHash
  if (requireRecoveryCodeEnroll) {
    return {
      ...basicInfo, nextPage: routeConfig.View.RecoveryCodeEnroll,
    }
  }

  const requireSwitchOrg = step < 9 && allowSwitchOrg
  if (requireSwitchOrg) {
    return {
      ...basicInfo, nextPage: routeConfig.View.SwitchOrg,
    }
  }

  if (step < 10) {
    const nextPage = getNextPageForPolicy(
      c,
      authCodeBody,
      isSocialLogin,
    )
    if (nextPage) {
      return {
        ...basicInfo, nextPage,
      }
    }
  }

  sessionService.setAuthInfoSession(
    c,
    authCodeBody,
  )

  return authorizedResult
}

export const processSignIn = async (
  c: Context<typeConfig.Context>,
  bodyDto: oauthDto.GetAuthorizeDto,
  user: userModel.Record,
) => {
  const app = await appService.verifySPAClientRequest(
    c,
    bodyDto.clientId,
    bodyDto.redirectUri,
  )

  const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)

  const mfaConfig = mfaService.getAppMfaConfig(app)

  const request = new oauthDto.GetAuthorizeDto(bodyDto)
  const authCode = genRandomString(128)
  const authCodeBody = {
    appId: app.id,
    appName: app.name,
    user,
    request,
    mfa: mfaConfig ? mfaService.getAuthCodeBodyMfaConfig(mfaConfig) : undefined,
  }
  await kvService.storeAuthCode(
    c.env.KV,
    authCode,
    authCodeBody,
    codeExpiresIn,
  )

  return {
    authCode,
    authCodeBody,
  }
}

export const processGetAppConsent = async (
  c: Context<typeConfig.Context>,
  request: oauthDto.CoreAuthorizeDto,
) => {
  const app = await appService.verifySPAClientRequest(
    c,
    request.clientId,
    request.redirectUri,
  )

  const scopes = await scopeService.getScopesByName(
    c,
    request.scopes,
  )

  return {
    scopes,
    appName: app.name,
  }
}

export const processResetPassword = async (
  c: Context<typeConfig.Context>,
  email: string,
  locale: typeConfig.Locale,
) => {
  if (!email) throw new errorConfig.Forbidden()

  const ip = requestUtil.getRequestIP(c)
  const { PASSWORD_RESET_EMAIL_THRESHOLD: resetThreshold } = env(c)

  if (resetThreshold) {
    const resetAttempts = await kvService.getPasswordResetAttemptsByIP(
      c.env.KV,
      email,
      ip,
    )
    if (resetAttempts >= resetThreshold) {
      loggerUtil.triggerLogger(
        c,
        loggerUtil.LoggerLevel.Warn,
        messageConfig.RequestError.PasswordResetLocked,
      )
      throw new errorConfig.Forbidden(messageConfig.RequestError.PasswordResetLocked)
    }

    await kvService.setPasswordResetAttemptsByIP(
      c.env.KV,
      email,
      ip,
      resetAttempts + 1,
    )
  }

  await userService.sendPasswordReset(
    c,
    email,
    locale,
  )
}

export const prepareOidcRedirect = async (
  c: Context<typeConfig.Context>,
  policyName: string,
  queryDto: oauthDto.GetAuthorizeDto,
) => {
  const { OIDC_AUTH_PROVIDERS: oidcAuthProviders } = env(c)

  const providerName = policyName.replace(
    oauthDto.Policy.Oidc,
    '',
  )
  const config = variableConfig.OIDCProviderConfigs[providerName]

  if (!config || !config.enableSignInRedirect || !oidcAuthProviders?.includes(providerName)) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.InvalidOidcAuthorizeRequest,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.InvalidOidcAuthorizeRequest)
  }

  const codeVerifier = genRandomString(128)
  const codeChallenge = await genCodeChallenge(codeVerifier)

  await kvService.storeOidcCodeVerifier(
    c.env.KV,
    codeVerifier,
  )

  const { AUTH_SERVER_URL: serverUrl } = env(c)

  const socialSignInState = {
    clientId: queryDto.clientId,
    redirectUri: queryDto.redirectUri,
    responseType: queryDto.responseType,
    state: queryDto.state,
    codeChallenge: queryDto.codeChallenge,
    codeChallengeMethod: queryDto.codeChallengeMethod,
    locale: queryDto.locale,
    policy: queryDto.policy,
    org: queryDto.org,
    scopes: queryDto.scopes,
  }

  const url = `${config.authorizeEndpoint}?client_id=${config.clientId}&state=${JSON.stringify({
    ...socialSignInState,
    codeVerifier,
  })}&scope=openid&redirect_uri=${serverUrl}${routeConfig.IdentityRoute.AuthorizeOidc}/${providerName}&response_type=code&code_challenge=${codeChallenge}&code_challenge_method=S256`

  return url
}
