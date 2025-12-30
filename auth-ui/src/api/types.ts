export interface AuthorizeParams {
  clientId: string
  redirectUri: string
  responseType: string
  state: string
  policy?: string
  codeChallenge?: string
  codeChallengeMethod?: string
  scope?: string
  org?: string
}

export interface FollowUpParams {
  code: string
  org?: string
}

export interface AuthorizeResponse {
  nextPage?: string
  code?: string
  state?: string
  redirectUri?: string
  org?: string
}

export interface BrandingConfig {
  layoutColor: string
  labelColor: string
  primaryButtonColor: string
  primaryButtonLabelColor: string
  primaryButtonBorderColor: string
  secondaryButtonColor: string
  secondaryButtonLabelColor: string
  secondaryButtonBorderColor: string
  criticalIndicatorColor: string
  fontFamily: string
  logoUrl: string
}

export interface OidcProvider {
  id: string
  name: string
  clientId: string
}

export interface UserAttribute {
  name: string
  locales: { locale: string; value: string }[]
  requiredInSignUp: boolean
  isUnique: boolean
}

export interface AppBanner {
  id: number
  type: 'info' | 'warning' | 'success' | 'error'
  text: string
  locales: { locale: string; value: string }[]
}

export interface InitialProps {
  enablePasswordSignIn: boolean
  enablePasswordlessSignIn: boolean
  enableSignUp: boolean
  enablePasswordReset: boolean
  allowRecoveryCode: boolean
  enableNames?: boolean
  enableSms?: boolean
  enableRememberDevice?: boolean
  enableEmailMfaFallback?: boolean
  googleClientId?: string
  facebookClientId?: string
  githubClientId?: string
  discordClientId?: string
  appleClientId?: string
  oidcProviders?: OidcProvider[]
  termsLink?: string
  privacyPolicyLink?: string
  userAttributes?: UserAttribute[]
  logoUrl?: string
  branding?: Partial<BrandingConfig>
}

export type Locale = 'en' | 'pt' | 'fr'

export enum View {
  SignIn = 'sign_in',
  PasswordlessVerify = 'passwordless_verify',
  Consent = 'consent',
  MfaEnroll = 'mfa_enroll',
  EmailMfa = 'email_mfa',
  SmsMfa = 'sms_mfa',
  OtpSetup = 'otp_setup',
  OtpMfa = 'otp_mfa',
  PasskeyEnroll = 'passkey_enroll',
  RecoveryCodeSignIn = 'recovery_code_sign_in',
  RecoveryCodeEnroll = 'recovery_code_enroll',
  SwitchOrg = 'switch_org',
  SignUp = 'sign_up',
  ResetPassword = 'reset_password',
  UpdateInfo = 'update_info',
  ChangePassword = 'change_password',
  ResetMfa = 'reset_mfa',
  ManagePasskey = 'manage_passkey',
  ManageRecoveryCode = 'manage_recovery_code',
  ChangeEmail = 'change_email',
  AuthCodeExpired = 'auth_code_expired',
  VerifyEmail = 'verify_email',
  ChangeOrg = 'change_org',
}

export enum IdentityRoute {
  ProcessView = '/identity/v1/view/process',
  AuthorizeView = '/identity/v1/view/authorize',
  AuthorizePassword = '/identity/v1/authorize-password',
  AuthorizeAccount = '/identity/v1/authorize-account',
  AuthorizeRecoveryCode = '/identity/v1/authorize-recovery-code',
  AppConsent = '/identity/v1/app-consent',
  Logout = '/identity/v1/logout',
  AuthorizeGoogle = '/identity/v1/authorize-google',
  AuthorizeFacebook = '/identity/v1/authorize-facebook',
  AuthorizeGitHub = '/identity/v1/authorize-github',
  AuthorizeDiscord = '/identity/v1/authorize-discord',
  AuthorizeApple = '/identity/v1/authorize-apple',
  AuthorizeOidc = '/identity/v1/authorize-oidc',
  AuthorizeOidcConfigs = '/identity/v1/authorize-oidc-configs',
  ProcessMfaEnroll = '/identity/v1/process-mfa-enroll',
  SendEmailMfa = '/identity/v1/send-email-mfa',
  ProcessEmailMfa = '/identity/v1/process-email-mfa',
  ResendSmsMfa = '/identity/v1/resend-sms-mfa',
  SetupSmsMfa = '/identity/v1/setup-sms-mfa',
  ProcessSmsMfa = '/identity/v1/process-sms-mfa',
  OtpMfaSetup = '/identity/v1/otp-mfa-setup',
  ProcessOtpMfa = '/identity/v1/process-otp-mfa',
  AuthorizePasswordless = '/identity/v1/authorize-passwordless',
  SendPasswordlessCode = '/identity/v1/send-passwordless-code',
  ProcessPasswordlessCode = '/identity/v1/process-passwordless-code',
  ProcessPasskeyEnroll = '/identity/v1/process-passkey-enroll',
  ProcessPasskeyEnrollDecline = '/identity/v1/process-passkey-enroll-decline',
  AuthorizePasskeyVerify = '/identity/v1/authorize-passkey-verify',
  ProcessRecoveryCodeEnroll = '/identity/v1/process-recovery-code-enroll',
  ProcessSwitchOrg = '/identity/v1/process-switch-org',
  ChangePassword = '/identity/v1/change-password',
  ChangeEmailCode = '/identity/v1/change-email-code',
  ChangeEmail = '/identity/v1/change-email',
  ResetMfa = '/identity/v1/reset-mfa',
  ManagePasskey = '/identity/v1/manage-passkey',
  ManageRecoveryCode = '/identity/v1/manage-recovery-code',
  UpdateInfo = '/identity/v1/update-info',
  ChangeOrg = '/identity/v1/change-org',
  VerifyEmailView = '/identity/v1/view/verify-email',
  VerifyEmail = '/identity/v1/verify-email',
  ResetPasswordCode = '/identity/v1/reset-password-code',
  ResetPassword = '/identity/v1/reset-password',
  AuthCodeExpiredView = '/identity/v1/view/auth-code-expired',
  AppBanners = '/identity/v1/app-banners',
}
