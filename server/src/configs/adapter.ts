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
}

export const getKVKey = (
  base: BaseKVKey, id: string,
): string => {
  return `${base}-${id}`
}

export enum SessionKey {
  AuthInfo = 'authInfo',
}

export const getAuthInfoSessionKeyByClientId = (clientId: string) => {
  return `${SessionKey.AuthInfo}-${clientId}`
}