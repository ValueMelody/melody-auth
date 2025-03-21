export enum ConfigError {
  NotSupposeToSendEmailMfa = 'An email mfa request triggered but the system is not supposed to send email mfa based on current setup',
  SignUpNotEnabled = 'Sign up is not enabled or passwordless sign in is enabled',
  PasswordSignInNotEnabled = 'Password sign in is not enabled or passwordless sign in is enabled',
  PasswordResetNotEnabled = 'Password reset is not enabled or passwordless sign in is enabled',
  PasswordlessSignInNotEnabled = 'Passwordless sign in is not enabled',
  OrgNotEnabled = 'Organization is not enabled',
  PasskeyEnrollmentNotEnabled = 'Passkey enrollment is not enabled or passwordless sign in is enabled',
  GoogleSignInNotEnabled = 'Google id is not configured',
  FacebookSignInNotEnabled = 'Facebook id or secret is not configured',
  GithubSignInNotEnabled = 'Github id, secret or app name is not configured',
  EmailVerificationNotEnabled = 'Email verification is not enabled',
  MfaEnrollNotEnabled = 'MFA enrollment method list is empty or specific MFA method has been set to required',
  ChangePasswordPolicyNotEnabled = 'Change password policy is not enabled or password reset is not enabled',
  ChangeEmailPolicyNotEnabled = 'Change email policy is not enabled or email verification is not enabled',
  ResetMfaPolicyNotEnabled = 'Reset MFA policy is not enabled',
  ManagePasskeyPolicyNotEnabled = 'Manage passkey policy is not enabled or passkey enrollment is not enabled',
  UpdateInfoPolicyNotEnabled = 'Update info policy is not enabled or user names are not enabled',
  NoSmsSender = 'A sms request triggered but no sms sender is configured',
  NoEmailSender = 'An email request triggered but no email sender is configured',
  NoSessionSecret = 'Session secret is not configured',
  NoJwtPrivateSecret = 'JWT private secret is not configured',
  NoJwtPublicSecret = 'JWT public secret is not configured',
}

export enum RequestError {
  WrongClientType = 'Wrong client type',
  WrongClientSecret = 'Wrong client secret',
  WrongOrigin = 'Request from unexpected origin',
  WrongRedirectUri = 'Invalid redirect_uri',
  WrongGrantType = 'Invalid grant_type',
  WrongCodeVerifier = 'Invalid code_verifier',
  WrongRefreshToken = 'Invalid refresh_token',
  WrongTokenType = 'Unsupported token type',
  WrongAuthCode = 'Invalid auth code',
  WrongCode = 'Invalid code',
  WrongMfaCode = 'Invalid MFA code',
  WrongPasswordlessCode = 'Invalid passwordless code',
  InvalidRequest = 'Invalid request',
  RequireDifferentPassword = 'New password should not be the same as old password',
  RequireDifferentEmail = 'New email address same as old email address',
  NoApp = 'No app found',
  AppDisabled = 'This app has been disabled',
  NoUser = 'No user found',
  NoOrg = 'No organization found',
  OrgHasUsers = 'Can not delete organization with users',
  UserDisabled = 'This account has been disabled',
  EmailTaken = 'The email address is already in use',
  EmailAlreadyVerified = 'Email already verified',
  NoConsent = 'User consent required',
  PasswordlessNotVerified = 'Passwordless code not verified',
  MfaNotVerified = 'MFA code not verified',
  MfaEnrolled = 'User already enrolled with MFA',
  OtpAlreadySet = 'OTP authentication already set',
  UserAlreadyLinked = 'This account has already been linked with one account',
  TargetUserAlreadyLinked = 'Target account has already been linked with one account',
  UniqueKey = 'Unique key constraint failed',
  SocialAccountNotSupported = 'This function is unavailable for social login accounts.',
  AccountLocked = 'Account temporarily locked due to excessive login failures',
  OtpMfaLocked = 'Too many failed OTP verification attempts. Please try again after 30 minutes.',
  SmsMfaLocked = 'Too many SMS verification attempts. Please try again after 30 minutes.',
  EmailMfaLocked = 'Too many Email verification attempts. Please try again after 30 minutes.',
  PasswordResetLocked = 'Too many password reset email requests. Please try again tomorrow.',
  ChangeEmailLocked = 'Too many password change email requests. Please try again after 30 minutes.',
}
