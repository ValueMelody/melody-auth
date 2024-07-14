export enum Error {
  NoApp = 'No app found',
  EmailTaken = 'The email address is already in use.',
  WrongRedirectUri = 'Invalid redirect_uri',
  NoUser = 'No user found',
  CanNotCreateUser = 'Failed to create user',
  WrongCode = 'Invalid code',
  WrongCodeVerifier = 'Invalid code_verifier',
  WrongGrantType = 'Invalid grant_type',
  WrongRefreshToken = 'Invalid refresh_token',
}

export enum Message {
  AuthFailed = 'Authentication Failed',
  LogoutSuccess = 'Logged out successfully',
  EmailIsRequired = 'Email is required.',
  WrongEmailFormat = 'Wrong email format.',
  PasswordIsRequired = 'Password is required.',
  PasswordNotMatch = 'The password and confirm password do not match.',
  FirstNameIsEmpty = 'First name can not be empty.',
  LastNameIsEmpty = 'Last name can not be empty.',
  WeakPassword = 'Password must be at least 8 characters, contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
}

export enum AuthorizePasswordPage {
  EmailLabel = 'Email',
  PasswordLabel = 'Password',
  SubmitBtn = 'Login',
  Title = 'Authentication',
  SignUpBtn = 'Create a new account.',
}

export enum AuthorizeAccountPage {
  Title = 'Create an account',
  FirstNameLabel = 'First Name',
  LastNameLabel = 'Last Name',
  ConfirmPasswordLabel = 'Confirm Password',
  SignInBtn = 'Already has an account? Sign in',
  SignUpBtn = 'Confirm',
}

export enum CommonPage {
  PoweredBy = 'Powered by Melody Oauth',
}
