import { Context } from 'hono'
import { env } from 'hono/adapter'
import { genRandomString } from 'shared'
import {
  errorConfig, localeConfig, routeConfig, typeConfig,
} from 'configs'
import {
  identityDto, oauthDto,
} from 'dtos'
import {
  appService, consentService, emailService, kvService, scopeService, sessionService, userService,
} from 'services'
import {
  formatUtil, validateUtil,
} from 'utils'
import {
  AuthorizePasswordView, AuthorizeConsentView, AuthorizeAccountView,
  VerifyEmailView, AuthorizeEmailMfaView,
  AuthorizeResetView, AuthorizeOtpMfaView,
} from 'views'

export const getAuthorizePassword = async (c: Context<typeConfig.Context>) => {
  const queryDto = await scopeService.parseGetAuthorizeDto(c)

  const {
    COMPANY_LOGO_URL: logoUrl,
    ENABLE_SIGN_UP: enableSignUp,
    ENABLE_PASSWORD_RESET: enablePasswordReset,
    SENDGRID_API_KEY: sendgridKey,
    SENDGRID_SENDER_ADDRESS: sendgridSender,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  const allowPasswordReset = enablePasswordReset && !!sendgridKey && !!sendgridSender

  const queryString = formatUtil.getQueryString(c)

  return c.html(<AuthorizePasswordView
    queryString={queryString}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    queryDto={queryDto}
    logoUrl={logoUrl}
    enableSignUp={enableSignUp}
    enablePasswordReset={allowPasswordReset}
  />)
}

export const getAuthorizeReset = async (c: Context<typeConfig.Context>) => {
  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)
  const queryDto = await scopeService.parseGetAuthorizeDto(c)
  const queryString = formatUtil.getQueryString(c)

  return c.html(<AuthorizeResetView
    queryString={queryString}
    logoUrl={logoUrl}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
  />)
}

export const postResetCode = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const email = String(reqBody.email)?.trim()
    .toLowerCase()
  const locale = formatUtil.getLocaleFromQuery(
    c,
    reqBody.locale,
  )
  if (!email) throw new errorConfig.Forbidden()

  await userService.sendPasswordReset(
    c,
    email,
    locale,
  )
  return c.json({ success: true })
}

export const postAuthorizeReset = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeResetReqDto({
    email: String(reqBody.email),
    code: String(reqBody.code),
    password: String(reqBody.password),
  })
  await validateUtil.dto(bodyDto)

  await userService.resetUserPassword(
    c,
    bodyDto,
  )

  const { UNLOCK_ACCOUNT_VIA_PASSWORD_RESET: allowUnlock } = env(c)
  const ip = c.req.header('cf-connecting-ip') as string
  if (allowUnlock) {
    await kvService.clearFailedLoginAttemptsByIP(
      c.env.KV,
      bodyDto.email,
      ip,
    )
  }

  return c.json({ success: true })
}

export const getAuthorizeAccount = async (c: Context<typeConfig.Context>) => {
  const queryDto = await scopeService.parseGetAuthorizeDto(c)

  const {
    COMPANY_LOGO_URL: logoUrl,
    ENABLE_NAMES: enableNames,
    NAMES_IS_REQUIRED: namesIsRequired,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  const queryString = formatUtil.getQueryString(c)

  return c.html(<AuthorizeAccountView
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    queryString={queryString}
    queryDto={queryDto}
    logoUrl={logoUrl}
    enableNames={enableNames}
    namesIsRequired={namesIsRequired}
  />)
}

export const postAuthorizeAccount = async (c: Context<typeConfig.Context>) => {
  const {
    NAMES_IS_REQUIRED: namesIsRequired,
    ENABLE_EMAIL_VERIFICATION: enableEmailVerification,
    ENABLE_EMAIL_MFA: enableEmailMfa,
    ENABLE_OTP_MFA: enableOtpMfa,
  } = env(c)

  const reqBody = await c.req.json()

  const parsedBody = {
    ...reqBody,
    scopes: reqBody.scope.split(' '),
    locale: formatUtil.getLocaleFromQuery(
      c,
      reqBody.locale,
    ),
  }

  const bodyDto = namesIsRequired
    ? new identityDto.PostAuthorizeReqWithRequiredNamesDto(parsedBody)
    : new identityDto.PostAuthorizeReqWithNamesDto(parsedBody)
  await validateUtil.dto(bodyDto)

  const app = await appService.verifySPAClientRequest(
    c,
    bodyDto.clientId,
    bodyDto.redirectUri,
  )

  const user = await userService.createAccountWithPassword(
    c,
    bodyDto,
  )

  if (enableEmailVerification) {
    const verificationCode = await emailService.sendEmailVerification(
      c,
      user,
      bodyDto.locale,
    )
    if (verificationCode) {
      await kvService.storeEmailVerificationCode(
        c.env.KV,
        user.id,
        verificationCode,
      )
    }
  }

  const authCode = genRandomString(128)
  const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)
  const request = new oauthDto.GetAuthorizeReqDto(bodyDto)
  await kvService.storeAuthCode(
    c.env.KV,
    authCode,
    {
      appId: app.id,
      appName: app.name,
      user,
      request,
    },
    codeExpiresIn,
  )

  const requireConsent = await consentService.shouldCollectConsent(
    c,
    user.id,
    app.id,
  )

  const requireEmailMfa = enableEmailMfa && !enableOtpMfa

  if (requireEmailMfa) {
    const mfaCode = await emailService.sendEmailMfa(
      c,
      user,
      bodyDto.locale,
    )
    if (mfaCode) {
      await kvService.storeEmailMfaCode(
        c.env.KV,
        authCode,
        mfaCode,
        codeExpiresIn,
      )
    }
  }

  if (!requireConsent && !enableOtpMfa && !enableEmailMfa) {
    sessionService.setAuthInfoSession(
      c,
      app.id,
      app.name,
      user,
      request,
    )
  }

  return c.json({
    code: authCode,
    redirectUri: bodyDto.redirectUri,
    state: bodyDto.state,
    scopes: bodyDto.scopes,
    requireConsent,
    requireEmailMfa,
    requireOtpSetup: enableOtpMfa && !user.otpVerified,
    requireOtpMfa: enableOtpMfa,
  })
}

export const getAuthorizeConsent = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )

  const app = await appService.verifySPAClientRequest(
    c,
    authInfo.request.clientId,
    queryDto.redirectUri,
  )

  const scopes = await scopeService.getScopesByName(
    c,
    authInfo.request.scopes,
  )

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  return c.html(<AuthorizeConsentView
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    logoUrl={logoUrl}
    scopes={scopes}
    appName={app.name}
    queryDto={queryDto}
  />)
}

export const postAuthorizeConsent = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeConsentReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )

  const userId = authInfo.user.id
  const appId = authInfo.appId
  await consentService.createUserAppConsent(
    c,
    userId,
    appId,
  )

  const {
    ENABLE_EMAIL_MFA: enableEmailMfa,
    ENABLE_OTP_MFA: enableOtpMfa,
  } = env(c)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!enableOtpMfa && !enableEmailMfa) {
    sessionService.setAuthInfoSession(
      c,
      authCodeStore.appId,
      authCodeStore.appName,
      authCodeStore.user,
      authCodeStore.request,
    )
  }

  return c.json({
    code: bodyDto.code,
    redirectUri: bodyDto.redirectUri,
    state: bodyDto.state,
    requireEmailMfa: enableEmailMfa,
    requireOtpSetup: enableOtpMfa && !authCodeStore.user.otpVerified,
    requireOtpMfa: enableOtpMfa,
  })
}

export const getAuthorizeOtpSetup = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )

  if (authCodeStore.user.otpVerified) throw new errorConfig.Forbidden(localeConfig.Error.OtpAlreadySet)

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  const otp = `otpauth://totp/${authCodeStore.appName}:${authCodeStore.user.email}?secret=${authCodeStore.user.otpSecret}&issuer=melody-auth&algorithm=SHA1&digits=6&period=30`

  return c.html(<AuthorizeOtpMfaView
    logoUrl={logoUrl}
    otp={otp}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
  />)
}

export const getAuthorizeOtpMfa = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  return c.html(<AuthorizeOtpMfaView
    logoUrl={logoUrl}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
  />)
}

export const postAuthorizeOtpMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeMfaReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeStore.user.otpSecret) throw new errorConfig.Forbidden()

  const { AUTHORIZATION_CODE_EXPIRES_IN: expiresIn } = env(c)

  const isValid = await kvService.stampOtpMfaCode(
    c.env.KV,
    bodyDto.code,
    bodyDto.mfaCode,
    authCodeStore.user.otpSecret,
    expiresIn,
  )

  if (!isValid) throw new errorConfig.UnAuthorized(localeConfig.Error.WrongMfaCode)

  if (!authCodeStore.user.otpVerified) {
    await userService.markOtpAsVerified(
      c,
      authCodeStore.user.id,
    )
  }

  const { ENABLE_EMAIL_MFA: requireEmailMfa } = env(c)
  if (requireEmailMfa) {
    const mfaCode = await emailService.sendEmailMfa(
      c,
      authCodeStore.user,
      bodyDto.locale,
    )
    if (mfaCode) {
      await kvService.storeEmailMfaCode(
        c.env.KV,
        bodyDto.code,
        mfaCode,
        expiresIn,
      )
    }
  }

  if (!requireEmailMfa) {
    sessionService.setAuthInfoSession(
      c,
      authCodeStore.appId,
      authCodeStore.appName,
      authCodeStore.user,
      authCodeStore.request,
    )
  }

  return c.json({
    code: bodyDto.code,
    redirectUri: bodyDto.redirectUri,
    requireEmailMfa,
    state: bodyDto.state,
  })
}

export const getAuthorizeEmailMfa = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)
  await validateUtil.dto(queryDto)

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  return c.html(<AuthorizeEmailMfaView
    logoUrl={logoUrl}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
  />)
}

export const postAuthorizeEmailMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeMfaReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const {
    AUTHORIZATION_CODE_EXPIRES_IN: expiresIn,
    SERVER_SESSION_EXPIRES_IN: sessionExpiresIn,
  } = env(c)

  const isValid = await kvService.stampEmailMfaCode(
    c.env.KV,
    bodyDto.code,
    bodyDto.mfaCode,
    expiresIn,
  )

  if (!isValid) throw new errorConfig.UnAuthorized(localeConfig.Error.WrongMfaCode)

  if (sessionExpiresIn) {
    const authCodeStore = await kvService.getAuthCodeBody(
      c.env.KV,
      bodyDto.code,
    )
    sessionService.setAuthInfoSession(
      c,
      authCodeStore.appId,
      authCodeStore.appName,
      authCodeStore.user,
      authCodeStore.request,
    )
  }

  return c.json({
    code: bodyDto.code,
    redirectUri: bodyDto.redirectUri,
    state: bodyDto.state,
  })
}

export const postAuthorizePassword = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeReqWithPasswordDto({
    ...reqBody,
    scopes: reqBody.scope.split(' '),
  })
  await validateUtil.dto(bodyDto)

  const user = await userService.verifyPasswordSignIn(
    c,
    bodyDto,
  )

  const app = await appService.verifySPAClientRequest(
    c,
    bodyDto.clientId,
    bodyDto.redirectUri,
  )

  const {
    AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn,
    ENABLE_OTP_MFA: enableOtpMfa,
    ENABLE_EMAIL_MFA: enableEmailMfa,
  } = env(c)

  const updatedUser = enableOtpMfa && !user.otpSecret
    ? await userService.genUserOtp(
      c,
      user.id,
    )
    : user

  const request = new oauthDto.GetAuthorizeReqDto(bodyDto)
  const authCode = genRandomString(128)
  await kvService.storeAuthCode(
    c.env.KV,
    authCode,
    {
      appId: app.id,
      appName: app.name,
      user: updatedUser,
      request,
    },
    codeExpiresIn,
  )

  const requireConsent = await consentService.shouldCollectConsent(
    c,
    user.id,
    app.id,
  )

  const requireEmailMfa = enableEmailMfa && !enableOtpMfa

  if (requireEmailMfa) {
    const mfaCode = await emailService.sendEmailMfa(
      c,
      user,
      bodyDto.locale,
    )
    if (mfaCode) {
      await kvService.storeEmailMfaCode(
        c.env.KV,
        authCode,
        mfaCode,
        codeExpiresIn,
      )
    }
  }

  if (!requireConsent && !enableOtpMfa && !enableEmailMfa) {
    sessionService.setAuthInfoSession(
      c,
      app.id,
      app.name,
      user,
      request,
    )
  }

  return c.json({
    code: authCode,
    redirectUri: bodyDto.redirectUri,
    state: bodyDto.state,
    scopes: bodyDto.scopes,
    requireConsent,
    requireEmailMfa,
    requireOtpSetup: enableOtpMfa && !user.otpVerified,
    requireOtpMfa: enableOtpMfa,
  })
}

export const getVerifyEmail = async (c: Context<typeConfig.Context>) => {
  const queryDto = new identityDto.GetVerifyEmailReqDto({
    id: c.req.query('id') ?? '',
    locale: formatUtil.getLocaleFromQuery(
      c,
      c.req.query('locale'),
    ),
  })
  await validateUtil.dto(queryDto)

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  return c.html(<VerifyEmailView
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    logoUrl={logoUrl}
    queryDto={queryDto}
  />)
}

export const postVerifyEmail = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostVerifyEmailReqDto({
    id: String(reqBody.id),
    code: String(reqBody.code),
  })
  await validateUtil.dto(bodyDto)

  await userService.verifyUserEmail(
    c,
    bodyDto,
  )

  return c.json({ success: true })
}

export const postLogout = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.parseBody()
  const bodyDto = new identityDto.PostLogoutReqDto({
    refreshToken: String(reqBody.refresh_token),
    postLogoutRedirectUri: reqBody.post_logout_redirect_uri
      ? String(reqBody.post_logout_redirect_uri)
      : '',
  })
  await validateUtil.dto(bodyDto)

  const accessTokenBody = c.get('access_token_body')!
  const refreshTokenBody = await kvService.getRefreshTokenBody(
    c.env.KV,
    bodyDto.refreshToken,
  )

  if (refreshTokenBody) {
    if (accessTokenBody.sub !== refreshTokenBody.authId) {
      throw new errorConfig.Forbidden(localeConfig.Error.WrongRefreshToken)
    }
    await kvService.invalidRefreshToken(
      c.env.KV,
      bodyDto.refreshToken,
    )
  }

  const { AUTH_SERVER_URL } = env(c)
  const redirectUri = `${formatUtil.stripEndingSlash(AUTH_SERVER_URL)}${routeConfig.InternalRoute.OAuth}/logout`

  return c.json({
    success: true,
    redirectUri:
      `${redirectUri}?post_logout_redirect_uri=${bodyDto.postLogoutRedirectUri}&client_id=${refreshTokenBody.clientId}`,
  })
}
