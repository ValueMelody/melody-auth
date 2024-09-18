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
  appService, consentService, emailService, jwtService, kvService, scopeService, sessionService, userService,
} from 'services'
import {
  requestUtil, validateUtil,
} from 'utils'
import {
  AuthorizePasswordView, AuthorizeConsentView, AuthorizeAccountView,
  VerifyEmailView, AuthorizeEmailMfaView,
  AuthorizeResetView, AuthorizeOtpMfaView,
  AuthorizeMfaEnrollView,
} from 'views'
import { AuthCodeBody } from 'configs/type'
import {
  appModel, userModel,
} from 'models'

enum AuthorizeStep {
  Account = 0,
  Password = 0,
  Social = 0,
  Consent = 1,
  MfaEnroll = 2,
  OtpMfa = 3,
  OtpEmail = 4,
}

const handlePostAuthorize = async (
  c: Context<typeConfig.Context>,
  step: AuthorizeStep,
  authCode: string,
  authCodeBody: AuthCodeBody,
) => {
  const requireConsent = step < 1 && await consentService.shouldCollectConsent(
    c,
    authCodeBody.user.id,
    authCodeBody.appId,
  )

  const isSocialLogin = !!authCodeBody.user.socialAccountId

  const {
    EMAIL_MFA_IS_REQUIRED: enableEmailMfa,
    OTP_MFA_IS_REQUIRED: enableOtpMfa,
    ENFORCE_ONE_MFA_ENROLLMENT: enforceMfa,
  } = env(c)

  const requireMfaEnroll =
    step < 2 &&
    !isSocialLogin &&
    enforceMfa &&
    !enableEmailMfa &&
    !enableOtpMfa &&
    !authCodeBody.user.mfaTypes.length

  const requireOtpMfa =
    step < 3 &&
    !isSocialLogin &&
    (enableOtpMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Otp))
  const requireOtpSetup = requireOtpMfa && !authCodeBody.user.otpVerified

  const requireEmailMfa =
    step < 4 &&
    !isSocialLogin &&
    (enableEmailMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Email))

  if (!requireConsent && !requireMfaEnroll && !requireOtpMfa && !requireEmailMfa) {
    sessionService.setAuthInfoSession(
      c,
      authCodeBody.appId,
      authCodeBody.appName,
      authCodeBody.user,
      authCodeBody.request,
    )
  }

  return {
    code: authCode,
    redirectUri: authCodeBody.request.redirectUri,
    state: authCodeBody.request.state,
    scopes: authCodeBody.request.scopes,
    requireConsent,
    requireMfaEnroll,
    requireEmailMfa,
    requireOtpSetup,
    requireOtpMfa,
  }
}

const handleSendEmailMfa = async (
  c: Context<typeConfig.Context>,
  authCode: string,
  locale: typeConfig.Locale,
) => {
  const {
    EMAIL_MFA_IS_REQUIRED: enableEmailMfa,
    AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn,
  } = env(c)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    authCode,
  )
  const requireEmailMfa = enableEmailMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Email)
  const couldFallback = allowSwitchToEmailMfa(
    c,
    authCodeBody,
  )

  if (!requireEmailMfa && !couldFallback) throw new errorConfig.Forbidden()

  const mfaCode = await emailService.sendEmailMfa(
    c,
    authCodeBody.user,
    locale,
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

const allowSwitchToEmailMfa = (
  c: Context<typeConfig.Context>,
  authCodeStore: AuthCodeBody,
) => {
  const {
    OTP_MFA_IS_REQUIRED: enableOtpMfa,
    EMAIL_MFA_IS_REQUIRED: enableEmailMfa,
    ALLOW_EMAIL_MFA_AS_BACKUP: allowFallback,
  } = env(c)
  const notEnrolledEmail = !enableEmailMfa && !authCodeStore.user.mfaTypes.includes(userModel.MfaType.Email)
  const enrolledOtp = enableOtpMfa || authCodeStore.user.mfaTypes.includes(userModel.MfaType.Otp)

  return allowFallback && notEnrolledEmail && enrolledOtp
}

export const getAuthorizePassword = async (c: Context<typeConfig.Context>) => {
  const queryDto = await scopeService.parseGetAuthorizeDto(c)

  const {
    COMPANY_LOGO_URL: logoUrl,
    ENABLE_SIGN_UP: enableSignUp,
    ENABLE_PASSWORD_RESET: enablePasswordReset,
    ENABLE_PASSWORD_SIGN_IN: enablePasswordSignIn,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
    GOOGLE_AUTH_CLIENT_ID: googleClientId,
    FACEBOOK_AUTH_CLIENT_ID: facebookClientId,
    FACEBOOK_AUTH_CLIENT_SECRET: facebookClientSecret,
    GITHUB_AUTH_CLIENT_ID: githubClientId,
    GITHUB_AUTH_CLIENT_SECRET: githubClientSecret,
    GITHUB_AUTH_APP_NAME: githubAppName,
  } = env(c)

  const queryString = requestUtil.getQueryString(c)

  return c.html(<AuthorizePasswordView
    queryString={queryString}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    queryDto={queryDto}
    logoUrl={logoUrl}
    enableSignUp={enableSignUp}
    enablePasswordReset={enablePasswordReset}
    enablePasswordSignIn={enablePasswordSignIn}
    googleClientId={googleClientId}
    facebookClientId={facebookClientId && facebookClientSecret ? facebookClientId : ''}
    githubClientId={githubClientId && githubClientSecret && githubAppName ? githubClientId : ''}
  />)
}

export const getAuthorizeReset = async (c: Context<typeConfig.Context>) => {
  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)
  const queryDto = await scopeService.parseGetAuthorizeDto(c)
  const queryString = requestUtil.getQueryString(c)

  return c.html(<AuthorizeResetView
    queryString={queryString}
    logoUrl={logoUrl}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
  />)
}

export const postResetCode = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const email = reqBody.email
    ? String(reqBody.email).trim()
      .toLowerCase()
    : ''
  const locale = requestUtil.getLocaleFromQuery(
    c,
    reqBody.locale,
  )
  if (!email) throw new errorConfig.Forbidden()

  const ip = requestUtil.getRequestIP(c)
  const resetAttempts = await kvService.getPasswordResetAttemptsByIP(
    c.env.KV,
    email,
    ip,
  )
  const { PASSWORD_RESET_EMAIL_THRESHOLD: resetThreshold } = env(c)
  if (resetAttempts >= resetThreshold) throw new errorConfig.Forbidden(localeConfig.Error.PasswordResetLocked)

  await kvService.setPasswordResetAttemptsByIP(
    c.env.KV,
    email,
    ip,
    resetAttempts + 1,
  )

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
  const ip = requestUtil.getRequestIP(c)
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
    TERMS_LINK: termsLink,
    PRIVACY_POLICY_LINK: privacyPolicyLink,
  } = env(c)

  const queryString = requestUtil.getQueryString(c)

  return c.html(<AuthorizeAccountView
    termsLink={termsLink}
    privacyPolicyLink={privacyPolicyLink}
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
  } = env(c)

  const reqBody = await c.req.json()

  const parsedBody = {
    ...reqBody,
    scopes: reqBody.scope.split(' '),
    locale: requestUtil.getLocaleFromQuery(
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

  const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)
  const request = new oauthDto.GetAuthorizeReqDto(bodyDto)
  const authCode = genRandomString(128)
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

  return c.json(await handlePostAuthorize(
    c,
    AuthorizeStep.Account,
    authCode,
    authCodeBody,
  ))
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

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )

  await consentService.createUserAppConsent(
    c,
    authCodeBody.user.id,
    authCodeBody.appId,
  )

  return c.json(await handlePostAuthorize(
    c,
    AuthorizeStep.Consent,
    bodyDto.code,
    authCodeBody,
  ))
}

export const getAuthorizeMfaEnroll = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )

  if (authCodeStore.user.mfaTypes.length) throw new errorConfig.Forbidden(localeConfig.Error.MfaEnrolled)

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  return c.html(<AuthorizeMfaEnrollView
    logoUrl={logoUrl}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
  />)
}

export const postAuthorizeMfaEnroll = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeEnrollReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (authCodeStore.user.mfaTypes.length) throw new errorConfig.Forbidden(localeConfig.Error.MfaEnrolled)

  const user = await userService.enrollUserMfa(
    c,
    authCodeStore.user.authId,
    bodyDto.type,
  )
  const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)
  const newAuthCodeStore = {
    ...authCodeStore,
    user,
  }
  await kvService.storeAuthCode(
    c.env.KV,
    bodyDto.code,
    newAuthCodeStore,
    codeExpiresIn,
  )

  return c.json(await handlePostAuthorize(
    c,
    AuthorizeStep.MfaEnroll,
    bodyDto.code,
    newAuthCodeStore,
  ))
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
    showEmailMfaBtn={false}
  />)
}

export const getAuthorizeOtpMfa = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  const allowSwitch = allowSwitchToEmailMfa(
    c,
    authCodeBody,
  )

  return c.html(<AuthorizeOtpMfaView
    logoUrl={logoUrl}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    showEmailMfaBtn={allowSwitch}
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

  const ip = requestUtil.getRequestIP(c)
  const failedAttempts = await kvService.getFailedOtpMfaAttemptsByIP(
    c.env.KV,
    authCodeStore.user.id,
    ip,
  )
  if (failedAttempts >= 5) throw new errorConfig.Forbidden(localeConfig.Error.OtpMfaLocked)

  const { AUTHORIZATION_CODE_EXPIRES_IN: expiresIn } = env(c)

  const isValid = await kvService.stampOtpMfaCode(
    c.env.KV,
    bodyDto.code,
    bodyDto.mfaCode,
    authCodeStore.user.otpSecret,
    expiresIn,
  )

  if (!isValid) {
    await kvService.setFailedOtpMfaAttempts(
      c.env.KV,
      authCodeStore.user.id,
      ip,
      failedAttempts + 1,
    )
    throw new errorConfig.UnAuthorized(localeConfig.Error.WrongMfaCode)
  }

  if (!authCodeStore.user.otpVerified) {
    await userService.markOtpAsVerified(
      c,
      authCodeStore.user.id,
    )
  }

  return c.json(await handlePostAuthorize(
    c,
    AuthorizeStep.OtpMfa,
    bodyDto.code,
    authCodeStore,
  ))
}

export const getAuthorizeEmailMfa = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)
  await validateUtil.dto(queryDto)

  const {
    COMPANY_LOGO_URL: logoUrl,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  await handleSendEmailMfa(
    c,
    queryDto.code,
    queryDto.locale,
  )

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

  const { AUTHORIZATION_CODE_EXPIRES_IN: expiresIn } = env(c)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )

  const isFallback = allowSwitchToEmailMfa(
    c,
    authCodeStore,
  )

  const isValid = await kvService.stampEmailMfaCode(
    c.env.KV,
    bodyDto.code,
    bodyDto.mfaCode,
    expiresIn,
    isFallback,
  )

  if (!isValid) throw new errorConfig.UnAuthorized(localeConfig.Error.WrongMfaCode)

  return c.json(await handlePostAuthorize(
    c,
    AuthorizeStep.OtpEmail,
    bodyDto.code,
    authCodeStore,
  ))
}

export const postResendEmailMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeResendEmailMfaDto(reqBody)
  await validateUtil.dto(bodyDto)

  await handleSendEmailMfa(
    c,
    bodyDto.code,
    bodyDto.locale,
  )

  return c.json({ success: true })
}

const prepareSocialAuthCode = async (
  c: Context<typeConfig.Context>,
  bodyDto: identityDto.PostAuthorizeSocialSignInReqDto,
  app: appModel.Record,
  user: userModel.Record,
) => {
  const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)

  const authCode = genRandomString(128)
  const request = new oauthDto.GetAuthorizeReqDto(bodyDto)
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

  const bodyDto = new identityDto.PostAuthorizeSocialSignInReqDto({
    ...reqBody,
    scopes: reqBody.scope.split(' '),
  })
  await validateUtil.dto(bodyDto)

  const app = await appService.verifySPAClientRequest(
    c,
    bodyDto.clientId,
    bodyDto.redirectUri,
  )

  const googleUser = await jwtService.verifyGoogleCredential(bodyDto.credential)
  if (!googleUser) throw new errorConfig.NotFound(localeConfig.Error.NoUser)

  const user = await userService.processGoogleAccount(
    c,
    googleUser,
    bodyDto.locale,
  )

  const {
    authCode, authCodeBody,
  } = await prepareSocialAuthCode(
    c,
    bodyDto,
    app,
    user,
  )

  return c.json(await handlePostAuthorize(
    c,
    AuthorizeStep.Social,
    authCode,
    authCodeBody,
  ))
}

export const postAuthorizeFacebook = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeSocialSignInReqDto({
    ...reqBody,
    scopes: reqBody.scope.split(' '),
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
  if (!facebookUser) throw new errorConfig.NotFound(localeConfig.Error.NoUser)

  const user = await userService.processFacebookAccount(
    c,
    facebookUser,
    bodyDto.locale,
  )

  const {
    authCode, authCodeBody,
  } = await prepareSocialAuthCode(
    c,
    bodyDto,
    app,
    user,
  )

  return c.json(await handlePostAuthorize(
    c,
    AuthorizeStep.Social,
    authCode,
    authCodeBody,
  ))
}

export const getAuthorizeGithub = async (c: Context<typeConfig.Context>) => {
  const code = c.req.query('code')
  const state = c.req.query('state') ?? ''
  const originRequest = JSON.parse(state)

  if (!code || !state) throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)
  const bodyDto = new identityDto.PostAuthorizeSocialSignInReqDto({
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
  if (!githubUser) throw new errorConfig.NotFound(localeConfig.Error.NoUser)

  const user = await userService.processGithubAccount(
    c,
    githubUser,
    bodyDto.locale,
  )

  const {
    authCode, authCodeBody,
  } = await prepareSocialAuthCode(
    c,
    bodyDto,
    app,
    user,
  )

  const detail = await handlePostAuthorize(
    c,
    AuthorizeStep.Social,
    authCode,
    authCodeBody,
  )

  const qs = `?state=${detail.state}&code=${detail.code}&locale=${bodyDto.locale}`
  const url = detail.requireConsent
    ? `${routeConfig.InternalRoute.Identity}/authorize-consent${qs}&redirect_uri=${detail.redirectUri}`
    : `${detail.redirectUri}${qs}`
  return c.redirect(url)
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
    OTP_MFA_IS_REQUIRED: enableOtpMfa,
  } = env(c)

  const requireMfa = enableOtpMfa || user.mfaTypes.includes(userModel.MfaType.Otp)
  const updatedUser = requireMfa && !user.otpSecret
    ? await userService.genUserOtp(
      c,
      user.id,
    )
    : user

  const request = new oauthDto.GetAuthorizeReqDto(bodyDto)
  const authCode = genRandomString(128)
  const authCodeBody = {
    appId: app.id,
    appName: app.name,
    user: updatedUser,
    request,
  }
  await kvService.storeAuthCode(
    c.env.KV,
    authCode,
    authCodeBody,
    codeExpiresIn,
  )

  return c.json(await handlePostAuthorize(
    c,
    AuthorizeStep.Password,
    authCode,
    authCodeBody,
  ))
}

export const getVerifyEmail = async (c: Context<typeConfig.Context>) => {
  const queryDto = new identityDto.GetVerifyEmailReqDto({
    id: c.req.query('id') ?? '',
    locale: requestUtil.getLocaleFromQuery(
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

  if (refreshTokenBody && accessTokenBody.sub === refreshTokenBody.authId) {
    await kvService.invalidRefreshToken(
      c.env.KV,
      bodyDto.refreshToken,
    )
  }

  const { AUTH_SERVER_URL } = env(c)
  const redirectUri = `${requestUtil.stripEndingSlash(AUTH_SERVER_URL)}${routeConfig.InternalRoute.OAuth}/logout`

  return c.json({
    success: true,
    redirectUri:
      `${redirectUri}?post_logout_redirect_uri=${bodyDto.postLogoutRedirectUri}&client_id=${refreshTokenBody.clientId}`,
  })
}
