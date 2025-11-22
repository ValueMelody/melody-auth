import { Context } from 'hono'
import {
  errorConfig, adapterConfig,
  typeConfig,
  messageConfig,
  variableConfig,
} from 'configs'
import {
  cryptoUtil, loggerUtil,
} from 'utils'

export const getSessionSecret = async (c: Context<typeConfig.Context>): Promise<string> => {
  const secretInKv = await c.env.KV.get(adapterConfig.BaseKVKey.SessionSecret)
  if (!secretInKv) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.NoSessionSecret,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.NoSessionSecret)
  }
  return secretInKv
}

export const getJwtPrivateSecret = async (c: Context<typeConfig.Context>): Promise<string> => {
  const secretInKv = await c.env.KV.get(adapterConfig.BaseKVKey.JwtPrivateSecret)
  if (!secretInKv) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.NoJwtPrivateSecret,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.NoJwtPrivateSecret)
  }
  return secretInKv
}

export const getJwtPublicSecret = async (c: Context<typeConfig.Context>): Promise<string> => {
  const secretInKv = await c.env.KV.get(adapterConfig.BaseKVKey.JwtPublicSecret)
  if (!secretInKv) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Error,
      messageConfig.ConfigError.NoJwtPublicSecret,
    )
    throw new errorConfig.Forbidden(messageConfig.ConfigError.NoJwtPublicSecret)
  }
  return secretInKv
}

export const getDeprecatedPublicSecret = async (kv: KVNamespace): Promise<string | null> => {
  const secretInKv = await kv.get(adapterConfig.BaseKVKey.DeprecatedJwtPublicSecret)
  return secretInKv
}

export const storeAuthCode = async (
  kv: KVNamespace,
  authCode: string,
  authCodeBody: typeConfig.AuthCodeBody,
  expiresIn: number,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.AuthCode,
      authCode,
    ),
    JSON.stringify(authCodeBody),
    { expirationTtl: expiresIn },
  )
}

export const getAuthCodeBody = async (
  kv: KVNamespace, authCode: string,
): Promise<typeConfig.AuthCodeBody | false> => {
  const codeInKv = await kv.get(adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.AuthCode,
    authCode,
  ))
  if (!codeInKv) return false
  const codeBody = JSON.parse(codeInKv)
  if (!codeBody) return false
  return codeBody
}

export const getEmbeddedSessionBody = async (
  kv: KVNamespace, sessionId: string,
): Promise<typeConfig.EmbeddedSessionBody | false> => {
  const sessionInKv = await kv.get(adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.EmbeddedSession,
    sessionId,
  ))
  if (!sessionInKv) return false
  const sessionBody = JSON.parse(sessionInKv)
  if (!sessionBody) return false
  return sessionBody
}

export const storeEmbeddedSession = async (
  kv: KVNamespace,
  sessionId: string,
  embeddedSessionBody: typeConfig.EmbeddedSessionBody,
  expiresIn: number,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.EmbeddedSession,
      sessionId,
    ),
    JSON.stringify(embeddedSessionBody),
    { expirationTtl: expiresIn },
  )
}

export const storeRefreshToken = async (
  kv: KVNamespace,
  refreshToken: string,
  value: typeConfig.RefreshTokenBody,
  expiresIn: number,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.RefreshToken,
      refreshToken,
    ),
    JSON.stringify(value),
    { expirationTtl: expiresIn },
  )
}

export const invalidRefreshToken = async (
  kv: KVNamespace, refreshToken: string,
) => {
  await kv.delete(adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.RefreshToken,
    refreshToken,
  ))
}

export const getRefreshTokenBody = async (
  c: Context<typeConfig.Context>, refreshToken: string,
): Promise<typeConfig.RefreshTokenBody> => {
  const tokenInKv = await c.env.KV.get(adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.RefreshToken,
    refreshToken,
  ))
  if (!tokenInKv) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongRefreshToken,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongRefreshToken)
  }
  try {
    const tokenBody = JSON.parse(tokenInKv)
    return tokenBody
  } catch (e) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.WrongRefreshToken,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.WrongRefreshToken)
  }
}

export const emailMfaCodeVerified = async (
  kv: KVNamespace,
  authCode: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.EmailMfaCode,
    authCode,
  )
  const storedCode = await kv.get(key)
  return storedCode && storedCode === '1'
}

export const stampEmailMfaCode = async (
  kv: KVNamespace,
  authCode: string,
  mfaCode: string,
  expiresIn: number,
  isOtpFallback: boolean,
  isSmsFallback: boolean,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.EmailMfaCode,
    authCode,
  )
  const storedCode = await kv.get(key)

  const isValid = storedCode && storedCode === mfaCode

  if (isValid) {
    if (isOtpFallback) {
      const stampKey = adapterConfig.getKVKey(
        adapterConfig.BaseKVKey.OtpMfaCode,
        authCode,
      )

      await kv.put(
        stampKey,
        '1',
        { expirationTtl: expiresIn },
      )
    }

    if (isSmsFallback) {
      const stampKey = adapterConfig.getKVKey(
        adapterConfig.BaseKVKey.SmsMfaCode,
        authCode,
      )

      await kv.put(
        stampKey,
        '1',
        { expirationTtl: expiresIn },
      )
    }

    if (!isOtpFallback && !isSmsFallback) {
      await kv.put(
        key,
        '1',
        { expirationTtl: expiresIn },
      )
    }
  }
  return isValid
}

export const stampSmsMfaCode = async (
  kv: KVNamespace,
  authCode: string,
  mfaCode: string,
  expiresIn: number,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.SmsMfaCode,
    authCode,
  )
  const storedCode = await kv.get(key)

  const isValid = storedCode && storedCode === mfaCode

  if (isValid) {
    await kv.put(
      key,
      '1',
      { expirationTtl: expiresIn },
    )
  }
  return isValid
}

export const storeSmsMfaCode = async (
  kv: KVNamespace,
  authCode: string,
  mfaCode: string,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.SmsMfaCode,
      authCode,
    ),
    mfaCode,
    { expirationTtl: variableConfig.systemConfig.smsMfaCodeExpiresIn },
  )
}

export const storeEmailMfaCode = async (
  kv: KVNamespace,
  authCode: string,
  mfaCode: string,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.EmailMfaCode,
      authCode,
    ),
    mfaCode,
    { expirationTtl: variableConfig.systemConfig.emailMfaCodeExpiresIn },
  )
}

export const smsMfaCodeVerified = async (
  kv: KVNamespace,
  authCode: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.SmsMfaCode,
    authCode,
  )
  const storedCode = await kv.get(key)
  return storedCode && storedCode === '1'
}

export const stampOtpMfaCode = async (
  kv: KVNamespace,
  authCode: string,
  mfaCode: string,
  otpSecret: string,
  expiresIn: number,
) => {
  const otp = await cryptoUtil.genTotp(otpSecret)
  if (otp !== mfaCode) return false

  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.OtpMfaCode,
    authCode,
  )
  await kv.put(
    key,
    '1',
    { expirationTtl: expiresIn },
  )
  return true
}

export const optMfaCodeVerified = async (
  kv: KVNamespace,
  authCode: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.OtpMfaCode,
    authCode,
  )
  const storedCode = await kv.get(key)
  return storedCode && storedCode === '1'
}

export const storePasswordlessCode = async (
  kv: KVNamespace,
  authCode: string,
  mfaCode: string,
  expiresIn: number,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.PasswordlessCode,
      authCode,
    ),
    mfaCode,
    { expirationTtl: expiresIn },
  )
}

export const stampPasswordlessCode = async (
  kv: KVNamespace,
  authCode: string,
  mfaCode: string,
  expiresIn: number,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.PasswordlessCode,
    authCode,
  )
  const storedCode = await kv.get(key)

  const isValid = storedCode && storedCode === mfaCode

  if (isValid) {
    await kv.put(
      key,
      '1',
      { expirationTtl: expiresIn },
    )
  }
  return isValid
}

export const passwordlessCodeVerified = async (
  kv: KVNamespace,
  authCode: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.PasswordlessCode,
    authCode,
  )
  const storedCode = await kv.get(key)
  return storedCode && storedCode === '1'
}

export const storeEmailVerificationCode = async (
  kv: KVNamespace,
  userId: number,
  code: string,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.EmailVerificationCode,
      String(userId),
    ),
    code,
    { expirationTtl: variableConfig.systemConfig.emailVerificationCodeExpiresIn },
  )
}

export const verifyEmailVerificationCode = async (
  kv: KVNamespace,
  userId: number,
  code: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.EmailVerificationCode,
    String(userId),
  )
  const storedCode = await kv.get(key)
  const isValid = storedCode && storedCode === code
  if (isValid) await kv.delete(key)
  return isValid
}

export const storePasswordResetCode = async (
  kv: KVNamespace,
  userId: number,
  code: string,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.PasswordResetCode,
      String(userId),
    ),
    code,
    { expirationTtl: variableConfig.systemConfig.passwordResetCodeExpiresIn },
  )
}

export const verifyPasswordResetCode = async (
  kv: KVNamespace,
  userId: number,
  code: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.PasswordResetCode,
    String(userId),
  )
  const storedCode = await kv.get(key)
  const isValid = storedCode && storedCode === code
  return isValid
}

export const deletePasswordResetCode = async (
  kv: KVNamespace,
  userId: number,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.PasswordResetCode,
    String(userId),
  )
  await kv.delete(key)
}

export const getPasswordResetAttemptsByIP = async (
  kv: KVNamespace,
  email: string,
  ip?: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.PasswordResetAttempts,
    email,
    ip,
  )
  const stored = await kv.get(key)
  return stored ? Number(stored) : 0
}

export const setPasswordResetAttemptsByIP = async (
  kv: KVNamespace,
  email: string,
  ip: string | undefined,
  count: number,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.PasswordResetAttempts,
    email,
    ip,
  )
  await kv.put(
    key,
    String(count),
    { expirationTtl: 86400 },
  )
}

export const getFailedOtpMfaAttemptsByIP = async (
  kv: KVNamespace,
  userId: number,
  ip?: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.FailedOtpMfaAttempts,
    String(userId),
    ip,
  )
  const stored = await kv.get(key)
  return stored ? Number(stored) : 0
}

export const setFailedOtpMfaAttempts = async (
  kv: KVNamespace,
  userId: number,
  ip: string | undefined,
  count: number,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.FailedOtpMfaAttempts,
    String(userId),
    ip,
  )
  await kv.put(
    key,
    String(count),
    { expirationTtl: 1800 },
  )
}

export const getSmsMfaMessageAttemptsByIP = async (
  kv: KVNamespace,
  userId: number,
  ip?: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.SmsMfaMessageAttempts,
    String(userId),
    ip,
  )
  const stored = await kv.get(key)
  return stored ? Number(stored) : 0
}

export const setSmsMfaMessageAttempts = async (
  kv: KVNamespace,
  userId: number,
  ip: string | undefined,
  count: number,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.SmsMfaMessageAttempts,
    String(userId),
    ip,
  )
  await kv.put(
    key,
    String(count),
    { expirationTtl: 1800 },
  )
}

export const getEmailMfaEmailAttemptsByIP = async (
  kv: KVNamespace,
  userId: number,
  ip?: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.EmailMfaEmailAttempts,
    String(userId),
    ip,
  )
  const stored = await kv.get(key)
  return stored ? Number(stored) : 0
}

export const setEmailMfaEmailAttempts = async (
  kv: KVNamespace,
  userId: number,
  ip: string | undefined,
  count: number,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.EmailMfaEmailAttempts,
    String(userId),
    ip,
  )
  await kv.put(
    key,
    String(count),
    { expirationTtl: 1800 },
  )
}

export const getFailedLoginAttemptsByIP = async (
  kv: KVNamespace,
  email: string,
  ip?: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.FailedLoginAttempts,
    email,
    ip,
  )
  const stored = await kv.get(key)
  return stored ? Number(stored) : 0
}

export const setFailedLoginAttempts = async (
  kv: KVNamespace,
  email: string,
  ip: string | undefined,
  count: number,
  expiresIn: number,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.FailedLoginAttempts,
    email,
    ip,
  )
  await kv.put(
    key,
    String(count),
    { expirationTtl: expiresIn || undefined },
  )
}

export const clearFailedLoginAttemptsByIP = async (
  kv: KVNamespace,
  email: string,
  ip?: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.FailedLoginAttempts,
    email,
    ip,
  )
  await kv.delete(key)
}

export const getLockedIPsByEmail = async (
  kv: KVNamespace,
  email: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.FailedLoginAttempts,
    email,
  )
  const stored = await kv.list({ prefix: key })
  const ips = stored.keys.map((storedKey) => {
    return storedKey.name === key
      ? ''
      : storedKey.name.replace(
        `${key}-`,
        '',
      )
  })
  return ips
}

export const deleteLockedIPsByEmail = async (
  kv: KVNamespace,
  email: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.FailedLoginAttempts,
    email,
  )
  const stored = await kv.list({ prefix: key })
  for (const key of stored.keys) {
    await kv.delete(key.name)
  }
}

export const setPasskeyEnrollChallenge = async (
  kv: KVNamespace,
  userId: number,
  challenge: string,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.PasskeyEnrollChallenge,
      String(userId),
    ),
    challenge,
    { expirationTtl: 300 },
  )
}

export const getPasskeyEnrollChallenge = async (
  kv: KVNamespace,
  userId: number,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.PasskeyEnrollChallenge,
    String(userId),
  )
  return await kv.get(key)
}

export const setPasskeyVerifyChallenge = async (
  kv: KVNamespace,
  email: string,
  challenge: string,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.PasskeyVerifyChallenge,
      email,
    ),
    challenge,
    { expirationTtl: 300 },
  )
}

export const getPasskeyVerifyChallenge = async (
  kv: KVNamespace,
  email: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.PasskeyVerifyChallenge,
    email,
  )
  return await kv.get(key)
}

export const storeOidcCodeVerifier = async (
  kv: KVNamespace,
  codeVerifier: string,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.OidcCodeVerifier,
      codeVerifier,
    ),
    '1',
    { expirationTtl: 300 },
  )
}

export const verifyOidcCodeVerifier = async (
  kv: KVNamespace,
  codeVerifier: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.OidcCodeVerifier,
    codeVerifier,
  )
  const storedCode = await kv.get(key)
  const isValid = storedCode && storedCode === '1'
  if (isValid) await kv.delete(key)
  return isValid
}

export const storeChangeEmailCode = async (
  kv: KVNamespace,
  userId: number,
  email: string,
  code: string,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.ChangeEmailCode,
      String(userId),
      email,
    ),
    code,
    { expirationTtl: variableConfig.systemConfig.changeEmailVerificationCodeExpiresIn },
  )
}

export const verifyChangeEmailCode = async (
  kv: KVNamespace,
  userId: number,
  email: string,
  code: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.ChangeEmailCode,
    String(userId),
    email,
  )
  const storedCode = await kv.get(key)
  const isValid = storedCode && storedCode === code
  if (isValid) await kv.delete(key)
  return isValid
}

export const getChangeEmailAttempts = async (
  kv: KVNamespace,
  email: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.ChangeEmailAttempts,
    email,
  )
  const stored = await kv.get(key)
  return stored ? Number(stored) : 0
}

export const setChangeEmailAttempts = async (
  kv: KVNamespace,
  email: string,
  count: number,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.ChangeEmailAttempts,
    email,
  )
  await kv.put(
    key,
    String(count),
    { expirationTtl: 1800 },
  )
}

const thirtyDaysInSeconds = 2592000

export const storeEmailMfaRememberDevice = async (
  kv: KVNamespace,
  userId: number,
  deviceId: string,
  cookieValue: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.EmailMfaRememberDevice,
    String(userId),
    deviceId,
  )

  await kv.put(
    key,
    cookieValue,
    { expirationTtl: thirtyDaysInSeconds },
  )
}

export const verifyEmailMfaRememberDevice = async (
  kv: KVNamespace,
  userId: number,
  cookieValue?: string,
) => {
  if (!cookieValue) return false

  const [deviceId, cookieCode] = cookieValue.split('-')
  if (!deviceId || !cookieCode) return false

  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.EmailMfaRememberDevice,
    String(userId),
    deviceId,
  )
  const storedCode = await kv.get(key)
  const isValid = storedCode && storedCode === cookieCode
  return isValid
}

export const bypassEmailMfa = async (
  kv: KVNamespace,
  authCode: string,
  expiresIn: number,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.EmailMfaCode,
    authCode,
  )
  await kv.put(
    key,
    '1',
    { expirationTtl: expiresIn },
  )
}

export const storeOtpMfaRememberDevice = async (
  kv: KVNamespace,
  userId: number,
  deviceId: string,
  cookieValue: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.OtpMfaRememberDevice,
    String(userId),
    deviceId,
  )

  await kv.put(
    key,
    cookieValue,
    { expirationTtl: thirtyDaysInSeconds },
  )
}

export const verifyOtpMfaRememberDevice = async (
  kv: KVNamespace,
  userId: number,
  cookieValue?: string,
) => {
  if (!cookieValue) return false

  const [deviceId, cookieCode] = cookieValue.split('-')
  if (!deviceId || !cookieCode) return false

  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.OtpMfaRememberDevice,
    String(userId),
    deviceId,
  )
  const storedCode = await kv.get(key)
  const isValid = storedCode && storedCode === cookieCode
  return isValid
}

export const bypassOtpMfa = async (
  kv: KVNamespace,
  authCode: string,
  expiresIn: number,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.OtpMfaCode,
    authCode,
  )
  await kv.put(
    key,
    '1',
    { expirationTtl: expiresIn },
  )
}

export const storeSmsMfaRememberDevice = async (
  kv: KVNamespace,
  userId: number,
  deviceId: string,
  cookieValue: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.SmsMfaRememberDevice,
    String(userId),
    deviceId,
  )

  await kv.put(
    key,
    cookieValue,
    { expirationTtl: thirtyDaysInSeconds },
  )
}

export const verifySmsMfaRememberDevice = async (
  kv: KVNamespace,
  userId: number,
  cookieValue?: string,
) => {
  if (!cookieValue) return false

  const [deviceId, cookieCode] = cookieValue.split('-')
  if (!deviceId || !cookieCode) return false

  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.SmsMfaRememberDevice,
    String(userId),
    deviceId,
  )
  const storedCode = await kv.get(key)
  const isValid = storedCode && storedCode === cookieCode
  return isValid
}

export const bypassSmsMfa = async (
  kv: KVNamespace,
  authCode: string,
  expiresIn: number,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.SmsMfaCode,
    authCode,
  )
  await kv.put(
    key,
    '1',
    { expirationTtl: expiresIn },
  )
}
