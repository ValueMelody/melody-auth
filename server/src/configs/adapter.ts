export enum TableName {
  App = 'app',
  User = 'user',
  UserAppConsent = 'user_app_consent',
  Role = 'role',
  UserRole = 'user_role',
  Scope = 'scope',
  AppScope = 'app_scope',
  ScopeLocale = 'scope_locale',
  EmailLog = 'email_log',
  SignInLog = 'sign_in_log',
}

export enum BaseKVKey {
  JwtPublicSecret = 'jwtPublicSecret',
  DeprecatedJwtPublicSecret = 'deprecatedJwtPublicSecret',
  JwtPrivateSecret = 'jwtPrivateSecret',
  DeprecatedJwtPrivateSecret = 'deprecatedJwtPrivateSecret',
  SessionSecret = 'sessionSecret',
  RefreshToken = 'RT',
  AuthCode = 'AC',
  EmailMfaCode = 'EMC',
  OtpMfaCode = 'OMC',
  EmailVerificationCode = 'EVC',
  PasswordResetCode = 'PRC',
  FailedLoginAttempts = 'FLA',
  FailedOtpMfaAttempts = 'FMA',
  PasswordResetAttempts = 'PRA',
}

export const getKVKey = (
  base: BaseKVKey, key1: string, key2?: string,
): string => {
  const baseKey = `${base}-${key1}`
  return key2 ? `${baseKey}-${key2}` : baseKey
}

export enum SessionKey {
  AuthInfo = 'authInfo',
}

export const getAuthInfoSessionKeyByClientId = (clientId: string) => {
  return `${SessionKey.AuthInfo}-${clientId}`
}

export enum FileLocation {
  NodePublicKey = 'node_jwt_public_key.pem',
  NodePrivateKey = 'node_jwt_private_key.pem',
  NodeDeprecatedPrivateKey = 'node_deprecated_jwt_private_key.pem',
  NodeDeprecatedPublicKey = 'node_deprecated_jwt_public_key.pem',
}
