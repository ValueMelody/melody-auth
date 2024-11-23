import { Context } from 'hono'
import { env } from 'hono/adapter'
import { typeConfig } from 'configs'
import {
  consentService, sessionService,
} from 'services'
import { AuthCodeBody } from 'configs/type'
import { userModel } from 'models'
import { Policy } from 'dtos/oauth'
import { IdentityRoute } from 'configs/route'

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
  ChangeEmail = 6,
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

  const isSocialLogin = !!authCodeBody.user.socialAccountId

  const {
    EMAIL_MFA_IS_REQUIRED: enableEmailMfa,
    OTP_MFA_IS_REQUIRED: enableOtpMfa,
    SMS_MFA_IS_REQUIRED: enableSmsMfa,
    ENFORCE_ONE_MFA_ENROLLMENT: enforceMfa,
    ENABLE_PASSWORD_RESET: enablePasswordReset,
    ENABLE_EMAIL_VERIFICATION: enableEmailVerification,
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

  const requireChangePassword =
    step < 6 &&
    !isSocialLogin &&
    enablePasswordReset &&
    authCodeBody.request.policy === Policy.ChangePassword
  if (requireChangePassword) {
    return {
      ...basicInfo, nextPage: IdentityRoute.ChangePassword,
    }
  }

  const requireChangeEmail =
    step < 6 &&
    !isSocialLogin &&
    enableEmailVerification &&
    authCodeBody.request.policy === Policy.ChangeEmail
  if (requireChangeEmail) {
    return {
      ...basicInfo, nextPage: IdentityRoute.ChangeEmail,
    }
  }

  sessionService.setAuthInfoSession(
    c,
    authCodeBody.appId,
    authCodeBody.appName,
    authCodeBody.user,
    authCodeBody.request,
  )

  return {
    code: authCode,
    redirectUri: authCodeBody.request.redirectUri,
    state: authCodeBody.request.state,
    scopes: authCodeBody.request.scopes,
    nextPage: undefined,
  }
}
