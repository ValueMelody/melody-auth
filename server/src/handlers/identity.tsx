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
  AuthorizeResetView,
} from 'views'

export const getAuthorizePassword = async (c: Context<typeConfig.Context>) => {
  const queryDto = await scopeService.parseGetAuthorizeDto(c)

  const {
    COMPANY_LOGO_URL: logoUrl,
    ENABLE_SIGN_UP: enableSignUp,
    ENABLE_PASSWORD_RESET: enablePasswordReset,
    SENDGRID_API_KEY: sendgridKey,
    SENDGRID_SENDER_ADDRESS: sendgridSender,
  } = env(c)

  const allowPasswordReset = enablePasswordReset && !!sendgridKey && !!sendgridSender

  const queryString = formatUtil.getQueryString(c)

  return c.html(<AuthorizePasswordView
    queryString={queryString}
    queryDto={queryDto}
    logoUrl={logoUrl}
    enableSignUp={enableSignUp}
    enablePasswordReset={allowPasswordReset}
  />)
}

export const getAuthorizeReset = async (c: Context<typeConfig.Context>) => {
  const { COMPANY_LOGO_URL: logoUrl } = env(c)

  const queryString = formatUtil.getQueryString(c)

  return c.html(<AuthorizeResetView
    queryString={queryString}
    logoUrl={logoUrl}
  />)
}

export const postResetCode = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const email = String(reqBody.email)?.trim()
    .toLowerCase()
  if (!email) throw new errorConfig.Forbidden()

  await userService.sendPasswordReset(
    c,
    email,
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

  return c.json({ success: true })
}

export const getAuthorizeAccount = async (c: Context<typeConfig.Context>) => {
  const queryDto = await scopeService.parseGetAuthorizeDto(c)

  const {
    COMPANY_LOGO_URL: logoUrl,
    ENABLE_NAMES: enableNames,
    NAMES_IS_REQUIRED: namesIsRequired,
  } = env(c)

  const queryString = formatUtil.getQueryString(c)

  return c.html(<AuthorizeAccountView
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
    ENABLE_EMAIL_MFA: enableEmailMFA,
  } = env(c)

  const reqBody = await c.req.json()
  const parsedBody = {
    ...reqBody,
    scopes: reqBody.scope.split(' '),
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
  await kvService.storeAuthCode(
    c.env.KV,
    authCode,
    {
      appId: app.id,
      user,
      request: new oauthDto.GetAuthorizeReqDto(bodyDto),
    },
    codeExpiresIn,
  )

  if (enableEmailMFA) {
    await kvService.markEmailMfaVerified(
      c.env.KV,
      authCode,
      codeExpiresIn,
    )
  }

  const requireConsent = await consentService.shouldCollectConsent(
    c,
    user.id,
    app.id,
  )

  return c.json({
    code: authCode,
    redirectUri: bodyDto.redirectUri,
    state: bodyDto.state,
    scopes: bodyDto.scopes,
    requireConsent,
  })
}

export const getAuthorizeConsent = async (c: Context<typeConfig.Context>) => {
  const queryDto = new identityDto.GetAuthorizeFollowUpReqDto({
    state: c.req.query('state') ?? '',
    redirectUri: c.req.query('redirect_uri') ?? '',
    code: c.req.query('code') ?? '',
  })
  await validateUtil.dto(queryDto)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )

  const app = await appService.verifySPAClientRequest(
    c,
    authInfo.request.clientId,
    queryDto.redirectUri,
  )

  const { COMPANY_LOGO_URL: logoUrl } = env(c)

  return c.html(<AuthorizeConsentView
    logoUrl={logoUrl}
    scopes={authInfo.request.scopes}
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

  return c.json({
    code: bodyDto.code,
    redirectUri: bodyDto.redirectUri,
    state: bodyDto.state,
  })
}

export const getAuthorizeEmailMFA = async (c: Context<typeConfig.Context>) => {
  const queryDto = new identityDto.GetAuthorizeFollowUpReqDto({
    state: c.req.query('state') ?? '',
    redirectUri: c.req.query('redirect_uri') ?? '',
    code: c.req.query('code') ?? '',
  })
  await validateUtil.dto(queryDto)

  const { COMPANY_LOGO_URL: logoUrl } = env(c)

  return c.html(<AuthorizeEmailMfaView
    logoUrl={logoUrl}
    queryDto={queryDto}
  />)
}

export const postAuthorizeEmailMFA = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeMfaReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const isValid = await kvService.verifyEmailMfaCode(
    c.env.KV,
    bodyDto.code,
    bodyDto.mfaCode,
  )

  if (!isValid) throw new errorConfig.UnAuthorized(localeConfig.Error.WrongMfaCode)

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

  const request = new oauthDto.GetAuthorizeReqDto(bodyDto)
  const authCode = genRandomString(128)
  const {
    AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn,
    ENABLE_EMAIL_MFA: enableEmailMFA,
  } = env(c)
  await kvService.storeAuthCode(
    c.env.KV,
    authCode,
    {
      appId: app.id,
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

  if (!requireConsent) {
    sessionService.setAuthInfoSession(
      c,
      app.id,
      user,
      request,
    )
  }

  if (enableEmailMFA) {
    const mfaCode = await emailService.sendEmailMFA(
      c,
      user,
    )
    if (mfaCode) {
      await kvService.storeEmailMFACode(
        c.env.KV,
        authCode,
        mfaCode,
        codeExpiresIn,
      )
    }
  }

  return c.json({
    code: authCode,
    redirectUri: bodyDto.redirectUri,
    state: bodyDto.state,
    scopes: bodyDto.scopes,
    requireConsent,
    requireEmailMFA: enableEmailMFA,
  })
}

export const getVerifyEmail = async (c: Context<typeConfig.Context>) => {
  const queryDto = new identityDto.GetVerifyEmailReqDto({ id: c.req.query('id') ?? '' })
  await validateUtil.dto(queryDto)

  const { COMPANY_LOGO_URL: logoUrl } = env(c)

  return c.html(<VerifyEmailView
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

  if (refreshTokenBody && accessTokenBody.sub !== refreshTokenBody.authId) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongRefreshToken)
  }

  if (!refreshTokenBody) {
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
