import { Context } from 'hono'
import { env } from 'hono/adapter'
import { typeConfig } from 'configs'
import { appModel } from 'models'

export interface MfaConfig {
  requireEmailMfa: boolean;
  requireOtpMfa: boolean;
  requireSmsMfa: boolean;
  enforceOneMfaEnrollment: string[];
  allowEmailMfaAsBackup: boolean;
}

const getSystemMfaConfig = (c: Context<typeConfig.Context>): MfaConfig => {
  const {
    EMAIL_MFA_IS_REQUIRED: requireEmailMfa,
    OTP_MFA_IS_REQUIRED: requireOtpMfa,
    SMS_MFA_IS_REQUIRED: requireSmsMfa,
    ENFORCE_ONE_MFA_ENROLLMENT: enforceOneMfaEnrollment,
    ALLOW_EMAIL_MFA_AS_BACKUP: allowEmailMfaAsBackup,
  } = env(c)

  return {
    requireEmailMfa,
    requireOtpMfa,
    requireSmsMfa,
    enforceOneMfaEnrollment,
    allowEmailMfaAsBackup,
  }
}

export const getAppMfaConfig = (app: appModel.Record): MfaConfig | null => {
  if (!app.useSystemMfaConfig) {
    return {
      requireEmailMfa: app.requireEmailMfa,
      requireOtpMfa: app.requireOtpMfa,
      requireSmsMfa: app.requireSmsMfa,
      allowEmailMfaAsBackup: app.allowEmailMfaAsBackup,
      enforceOneMfaEnrollment: [],
    }
  }

  return null
}

export const getAuthCodeBodyMfaConfig = (mfaConfig: MfaConfig): typeConfig.AuthCodeBodyMfaConfig => {
  return {
    e: mfaConfig.requireEmailMfa,
    o: mfaConfig.requireOtpMfa,
    s: mfaConfig.requireSmsMfa,
    b: mfaConfig.allowEmailMfaAsBackup,
  }
}

export const getAuthorizeMfaConfig = (
  c: Context<typeConfig.Context>,
  authCodeBody: typeConfig.AuthCodeBody,
): MfaConfig => {
  if (authCodeBody.mfa) {
    return {
      requireEmailMfa: authCodeBody.mfa.e,
      requireOtpMfa: authCodeBody.mfa.o,
      requireSmsMfa: authCodeBody.mfa.s,
      allowEmailMfaAsBackup: authCodeBody.mfa.b,
      enforceOneMfaEnrollment: [],
    }
  }

  return getSystemMfaConfig(c)
}
