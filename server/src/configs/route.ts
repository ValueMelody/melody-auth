export enum InternalRoute {
  OAuth = '/oauth2/v1',
  Identity = '/identity/v1',
  ApiUsers = '/api/v1/users',
  ApiApps = '/api/v1/apps',
  ApiRoles = '/api/v1/roles',
  ApiScopes = '/api/v1/scopes',
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
  AuthCodeExpired = `${InternalRoute.Identity}/auth-code-expired`,
  AuthorizePassword = `${InternalRoute.Identity}/authorize-password`,
  AuthorizeAccount = `${InternalRoute.Identity}/authorize-account`,
  AuthorizeMfaEnroll = `${InternalRoute.Identity}/authorize-mfa-enroll`,
  AuthorizeOtpSetup = `${InternalRoute.Identity}/authorize-otp-setup`,
  AuthorizeOtpMfa = `${InternalRoute.Identity}/authorize-otp-mfa`,
  AuthorizeSmsMfa = `${InternalRoute.Identity}/authorize-sms-mfa`,
  ResendSmsMfa = `${InternalRoute.Identity}/resend-sms-mfa`,
  SetupSmsMfa = `${InternalRoute.Identity}/setup-sms-mfa`,
  AuthorizeEmailMfa = `${InternalRoute.Identity}/authorize-email-mfa`,
  ResendEmailMfa = `${InternalRoute.Identity}/resend-email-mfa`,
  AuthorizeConsent = `${InternalRoute.Identity}/authorize-consent`,
  AuthorizeGoogle = `${InternalRoute.Identity}/authorize-google`,
  AuthorizeFacebook = `${InternalRoute.Identity}/authorize-facebook`,
  AuthorizeGitHub = `${InternalRoute.Identity}/authorize-github`,
  AuthorizeReset = `${InternalRoute.Identity}/authorize-reset`,
  ResetCode = `${InternalRoute.Identity}/reset-code`,
  ResendResetCode = `${InternalRoute.Identity}/resend-reset-code`,
  VerifyEmail = `${InternalRoute.Identity}/verify-email`,
  Logout = `${InternalRoute.Identity}/logout`,
  ChangePassword = `${InternalRoute.Identity}/change-password`,
  ChangeEmail = `${InternalRoute.Identity}/change-email`,
  ChangeEmailCode = `${InternalRoute.Identity}/change-email-code`,
  ResetMfa = `${InternalRoute.Identity}/reset-mfa`,
}
