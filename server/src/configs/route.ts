export enum InternalRoute {
  OAuth = '/oauth2/v1',
  Identity = '/identity/v1',
  ApiUsers = '/api/v1/users',
  ApiApps = '/api/v1/apps',
  ApiRoles = '/api/v1/roles',
  ApiScopes = '/api/v1/scopes',
}

export enum OauthRoute {
  Authorize = `${InternalRoute.OAuth}/authorize`,
  Token = `${InternalRoute.OAuth}/token`,
  Logout = `${InternalRoute.OAuth}/logout`,
  Userinfo = `${InternalRoute.OAuth}/userinfo`,
}

export enum IdentityRoute {
  AuthCodeExpired = `${InternalRoute.Identity}/auth-code-expired`,
  AuthorizePassword = `${InternalRoute.Identity}/authorize-password`,
  AuthorizeAccount = `${InternalRoute.Identity}/authorize-account`,
  AuthorizeMfaEnroll = `${InternalRoute.Identity}/authorize-mfa-enroll`,
  AuthorizeOtpSetup = `${InternalRoute.Identity}/authorize-otp-setup`,
  AuthorizeOtpMfa = `${InternalRoute.Identity}/authorize-otp-mfa`,
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
}
