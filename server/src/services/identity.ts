import { Context } from 'hono'
import { env } from 'hono/adapter'
import { typeConfig } from 'configs'
import {
  consentService, passkeyService, sessionService,
} from 'services'
import { AuthCodeBody } from 'configs/type'
import { userModel } from 'models'
import { Policy } from 'dtos/oauth'
import { IdentityRoute } from 'configs/route'

export enum AuthorizeStep {
  Account = 0,
  Password = 0,
  Social = 0,
  PasskeyVerify = 0,
  Consent = 1,
  MfaEnroll = 2,
  OtpMfa = 3,
  SmsMfa = 4,
  EmailMfa = 5,
  PasskeyEnroll = 6,
  ChangePassword = 7,
  ChangeEmail = 7,
}

const getNextPageForPolicy = (
  c: Context<typeConfig.Context>, authCodeBody: AuthCodeBody, isSocialLogin: boolean,
) => {
  let nextPage
  if (!isSocialLogin) {
    const {
      ENABLE_PASSWORD_RESET: enablePasswordReset,
      ENABLE_EMAIL_VERIFICATION: enableEmailVerification,
      ALLOW_PASSKEY_ENROLLMENT: enablePasskeyEnrollment,
    } = env(c)

    switch (authCodeBody.request.policy) {
    case Policy.ChangePassword: {
      if (enablePasswordReset) nextPage = IdentityRoute.ChangePassword
      break
    }
    case Policy.ChangeEmail: {
      if (enableEmailVerification) nextPage = IdentityRoute.ChangeEmail
      break
    }
    case Policy.ResetMfa: {
      nextPage = IdentityRoute.ResetMfa
      break
    }
    case Policy.ManagePasskey: {
      if (enablePasskeyEnrollment) nextPage = IdentityRoute.ManagePasskey
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
  authCodeBody: AuthCodeBody,
) => {
  const basicInfo = {
    code: authCode,
    redirectUri: authCodeBody.request.redirectUri,
    state: authCodeBody.request.state,
    scopes: authCodeBody.request.scopes,
  }

  const requireConsent = step < 1 && await consentService.shouldCollectConsent(
    c,
    authCodeBody.user.id,
    authCodeBody.appId,
  )
  if (requireConsent) {
    return {
      ...basicInfo, nextPage: IdentityRoute.AuthorizeConsent,
    }
  }

  const authorizedResult = {
    code: authCode,
    redirectUri: authCodeBody.request.redirectUri,
    state: authCodeBody.request.state,
    scopes: authCodeBody.request.scopes,
    nextPage: undefined,
  }

  const isSocialLogin = !!authCodeBody.user.socialAccountId

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

  const {
    EMAIL_MFA_IS_REQUIRED: enableEmailMfa,
    OTP_MFA_IS_REQUIRED: enableOtpMfa,
    SMS_MFA_IS_REQUIRED: enableSmsMfa,
    ENFORCE_ONE_MFA_ENROLLMENT: enforceMfa,
    ALLOW_PASSKEY_ENROLLMENT: enablePasskeyEnrollment,
  } = env(c)

  const requireMfaEnroll =
    step < 2 &&
    !isSocialLogin &&
    !!enforceMfa?.length &&
    !enableEmailMfa &&
    !enableOtpMfa &&
    !enableSmsMfa &&
    !authCodeBody.user.mfaTypes.length
  if (requireMfaEnroll) {
    return {
      ...basicInfo, nextPage: IdentityRoute.AuthorizeMfaEnroll,
    }
  }

  const requireOtpMfa =
    step < 3 &&
    !isSocialLogin &&
    (enableOtpMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Otp))
  const requireOtpSetup = requireOtpMfa && !authCodeBody.user.otpVerified
  if (requireOtpSetup) {
    return {
      ...basicInfo, nextPage: IdentityRoute.AuthorizeOtpSetup,
    }
  }
  if (requireOtpMfa) {
    return {
      ...basicInfo, nextPage: IdentityRoute.AuthorizeOtpMfa,
    }
  }

  const requireSmsMfa =
    step < 4 &&
    !isSocialLogin &&
    (enableSmsMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Sms))
  if (requireSmsMfa) {
    return {
      ...basicInfo, nextPage: IdentityRoute.AuthorizeSmsMfa,
    }
  }

  const requireEmailMfa =
    step < 5 &&
    !isSocialLogin &&
    (enableEmailMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Email))
  if (requireEmailMfa) {
    return {
      ...basicInfo, nextPage: IdentityRoute.AuthorizeEmailMfa,
    }
  }

  const requirePasskeyEnroll =
    step < 6 &&
    !isSocialLogin &&
    enablePasskeyEnrollment
  if (requirePasskeyEnroll && !authCodeBody.user.skipPasskeyEnroll) {
    const passkey = await passkeyService.getPasskeyByUser(
      c,
      authCodeBody.user.id,
    )
    if (!passkey) {
      return {
        ...basicInfo, nextPage: IdentityRoute.AuthorizePasskeyEnroll,
      }
    }
  }

  if (step < 7) {
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
