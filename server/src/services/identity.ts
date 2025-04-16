import { Context } from 'hono'
import { env } from 'hono/adapter'
import { genRandomString } from '@melody-auth/shared'
import {
  routeConfig, typeConfig,
} from 'configs'
import {
  consentService, passkeyService, sessionService, appService, kvService,
} from 'services'
import { userModel } from 'models'
import { oauthDto } from 'dtos'

export enum AuthorizeStep {
  Account = 0,
  Password = 0,
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
    EMAIL_MFA_IS_REQUIRED: enableEmailMfa,
    ENABLE_PASSWORDLESS_SIGN_IN: enablePasswordlessSignIn,
    OTP_MFA_IS_REQUIRED: enableOtpMfa,
    SMS_MFA_IS_REQUIRED: enableSmsMfa,
    ENFORCE_ONE_MFA_ENROLLMENT: enforceMfa,
    ALLOW_PASSKEY_ENROLLMENT: enablePasskeyEnrollment,
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
    return {
      ...basicInfo, nextPage: routeConfig.View.OtpMfa,
    }
  }

  const requireSmsMfa =
    step < 5 &&
    !isSocialLogin &&
    (enableSmsMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Sms))
  if (requireSmsMfa) {
    return {
      ...basicInfo, nextPage: routeConfig.View.SmsMfa,
    }
  }

  const requireEmailMfa =
    step < 6 &&
    !isSocialLogin &&
    (enableEmailMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Email))
  if (requireEmailMfa) {
    return {
      ...basicInfo, nextPage: routeConfig.View.EmailMfa,
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

  if (step < 8) {
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

  const request = new oauthDto.GetAuthorizeDto(bodyDto)
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

  return {
    authCode,
    authCodeBody,
  }
}
