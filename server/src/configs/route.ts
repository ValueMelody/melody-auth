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
  // Identity View
  ProcessView = `${InternalRoute.Identity}/view/process`,
  AuthorizeView = `${InternalRoute.Identity}/view/authorize`,
  // Identity Main
  AuthorizePassword = `${InternalRoute.Identity}/authorize-password`,
  AuthorizeAccount = `${InternalRoute.Identity}/authorize-account`,
  AppConsent = `${InternalRoute.Identity}/app-consent`,
  Logout = `${InternalRoute.Identity}/logout`,
  // Authorize Social-signin
  AuthorizeGoogle = `${InternalRoute.Identity}/authorize-google`,
  AuthorizeFacebook = `${InternalRoute.Identity}/authorize-facebook`,
  AuthorizeGitHub = `${InternalRoute.Identity}/authorize-github`,
  // Process MFA
  ProcessMfaEnroll = `${InternalRoute.Identity}/process-mfa-enroll`,
  SendEmailMfa = `${InternalRoute.Identity}/send-email-mfa`,
  ProcessEmailMfa = `${InternalRoute.Identity}/process-email-mfa`,
  ResendSmsMfa = `${InternalRoute.Identity}/resend-sms-mfa`,
  SetupSmsMfa = `${InternalRoute.Identity}/setup-sms-mfa`,
  ProcessSmsMfa = `${InternalRoute.Identity}/process-sms-mfa`,
  OtpMfaSetup = `${InternalRoute.Identity}/otp-mfa-setup`,
  ProcessOtpMfa = `${InternalRoute.Identity}/process-otp-mfa`,
  // Process Passkey
  ProcessPasskeyEnroll = `${InternalRoute.Identity}/process-passkey-enroll`,
  ProcessPasskeyEnrollDecline = `${InternalRoute.Identity}/process-passkey-enroll-decline`,
  AuthorizePasskeyVerify = `${InternalRoute.Identity}/authorize-passkey-verify`,
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
