import { Context } from 'hono'
import { env } from 'hono/adapter'
import { typeConfig } from 'configs'
import {
  consentService, sessionService,
} from 'services'
import { AuthCodeBody } from 'configs/type'
import { userModel } from 'models'
import { Policy } from 'dtos/oauth'

export enum AuthorizeStep {
  Account = 0,
  Password = 0,
  Social = 0,
  Consent = 1,
  MfaEnroll = 2,
  OtpMfa = 3,
  SmsMfa = 4,
  EmailMfa = 5,
  ChangePassword = 6,
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
  const isChangePasswordPolicy = authCodeBody.request.policy === Policy.ChangePassword

  const {
    EMAIL_MFA_IS_REQUIRED: enableEmailMfa,
    OTP_MFA_IS_REQUIRED: enableOtpMfa,
    SMS_MFA_IS_REQUIRED: enableSmsMfa,
    ENFORCE_ONE_MFA_ENROLLMENT: enforceMfa,
    ENABLE_PASSWORD_RESET: enablePasswordReset,
  } = env(c)

  const requireMfaEnroll =
    step < 2 &&
    !isSocialLogin &&
    !!enforceMfa?.length &&
    !enableEmailMfa &&
    !enableOtpMfa &&
    !enableSmsMfa &&
    !authCodeBody.user.mfaTypes.length

  const requireOtpMfa =
    step < 3 &&
    !isSocialLogin &&
    (enableOtpMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Otp))
  const requireOtpSetup = requireOtpMfa && !authCodeBody.user.otpVerified

  const requireSmsMfa =
    step < 4 &&
    !isSocialLogin &&
    (enableSmsMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Sms))

  const requireEmailMfa =
    step < 5 &&
    !isSocialLogin &&
    (enableEmailMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Email))

  const requireChangePassword =
    step < 6 &&
    !isSocialLogin &&
    enablePasswordReset &&
    isChangePasswordPolicy

  if (
    !isChangePasswordPolicy && !requireConsent && !requireMfaEnroll &&
    !requireOtpMfa && !requireEmailMfa && !requireSmsMfa
  ) {
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
    requireSmsMfa,
    requireOtpSetup,
    requireOtpMfa,
    requireChangePassword,
  }
}
