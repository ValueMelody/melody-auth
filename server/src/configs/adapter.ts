export enum TableName {
  App = 'app',
  User = 'user',
  UserAppConsent = 'user_app_consent',
  Role = 'role',
  UserRole = 'user_role',
  Scope = 'scope',
  AppScope = 'app_scope',
  ScopeLocale = 'scope_locale',
}

export enum BaseKVKey {
  JwtPublicSecret = 'jwtPublicSecret',
  JwtPrivateSecret = 'jwtPrivateSecret',
  sessionSecret = 'sessionSecret',
  RefreshToken = 'RT',
  AuthCode = 'AC',
  EmailMfaCode = 'EMC',
  OtpMfaCode = 'OMC',
  EmailVerificationCode = 'EVC',
  PasswordResetCode = 'PRC',
  FailedLoginAttempts = 'FLA',
  FailedOtpMfaAttempts = 'FMA',
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
