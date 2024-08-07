export enum TableName {
  App = 'app',
  User = 'user',
  UserAppConsent = 'user_app_consent',
  Role = 'role',
  UserRole = 'user_role',
  Scope = 'scope',
  AppScope = 'app_scope',
}

export enum BaseKVKey {
  RefreshToken = 'refreshToken',
  AuthCode = 'authCode',
  JwtPublicSecret = 'jwtPublicSecret',
  JwtPrivateSecret = 'jwtPrivateSecret',
  sessionSecret = 'sessionSecret',
  MFACode = 'mfaCode',
  EmailVerificationCode = 'emailVerificationCode',
  PasswordResetCode = 'passwordResetCode',
  FailedLoginAttempts = 'failedLoginAttempts',
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
