import { Context } from 'hono'
import { env } from 'hono/adapter'
import { typeConfig } from 'configs'
import {
  consentService, sessionService,
} from 'services'
import { AuthCodeBody } from 'configs/type'
import { userModel } from 'models'

export enum AuthorizeStep {
  Account = 0,
  Password = 0,
  Social = 0,
  Consent = 1,
  MfaEnroll = 2,
  OtpMfa = 3,
  OtpEmail = 4,
}

export const processPostAuthorize = async (
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
