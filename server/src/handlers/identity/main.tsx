import { Context } from 'hono'
import { env } from 'hono/adapter'
import { genRandomString } from 'shared'
import {
  typeConfig, routeConfig,
  errorConfig,
  localeConfig,
} from 'configs'
import {
  identityDto, oauthDto,
} from 'dtos'
import {
  appService, brandingService, consentService, emailService, kvService, scopeService, userService,
} from 'services'
import {
  identityUtil,
  requestUtil, validateUtil,
} from 'utils'
import {
  AuthorizePasswordView, AuthorizeConsentView, AuthorizeAccountView,
} from 'views'
import { userModel } from 'models'
import { oauthHandler } from 'handlers'
import { Policy } from 'dtos/oauth'

export const getAuthorizePassword = async (c: Context<typeConfig.Context>) => {
  const queryDto = await oauthHandler.parseGetAuthorizeDto(c)

  const {
    ENABLE_SIGN_UP: allowSignUp,
    ENABLE_PASSWORD_RESET: allowPasswordReset,
    ENABLE_PASSWORD_SIGN_IN: allowPasswordSignIn,
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
    GOOGLE_AUTH_CLIENT_ID: googleAuthId,
    FACEBOOK_AUTH_CLIENT_ID: facebookAuthId,
    FACEBOOK_AUTH_CLIENT_SECRET: facebookClientSecret,
    GITHUB_AUTH_CLIENT_ID: githubAuthId,
    GITHUB_AUTH_CLIENT_SECRET: githubClientSecret,
    GITHUB_AUTH_APP_NAME: githubAppName,
  } = env(c)

  const isBasePolicy = !queryDto.policy || queryDto.policy === Policy.SignInOrSignUp
  const enablePasswordReset = isBasePolicy ? allowPasswordReset : false
  const enableSignUp = isBasePolicy ? allowSignUp : false
  const enablePasswordSignIn = isBasePolicy ? allowPasswordSignIn : true
  const googleClientId = isBasePolicy ? googleAuthId : ''
  const facebookClientId = isBasePolicy ? facebookAuthId : ''
  const githubClientId = isBasePolicy ? githubAuthId : ''

  const queryString = requestUtil.getQueryString(c)

  return c.html(<AuthorizePasswordView
    queryString={queryString}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    queryDto={queryDto}
    branding={await brandingService.getBranding(
      c,
      queryDto.org,
    )}
    enableSignUp={enableSignUp}
    enablePasswordReset={enablePasswordReset}
    enablePasswordSignIn={enablePasswordSignIn}
    googleClientId={googleClientId}
    facebookClientId={facebookClientId && facebookClientSecret ? facebookClientId : ''}
    githubClientId={githubClientId && githubClientSecret && githubAppName ? githubClientId : ''}
  />)
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

  return c.json(await identityUtil.processPostAuthorize(
    c,
    identityUtil.AuthorizeStep.Password,
    authCode,
    authCodeBody,
  ))
}

export const getAuthorizeAccount = async (c: Context<typeConfig.Context>) => {
  const queryDto = await oauthHandler.parseGetAuthorizeDto(c)

  const {
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
    branding={await brandingService.getBranding(
      c,
      queryDto.org,
    )}
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

  return c.json(await identityUtil.processPostAuthorize(
    c,
    identityUtil.AuthorizeStep.Account,
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
  if (!authInfo) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)

  const app = await appService.verifySPAClientRequest(
    c,
    authInfo.request.clientId,
    authInfo.request.redirectUri,
  )

  const scopes = await scopeService.getScopesByName(
    c,
    authInfo.request.scopes,
  )

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  return c.html(<AuthorizeConsentView
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    branding={await brandingService.getBranding(
      c,
      queryDto.org,
    )}
    scopes={scopes}
    appName={app.name}
    redirectUri={authInfo.request.redirectUri}
    queryDto={queryDto}
  />)
}

export const postAuthorizeConsent = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeFollowUpReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeBody) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

  await consentService.createUserAppConsent(
    c,
    authCodeBody.user.id,
    authCodeBody.appId,
  )

  return c.json(await identityUtil.processPostAuthorize(
    c,
    identityUtil.AuthorizeStep.Consent,
    bodyDto.code,
    authCodeBody,
  ))
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
  const redirectUri = `${requestUtil.stripEndingSlash(AUTH_SERVER_URL)}${routeConfig.OauthRoute.Logout}`

  return c.json({
    success: true,
    redirectUri:
      `${redirectUri}?post_logout_redirect_uri=${bodyDto.postLogoutRedirectUri}&client_id=${refreshTokenBody.clientId}`,
  })
}
