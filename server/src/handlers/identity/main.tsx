import {
  Context, TypedResponse,
} from 'hono'
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
  appService, consentService, emailService, identityService, kvService, scopeService, userService,
} from 'services'
import {
  requestUtil, validateUtil,
} from 'utils'
import {
  scopeModel, userModel,
} from 'models'

export const postAuthorizePassword = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeReqWithPasswordDto({
    ...reqBody,
    scopes: reqBody.scope ? reqBody.scope.split(' ') : [],
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

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.Password,
    authCode,
    authCodeBody,
  ))
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

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.Account,
    authCode,
    authCodeBody,
  ))
}

export interface GetAppConsentRes {
  scopes: scopeModel.ApiRecord[];
  appName: string;
}
export const getAppConsent = async (c: Context<typeConfig.Context>):
Promise<TypedResponse<GetAppConsentRes>> => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authInfo) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

  const app = await appService.verifySPAClientRequest(
    c,
    authInfo.request.clientId,
    authInfo.request.redirectUri,
  )

  const scopes = await scopeService.getScopesByName(
    c,
    authInfo.request.scopes,
  )

  return c.json({
    scopes,
    appName: app.name,
  })
}

export const postAppConsent = async (c: Context<typeConfig.Context>) => {
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

  return c.json(await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.Consent,
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
