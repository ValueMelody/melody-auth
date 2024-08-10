export enum Error {
  NoApp = 'No app found',
  WrongClientType = 'Wrong client type',
  WrongClientSecret = 'Wrong client secret',
  WrongOrigin = 'Request from unexpected origin',
  AppDisabled = 'This app has been disabled',
  EmailTaken = 'The email address is already in use.',
  WrongRedirectUri = 'Invalid redirect_uri',
  NoUser = 'No user found',
  AccountLocked = 'Account temporarily locked due to excessive login failures',
  UserDisabled = 'This account has been disabled',
  EmailAlreadyVerified = 'Email already verified',
  NoConsent = 'User consent required',
  WrongCode = 'Invalid code',
  WrongMfaCode = 'Invalid MFA code',
  MfaNotVerified = 'MFA code not verified',
  WrongCodeVerifier = 'Invalid code_verifier',
  WrongGrantType = 'Invalid grant_type',
  WrongRefreshToken = 'Invalid refresh_token',
  UniqueKey = 'Unique key constraint failed',
}

export const common = Object.freeze({
  documentTitle: {
    en: 'Melody Auth',
    fr: 'Melody Auth',
  },
  poweredBy: {
    en: 'Powered by Melody Auth',
    fr: 'Powered by Melody Auth',
  },
})

export const validateError = Object.freeze({
  passwordIsRequired: {
    en: 'Password is required!',
    fr: 'Password is required!',
  },
  emailIsRequired: {
    en: 'Email is required!',
    fr: 'Email is required!',
  },
  isNotEmail: {
    en: 'Wrong email format.',
    fr: 'Wrong email format.',
  },
  isWeakPassword: {
    en: 'Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
    fr: 'Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
  },
  passwordNotMatch: {
    en: 'The password and confirm password do not match.',
    fr: 'The password and confirm password do not match.',
  },
  firstNameIsEmpty: {
    en: 'First name can not be empty.',
    fr: 'First name can not be empty.',
  },
  lastNameIsEmpty: {
    en: 'Last name can not be empty.',
    fr: 'Last name can not be empty.',
  },
  verificationCodeLengthIssue: {
    en: 'Verification code can only be 8 characters.',
    fr: 'Verification code can only be 8 characters.',
  },
})

export const requestError = Object.freeze({
  authFailed: {
    en: 'Authentication Failed.',
    fr: 'Authentication Failed.',
  },
  noUser: {
    en: 'No user found.',
    fr: 'No user found.',
  },
  accountLocked: {
    en: 'Account temporarily locked due to excessive login failures.',
    fr: 'Account temporarily locked due to excessive login failures.',
  },
  emailTaken: {
    en: 'The email address is already in use.',
    fr: 'The email address is already in use.',
  },
  wrongCode: {
    en: 'Invalid code',
    fr: 'Invalid code',
  },
})

export const authorizePassword = Object.freeze({
  title: {
    en: 'Authentication',
    fr: 'Authentication',
  },
  email: {
    en: 'Email',
    fr: 'Email',
  },
  password: {
    en: 'Password',
    fr: 'Password',
  },
  submit: {
    en: 'Login',
    fr: 'Login',
  },
  signUp: {
    en: 'Create a new account',
    fr: 'Create a new account',
  },
  passwordReset: {
    en: 'Reset password',
    fr: 'Reset password',
  },
})

export const authorizeAccount = Object.freeze({
  title: {
    en: 'Create an account',
    fr: 'Create an account',
  },
  email: {
    en: 'Email',
    fr: 'Email',
  },
  password: {
    en: 'Password',
    fr: 'Password',
  },
  confirmPassword: {
    en: 'Confirm Password',
    fr: 'Confirm Password',
  },
  firstName: {
    en: 'First Name',
    fr: 'First Name',
  },
  lastName: {
    en: 'Last Name',
    fr: 'Last Name',
  },
  signUp: {
    en: 'Confirm',
    fr: 'Confirm',
  },
  signIn: {
    en: 'Already has an account? Sign in',
    fr: 'Already has an account? Sign in',
  },
})

export const authorizeConsent = Object.freeze({
  title: {
    en: 'Authorize app',
    fr: 'Authorize app',
  },
  requestAccess: {
    en: 'is requesting access to your account.',
    fr: 'is requesting access to your account.',
  },
  accept: {
    en: 'Accept',
    fr: 'Accept',
  },
  decline: {
    en: 'Decline',
    fr: 'Decline',
  },
})

export const authorizeEmailMFA = Object.freeze({
  title: {
    en: 'A verification code has been sent to your email.',
    fr: 'A verification code has been sent to your email.',
  },
  verify: {
    en: 'Verify',
    fr: 'Verify',
  },
})

export const authorizeReset = Object.freeze({
  title: {
    en: 'Reset your password',
    fr: 'Reset your password',
  },
  success: {
    en: 'Password reset success!',
    fr: 'Password reset success!',
  },
  signIn: {
    en: 'Sign in',
    fr: 'Sign in',
  },
  backSignIn: {
    en: 'Back to sign in',
    fr: 'Back to sign in',
  },
  desc: {
    en: 'Enter your email address, we will send you a reset code by email',
    fr: 'Enter your email address, we will send you a reset code by email',
  },
  email: {
    en: 'Email',
    fr: 'Email',
  },
  code: {
    en: 'Code',
    fr: 'Code',
  },
  password: {
    en: 'Password',
    fr: 'Password',
  },
  confirmPassword: {
    en: 'Confirm Password',
    fr: 'Confirm Password',
  },
  send: {
    en: 'Send',
    fr: 'Send',
  },
  reset: {
    en: 'Reset',
    fr: 'Reset',
  },
})

export const verifyEmail = Object.freeze({
  title: {
    en: 'Verify your email',
    fr: 'Verify your email',
  },
  desc: {
    en: 'Enter your verification code received by email',
    fr: 'Enter your verification code received by email',
  },
  verify: {
    en: 'Verify',
    fr: 'Verify',
  },
  success: {
    en: 'Verification success! You can close this page now.',
    fr: 'Verification success! You can close this page now.',
  },
})

export const emailVerificationEmail = Object.freeze({
  subject: {
    en: 'Welcome to Melody Auth, please verify your email address',
    fr: 'Welcome to Melody Auth, please verify your email address',
  },
  title: {
    en: 'Welcome to Melody Auth',
    fr: 'Welcome to Melody Auth',
  },
  desc: {
    en: 'Thanks for signing up! Please verify your email address with us, your verification code is',
    fr: 'Thanks for signing up! Please verify your email address with us, your verification code is',
  },
  expiry: {
    en: 'This link will be expired after 2 hour',
    fr: 'This link will be expired after 2 hour',
  },
  verify: {
    en: 'Verify your email',
    fr: 'Verify your email',
  },
})

export const passwordResetEmail = Object.freeze({
  subject: {
    en: 'Reset your password',
    fr: 'Reset your password',
  },
  title: {
    en: 'Reset your password',
    fr: 'Reset your password',
  },
  desc: {
    en: 'Here is your reset code, this code will be expired after 2 hour',
    fr: 'Here is your reset code, this code will be expired after 2 hour',
  },
})

export const emailMfaEmail = Object.freeze({
  subject: {
    en: 'Account verification code',
    fr: 'Account verification code',
  },
  title: {
    en: 'Account verification code',
    fr: 'Account verification code',
  },
  desc: {
    en: 'Here is your MFA code, this code will be expired after 5 minutes',
    fr: 'Here is your MFA code, this code will be expired after 5 minutes',
  },
})
