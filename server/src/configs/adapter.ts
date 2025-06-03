export enum TableName {
  App = 'app',
  User = 'user',
  UserAttribute = 'user_attribute',
  UserAttributeValue = 'user_attribute_value',
  UserAppConsent = 'user_app_consent',
  Role = 'role',
  UserRole = 'user_role',
  UserPasskey = 'user_passkey',
  Scope = 'scope',
  AppScope = 'app_scope',
  ScopeLocale = 'scope_locale',
  Org = 'org',
  SamlIdp = 'saml_idp',
  EmailLog = 'email_log',
  SmsLog = 'sms_log',
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
  EmbeddedSession = 'ES',
  EmailMfaCode = 'EMC',
  OtpMfaCode = 'OMC',
  SmsMfaCode = 'SMC',
  PasswordlessCode = 'PLC',
  EmailVerificationCode = 'EVC',
  PasskeyEnrollChallenge = 'PEC',
  PasskeyVerifyChallenge = 'PVC',
  PasswordResetCode = 'PRC',
  FailedLoginAttempts = 'FLA',
  FailedOtpMfaAttempts = 'FMA',
  SmsMfaMessageAttempts = 'SMMA',
  EmailMfaEmailAttempts = 'EMEA',
  PasswordResetAttempts = 'PRA',
  ChangeEmailCode = 'CEC',
  ChangeEmailAttempts = 'CEA',
  OidcCodeVerifier = 'OVC',
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
