export enum Error {
  NoApp = 'No app found',
  WrongClientType = 'Wrong client type',
  WrongClientSecret = 'Wrong client secret',
  AppDisabled = 'This app has been disabled',
  EmailTaken = 'The email address is already in use.',
  WrongRedirectUri = 'Invalid redirect_uri',
  NoUser = 'No user found',
  UserDisabled = 'This account has been disabled',
  EmailAlreadyVerified = 'Email already verified',
  NoConsent = 'User consent required',
  CanNotCreateUser = 'Failed to create user',
  CanNotCreateConsent = 'Failed to create consent',
  WrongCode = 'Invalid code',
  CodeExpired = 'Code expired',
  WrongCodeVerifier = 'Invalid code_verifier',
  WrongGrantType = 'Invalid grant_type',
  WrongRefreshToken = 'Invalid refresh_token',
  WrongScope = 'Insufficient scope',
  UniqueKey = 'Unique key constraint failed',
}

export enum Message {
  AuthFailed = 'Authentication Failed',
  EmailIsRequired = 'Email is required.',
  WrongEmailFormat = 'Wrong email format.',
  PasswordIsRequired = 'Password is required.',
  PasswordNotMatch = 'The password and confirm password do not match.',
  FirstNameIsEmpty = 'First name can not be empty.',
  LastNameIsEmpty = 'Last name can not be empty.',
  VerificationCodeLength = 'Verification code can only be 8 characters',
  WeakPassword = 'Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
}

export enum AuthorizePasswordPage {
  EmailLabel = 'Email',
  PasswordLabel = 'Password',
  SubmitBtn = 'Login',
  Title = 'Authentication',
  SignUpBtn = 'Create a new account',
  PasswordResetBtn = 'Reset password',
}

export enum AuthorizeConsentPage {
  Title = 'Authorize app',
  RequestAccess = 'is requesting access to your account.',
  DeclineBtn = 'Decline',
  AcceptBtn = 'Accept',
}

export enum AuthorizeAccountPage {
  Title = 'Create an account',
  FirstNameLabel = 'First Name',
  LastNameLabel = 'Last Name',
  ConfirmPasswordLabel = 'Confirm Password',
  SignInBtn = 'Already has an account? Sign in',
  SignUpBtn = 'Confirm',
}

export enum AuthorizeResetPage {
  Title = 'Reset your password',
  Desc = 'Enter your email address, we will send you a reset code by email',
  SendBtn = 'Send',
  ResetBtn = 'Reset',
  EmailLabel = 'Email',
  CodeLabel = 'Code',
  PasswordLabel = 'Password',
  ConfirmPasswordLabel = 'Confirm Password',
  Success = 'Password reset success!',
  SignInBtn = 'Sign in',
}

export enum VerifyEmailPage {
  Title = 'Verify your email',
  Desc = 'Enter your verification code received by email',
  VerifyBtn = 'Verify',
  Success = 'Verification success! You can close this page now.',
}

export enum CommonContent {
  PoweredBy = 'Powered by Melody Auth',
}

export enum EmailVerificationTemplate {
  Subject = 'Welcome to Melody Auth, please verify your email address',
  Title = 'Welcome to Melody Auth',
  Desc = 'Thanks for signing up! Please verify your email address with us, your verification code is',
  ExpiryText = 'This link will be expired after 2 hour',
  VerifyBtn = 'Verify your email',
}

export enum PasswordResetTemplate {
  Subject = 'Reset your password',
  Title = 'Reset your password',
  Desc = 'Here is your reset code, this code will be expired after 2 hour',
}
