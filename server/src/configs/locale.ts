export enum Error {
  NoApp = 'No app found',
  WrongRedirectUri = 'Invalid redirect_uri',
  NoUser = 'No user found',
  WrongCode = 'Invalid code',
  WrongCodeVerifier = 'Invalid code_verifier',
  WrongGrantType = 'Invalid grant_type',
  WrongRefreshToken = 'Invalid refresh_token',
}

export enum AuthorizePasswordPage {
  EmailLabel = 'Email',
  PasswordLabel = 'Password',
  SubmitBtn = 'Login',
}
