import {
  Context, Next,
} from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import { Policy } from 'dtos/oauth'
import { loggerUtil } from 'utils'
import { systemConfig } from 'configs/variable'

export const enableSignUp = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    ENABLE_SIGN_UP: enableSignUp,
    ENABLE_PASSWORDLESS_SIGN_IN: enablePasswordlessSignIn,
  } = env(c)

  if (!enableSignUp || enablePasswordlessSignIn) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.SignUpNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.SignUpNotEnabled)
  }

  await next()
}

export const enablePasswordSignIn = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    ENABLE_PASSWORD_SIGN_IN: enableSignIn,
    ENABLE_PASSWORDLESS_SIGN_IN: enablePasswordlessSignIn,
  } = env(c)

  if (!enableSignIn || enablePasswordlessSignIn) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.PasswordSignInNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.PasswordSignInNotEnabled)
  }

  await next()
}

export const enableAppConsent = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { ENABLE_USER_APP_CONSENT: enabledAppConsent } = env(c)
  if (!enabledAppConsent) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.AppConsentNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.AppConsentNotEnabled)
  }

  await next()
}

export const enablePasswordReset = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    ENABLE_PASSWORD_RESET: enabledReset,
    ENABLE_PASSWORDLESS_SIGN_IN: enablePasswordlessSignIn,
  } = env(c)

  if (!enabledReset || enablePasswordlessSignIn) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.PasswordResetNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.PasswordResetNotEnabled)
  }

  await next()
}

export const enablePasswordlessSignIn = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { ENABLE_PASSWORDLESS_SIGN_IN: enabledPasswordless } = env(c)

  if (!enabledPasswordless) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.PasswordlessSignInNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.PasswordlessSignInNotEnabled)
  }

  await next()
}

export const enableUserAttribute = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { ENABLE_USER_ATTRIBUTE: enabledUserAttribute } = env(c)

  if (!enabledUserAttribute) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.UserAttributeNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.UserAttributeNotEnabled)
  }

  await next()
}

export const enableOrg = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { ENABLE_ORG: enabledOrg } = env(c)

  if (!enabledOrg) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.OrgNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.OrgNotEnabled)
  }

  await next()
}

export const enableOrgGroup = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { ENABLE_ORG: enabledOrg } = env(c)

  if (!enabledOrg) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.OrgNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.OrgNotEnabled)
  }

  if (!systemConfig.enableOrgGroup) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.OrgGroupNotEnabled,
    )
  }

  await next()
}

export const enableAppBanner = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { ENABLE_APP_BANNER: enabledAppBanner } = env(c)

  if (!enabledAppBanner) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.AppBannerNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.AppBannerNotEnabled)
  }

  await next()
}

export const enableSamlAsSp = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { ENABLE_SAML_SSO_AS_SP: enabledSamlSp } = env(c)
  if (!enabledSamlSp) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.SamlSpNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.SamlSpNotEnabled)
  }
  await next()
}

export const enablePasskeyEnrollment = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    ALLOW_PASSKEY_ENROLLMENT: enabledPasskeyEnrollment,
    ENABLE_PASSWORDLESS_SIGN_IN: enablePasswordlessSignIn,
  } = env(c)
  if (!enabledPasskeyEnrollment || enablePasswordlessSignIn) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.PasskeyEnrollmentNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.PasskeyEnrollmentNotEnabled)
  }
  await next()
}

export const enableRecoveryCode = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    ENABLE_RECOVERY_CODE: enabledRecoveryCode,
    ENABLE_PASSWORDLESS_SIGN_IN: enablePasswordlessSignIn,
  } = env(c)
  if (!enabledRecoveryCode || enablePasswordlessSignIn) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.RecoveryCodeNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.RecoveryCodeNotEnabled)
  }
  await next()
}

export const enableGoogleSignIn = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { GOOGLE_AUTH_CLIENT_ID: googleId } = env(c)
  if (!googleId) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.GoogleSignInNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.GoogleSignInNotEnabled)
  }
  await next()
}

export const enableFacebookSignIn = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    FACEBOOK_AUTH_CLIENT_ID: facebookId, FACEBOOK_AUTH_CLIENT_SECRET: facebookSecret,
  } = env(c)
  if (!facebookId || !facebookSecret) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.FacebookSignInNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.FacebookSignInNotEnabled)
  }
  await next()
}

export const enableGithubSignIn = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    GITHUB_AUTH_CLIENT_ID: githubId,
    GITHUB_AUTH_CLIENT_SECRET: githubSecret,
    GITHUB_AUTH_APP_NAME: githubAppName,
  } = env(c)
  if (!githubId || !githubSecret || !githubAppName) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.GithubSignInNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.GithubSignInNotEnabled)
  }
  await next()
}

export const enableDiscordSignIn = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    DISCORD_AUTH_CLIENT_ID: discordId,
    DISCORD_AUTH_CLIENT_SECRET: discordSecret,
  } = env(c)
  if (!discordId || !discordSecret) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.DiscordSignInNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.DiscordSignInNotEnabled)
  }
  await next()
}

export const enableAppleSignIn = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    APPLE_AUTH_CLIENT_ID: appleId,
    APPLE_AUTH_CLIENT_SECRET: appleSecret,
  } = env(c)
  if (!appleId || !appleSecret) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.AppleSignInNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.AppleSignInNotEnabled)
  }
  await next()
}

export const enableOidcSignIn = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { OIDC_AUTH_PROVIDERS: oidcProviders } = env(c)
  if (!oidcProviders || !oidcProviders.length) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.OidcProviderNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.OidcProviderNotEnabled)
  }
  await next()
}

export const enableEmailVerification = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { ENABLE_EMAIL_VERIFICATION: enableEmailVerification } = env(c)

  if (!enableEmailVerification) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.EmailVerificationNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.EmailVerificationNotEnabled)
  }

  await next()
}

export const enableMfaEnroll = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    ENFORCE_ONE_MFA_ENROLLMENT: enforceMfa,
    SMS_MFA_IS_REQUIRED: requireSmsMfa,
    EMAIL_MFA_IS_REQUIRED: requireEmailMfa,
    OTP_MFA_IS_REQUIRED: requireOtpMfa,
  } = env(c)

  if (!enforceMfa?.length || requireEmailMfa || requireOtpMfa || requireSmsMfa) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.MfaEnrollNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.MfaEnrollNotEnabled)
  }

  await next()
}

export const enableSwitchOrg = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { ALLOW_USER_SWITCH_ORG_ON_SIGN_IN: enableSwitchOrg } = env(c)
  if (!enableSwitchOrg) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.SwitchOrgNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.SwitchOrgNotEnabled)
  }
  await next()
}

export const enableChangePasswordPolicy = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    BLOCKED_POLICIES: blockedPolicies, ENABLE_PASSWORD_RESET: enablePasswordReset,
  } = env(c)
  if (!enablePasswordReset || blockedPolicies.includes(Policy.ChangePassword)) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.ChangePasswordPolicyNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.ChangePasswordPolicyNotEnabled)
  }
  await next()
}

export const enableChangeEmailPolicy = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    BLOCKED_POLICIES: blockedPolicies, ENABLE_EMAIL_VERIFICATION: enableEmailVerification,
  } = env(c)
  if (!enableEmailVerification || blockedPolicies.includes(Policy.ChangeEmail)) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.ChangeEmailPolicyNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.ChangeEmailPolicyNotEnabled)
  }
  await next()
}

export const enableResetMfaPolicy = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { BLOCKED_POLICIES: blockedPolicies } = env(c)
  if (blockedPolicies.includes(Policy.ResetMfa)) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.ResetMfaPolicyNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.ResetMfaPolicyNotEnabled)
  }
  await next()
}

export const enableManagePasskeyPolicy = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    BLOCKED_POLICIES: blockedPolicies, ALLOW_PASSKEY_ENROLLMENT: allowPasskeyEnrollment,
  } = env(c)
  if (!allowPasskeyEnrollment || blockedPolicies.includes(Policy.ManagePasskey)) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.ManagePasskeyPolicyNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.ManagePasskeyPolicyNotEnabled)
  }
  await next()
}

export const enableManageRecoveryCodePolicy = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    BLOCKED_POLICIES: blockedPolicies, ENABLE_RECOVERY_CODE: enableRecoveryCode,
  } = env(c)
  if (!enableRecoveryCode || blockedPolicies.includes(Policy.ManageRecoveryCode)) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.ManageRecoveryCodePolicyNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.ManageRecoveryCodePolicyNotEnabled)
  }
  await next()
}

export const enableUpdateInfoPolicy = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    BLOCKED_POLICIES: blockedPolicies, ENABLE_NAMES: enableNames,
  } = env(c)
  if (!enableNames || blockedPolicies.includes(Policy.UpdateInfo)) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.UpdateInfoPolicyNotEnabled,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.UpdateInfoPolicyNotEnabled)
  }
  await next()
}
