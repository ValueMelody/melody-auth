export enum Error {
  NoApp = 'No app found',
  EmailTaken = 'The email has already been taken',
  WrongRedirectUri = 'Invalid redirect_uri',
  NoUser = 'No user found',
  CanNotCreateUser = 'Failed to create user',
  WrongCode = 'Invalid code',
  WrongCodeVerifier = 'Invalid code_verifier',
  WrongGrantType = 'Invalid grant_type',
  WrongRefreshToken = 'Invalid refresh_token',
}

export enum Message {
  LogoutSuccess = 'Logged out successfully',
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
