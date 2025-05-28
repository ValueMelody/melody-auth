import {
  Context, TypedResponse,
} from 'hono'
import { env } from 'hono/adapter'
import { genRandomString } from '@melody-auth/shared'
import {
  typeConfig,
  routeConfig,
  errorConfig,
  messageConfig,
} from 'configs'
import {
  identityDto, oauthDto,
} from 'dtos'
import {
  appService, consentService, emailService,
  identityService, kvService, mfaService, userAttributeService, userService,
} from 'services'
import {
  requestUtil, validateUtil, loggerUtil,
} from 'utils'
import {
  scopeModel, userAttributeModel,
} from 'models'
import {
  signUpHook, signInHook,
} from 'hooks'

export const postAuthorizePassword = async (c: Context<typeConfig.Context>) => {
  await signInHook.preSignIn()

  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeWithPasswordDto({
    ...reqBody,
    scopes: reqBody.scope ? reqBody.scope.split(' ') : [],
  })
  await validateUtil.dto(bodyDto)

  const user = await userService.verifyPasswordSignIn(
    c,
    bodyDto,
  )

  const {
    authCode, authCodeBody,
  } = await identityService.processSignIn(
    c,
    bodyDto,
    user,
  )

  const result = await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.Password,
    authCode,
    authCodeBody,
  )

  await signInHook.postSignIn()

  return c.json(result)
}

export interface GetAuthorizeAccountRes {
  userAttributes: userAttributeModel.Record[];
}
export const getAuthorizeAccount = async (c: Context<typeConfig.Context>):
  Promise<TypedResponse<GetAuthorizeAccountRes>> => {
  const { ENABLE_USER_ATTRIBUTE: enableUserAttribute } = env(c)

  const userAttributes = enableUserAttribute
    ? await userAttributeService.getUserSignUpAttributes(c)
    : []

  return c.json({ userAttributes })
}

export const postAuthorizeAccount = async (c: Context<typeConfig.Context>) => {
  await signUpHook.preSignUp()

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
    ? new identityDto.PostAuthorizeWithRequiredNamesDto(parsedBody)
    : new identityDto.PostAuthorizeWithNamesDto(parsedBody)
  await validateUtil.dto(bodyDto)

  const app = await appService.verifySPAClientRequest(
    c,
    bodyDto.clientId,
    bodyDto.redirectUri,
  )

  const attributeValues = await userAttributeService.getUserSignUpAttributeValues(
    c,
    reqBody,
  )

  const user = await userService.createAccountWithPassword(
    c,
    bodyDto,
    attributeValues,
  )

  if (enableEmailVerification) {
    const verificationCode = await emailService.sendEmailVerification(
      c,
      bodyDto.email,
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

  const result = await identityService.processPostAuthorize(
    c,
    identityService.AuthorizeStep.Account,
    authCode,
    authCodeBody,
  )

  await signUpHook.postSignUp()

  return c.json(result)
}

export interface GetAppConsentRes {
  scopes: scopeModel.ApiRecord[];
  appName: string;
}
export const getAppConsent = async (c: Context<typeConfig.Context>):
Promise<TypedResponse<GetAppConsentRes>> => {
  const queryDto = await identityDto.parseGetProcess(c)

  const authInfo = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authInfo) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }

  const result = await identityService.processGetAppConsent(
    c,
    authInfo.request,
  )

  return c.json(result)
}

export const postAppConsent = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostProcessDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeBody) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongAuthCode,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongAuthCode)
  }

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

  const bodyDto = new identityDto.PostLogoutDto({
    refreshToken: String(reqBody.refresh_token),
    postLogoutRedirectUri: reqBody.post_logout_redirect_uri
      ? String(reqBody.post_logout_redirect_uri)
      : '',
  })
  await validateUtil.dto(bodyDto)

  const accessTokenBody = c.get('access_token_body')!
  const refreshTokenBody = await kvService.getRefreshTokenBody(
    c,
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
