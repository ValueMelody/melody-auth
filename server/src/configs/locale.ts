export enum Error {
  NoApp = 'No app found',
  WrongRedirectUri = 'Invalid redirect uri',
  NoUser = 'No user found',
  WrongCode = 'Invalid code',
  WrongCodeVerifier = 'Invalid code verifier',
}

export enum AuthorizePasswordPage {
  EmailLabel = 'Email',
  PasswordLabel = 'Password',
  SubmitBtn = 'Login',
}
