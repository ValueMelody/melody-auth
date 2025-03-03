export enum InternalRoute {
  OAuth = '/oauth2/v1',
  Identity = '/identity/v1',
  ApiUsers = '/api/v1/users',
  ApiApps = '/api/v1/apps',
  ApiRoles = '/api/v1/roles',
  ApiScopes = '/api/v1/scopes',
  ApiOrgs = '/api/v1/orgs',
  ApiLogs = '/api/v1/logs',
}

export enum OauthRoute {
  Authorize = `${InternalRoute.OAuth}/authorize`,
  Token = `${InternalRoute.OAuth}/token`,
  Userinfo = `${InternalRoute.OAuth}/userinfo`,
  Revoke = `${InternalRoute.OAuth}/revoke`,
  Logout = `${InternalRoute.OAuth}/logout`,
}

export enum IdentityRoute {
  ProcessView = `${InternalRoute.Identity}/view/process`,
  AuthorizeConsentInfo = `${InternalRoute.Identity}/consent-info`,
  AuthorizeOtpSetupInfo = `${InternalRoute.Identity}/otp-setup-info`,
  AuthorizeOtpMfaInfo = `${InternalRoute.Identity}/otp-mfa-info`,
  AuthorizeSmsMfaInfo = `${InternalRoute.Identity}/sms-mfa-info`,
  AuthorizePasskeyEnrollInfo = `${InternalRoute.Identity}/passkey-enroll-info`,
  AuthCodeExpired = `${InternalRoute.Identity}/auth-code-expired`,
  AuthorizeOtpSetup = `${InternalRoute.Identity}/authorize-otp-setup`,
  AuthorizeOtpMfa = `${InternalRoute.Identity}/authorize-otp-mfa`,
  AuthorizeSmsMfa = `${InternalRoute.Identity}/authorize-sms-mfa`,
  AuthorizePasskeyEnroll = `${InternalRoute.Identity}/authorize-passkey-enroll`,
  AuthorizePasskeyEnrollDecline = `${InternalRoute.Identity}/authorize-passkey-enroll-decline`,
  AuthorizePasskeyVerify = `${InternalRoute.Identity}/authorize-passkey-verify`,
  ResendSmsMfa = `${InternalRoute.Identity}/resend-sms-mfa`,
  SetupSmsMfa = `${InternalRoute.Identity}/setup-sms-mfa`,
  AuthorizeEmailMfa = `${InternalRoute.Identity}/authorize-email-mfa`,
  ResendEmailMfa = `${InternalRoute.Identity}/resend-email-mfa`,
  AuthorizeConsent = `${InternalRoute.Identity}/authorize-consent`,
  Logout = `${InternalRoute.Identity}/logout`,
  AuthorizeView = `${InternalRoute.Identity}/view/authorize`,
  AuthorizePassword = `${InternalRoute.Identity}/authorize-password`,
  AuthorizeAccount = `${InternalRoute.Identity}/authorize-account`,
  // Authorize Social-signin
  AuthorizeGoogle = `${InternalRoute.Identity}/authorize-google`,
  AuthorizeFacebook = `${InternalRoute.Identity}/authorize-facebook`,
  AuthorizeGitHub = `${InternalRoute.Identity}/authorize-github`,
  // Process MFA
  ProcessMfaEnroll = `${InternalRoute.Identity}/process-mfa-enroll`,
  // Policy
  ChangePassword = `${InternalRoute.Identity}/change-password`,
  ChangeEmailCode = `${InternalRoute.Identity}/change-email-code`,
  ChangeEmail = `${InternalRoute.Identity}/change-email`,
  ResetMfa = `${InternalRoute.Identity}/reset-mfa`,
  ManagePasskey = `${InternalRoute.Identity}/manage-passkey`,
  UpdateInfo = `${InternalRoute.Identity}/update-info`,
  // Other
  VerifyEmailView = `${InternalRoute.Identity}/view/verify-email`,
  VerifyEmail = `${InternalRoute.Identity}/verify-email`,
  ResetPasswordCode = `${InternalRoute.Identity}/reset-password-code`,
  ResetPassword = `${InternalRoute.Identity}/reset-password`,
  AuthCodeExpiredView = `${InternalRoute.Identity}/view/auth-code-expired`,
}
