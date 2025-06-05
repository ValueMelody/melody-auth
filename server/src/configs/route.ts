export enum InternalRoute {
  OAuth = '/oauth2/v1',
  Identity = '/identity/v1',
  ApiUsers = '/api/v1/users',
  ApiUserAttributes = '/api/v1/user-attributes',
  ApiApps = '/api/v1/apps',
  ApiRoles = '/api/v1/roles',
  ApiScopes = '/api/v1/scopes',
  ApiOrgs = '/api/v1/orgs',
  ApiSamlIdps = '/api/v1/saml/idps',
  ApiLogs = '/api/v1/logs',
  Embedded = '/embedded-auth/v1',
  SamlSp = '/saml/sp/v1',
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
  AuthorizeDiscord = `${InternalRoute.Identity}/authorize-discord`,
  AuthorizeApple = `${InternalRoute.Identity}/authorize-apple`,
  AuthorizeOidc = `${InternalRoute.Identity}/authorize-oidc`,
  AuthorizeOidcConfigs = `${InternalRoute.Identity}/authorize-oidc-configs`,
  // Process MFA
  ProcessMfaEnroll = `${InternalRoute.Identity}/process-mfa-enroll`,
  SendEmailMfa = `${InternalRoute.Identity}/send-email-mfa`,
  ProcessEmailMfa = `${InternalRoute.Identity}/process-email-mfa`,
  ResendSmsMfa = `${InternalRoute.Identity}/resend-sms-mfa`,
  SetupSmsMfa = `${InternalRoute.Identity}/setup-sms-mfa`,
  ProcessSmsMfa = `${InternalRoute.Identity}/process-sms-mfa`,
  OtpMfaSetup = `${InternalRoute.Identity}/otp-mfa-setup`,
  ProcessOtpMfa = `${InternalRoute.Identity}/process-otp-mfa`,
  // Passwordless Sign-in
  AuthorizePasswordless = `${InternalRoute.Identity}/authorize-passwordless`,
  SendPasswordlessCode = `${InternalRoute.Identity}/send-passwordless-code`,
  ProcessPasswordlessCode = `${InternalRoute.Identity}/process-passwordless-code`,
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

export enum View {
  SignIn = 'sign_in',
  PasswordlessVerify = 'passwordless_verify',
  Consent = 'consent',
  MfaEnroll = 'mfa_enroll',
  EmailMfa = 'email_mfa',
  SmsMfa = 'sms_mfa',
  OtpSetup = 'otp_setup',
  OtpMfa = 'opt_mfa',
  PasskeyEnroll = 'passkey_enroll',
  SignUp = 'sign_up',
  ResetPassword = 'reset_password',
  UpdateInfo = 'update_info',
  ChangePassword = 'change_password',
  ResetMfa = 'reset_mfa',
  ManagePasskey = 'manage_passkey',
  ChangeEmail = 'change_email',
  AuthCodeExpired = 'auth_code_expired',
  VerifyEmail = 'verify_email',
}

export enum EmbeddedRoute {
  Initiate = `${InternalRoute.Embedded}/initiate`,
  SignIn = `${InternalRoute.Embedded}/:sessionId/sign-in`,
  SignUp = `${InternalRoute.Embedded}/:sessionId/sign-up`,
  AppConsent = `${InternalRoute.Embedded}/:sessionId/app-consent`,
  MfaEnrollment = `${InternalRoute.Embedded}/:sessionId/mfa-enrollment`,
  EmailMfaCode = `${InternalRoute.Embedded}/:sessionId/email-mfa-code`,
  EmailMfa = `${InternalRoute.Embedded}/:sessionId/email-mfa`,
  OtpMfaSetup = `${InternalRoute.Embedded}/:sessionId/otp-mfa-setup`,
  OtpMfa = `${InternalRoute.Embedded}/:sessionId/otp-mfa`,
  SmsMfaSetup = `${InternalRoute.Embedded}/:sessionId/sms-mfa-setup`,
  SmsMfaCode = `${InternalRoute.Embedded}/:sessionId/sms-mfa-code`,
  SmsMfa = `${InternalRoute.Embedded}/:sessionId/sms-mfa`,
  TokenExchange = `${InternalRoute.Embedded}/token-exchange`,
  TokenRefresh = `${InternalRoute.Embedded}/token-refresh`,
  SignOut = `${InternalRoute.Embedded}/sign-out`,
  ResetPasswordCode = `${InternalRoute.Embedded}/reset-password-code`,
}
