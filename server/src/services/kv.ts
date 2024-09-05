import {
  errorConfig, adapterConfig, localeConfig,
  typeConfig,
} from 'configs'
import { cryptoUtil } from 'utils'

export const getSessionSecret = async (kv: KVNamespace): Promise<string> => {
  const secretInKv = await kv.get(adapterConfig.BaseKVKey.SessionSecret)
  if (!secretInKv) throw new errorConfig.Forbidden()
  return secretInKv
}

export const getJwtPrivateSecret = async (kv: KVNamespace): Promise<string> => {
  const secretInKv = await kv.get(adapterConfig.BaseKVKey.JwtPrivateSecret)
  if (!secretInKv) throw new errorConfig.Forbidden()
  return secretInKv
}

export const getJwtPublicSecret = async (kv: KVNamespace): Promise<string> => {
  const secretInKv = await kv.get(adapterConfig.BaseKVKey.JwtPublicSecret)
  if (!secretInKv) throw new errorConfig.Forbidden()
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
): Promise<typeConfig.AuthCodeBody> => {
  const codeInKv = await kv.get(adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.AuthCode,
    authCode,
  ))
  if (!codeInKv) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)
  }
  const codeBody = JSON.parse(codeInKv)
  if (!codeBody) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)
  }
  return codeBody
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
  kv: KVNamespace, refreshToken: string,
): Promise<typeConfig.RefreshTokenBody> => {
  const tokenInKv = await kv.get(adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.RefreshToken,
    refreshToken,
  ))
  if (!tokenInKv) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongRefreshToken)
  }
  const tokenBody = JSON.parse(tokenInKv)
  if (!tokenBody) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongRefreshToken)
  }
  return tokenBody
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

export const markEmailMfaVerified = async (
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
  return true
}

export const stampEmailMfaCode = async (
  kv: KVNamespace,
  authCode: string,
  mfaCode: string,
  expiresIn: number,
  isFallbackOfOtp: boolean,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.EmailMfaCode,
    authCode,
  )
  const storedCode = await kv.get(key)

  const isValid = storedCode && storedCode === mfaCode

  if (isValid) {
    const stampKey = isFallbackOfOtp
      ? adapterConfig.getKVKey(
        adapterConfig.BaseKVKey.OtpMfaCode,
        authCode,
      )
      : key
    await kv.put(
      stampKey,
      '1',
      { expirationTtl: expiresIn },
    )
  }
  return isValid
}

export const storeEmailMfaCode = async (
  kv: KVNamespace,
  authCode: string,
  mfaCode: string,
  expiresIn: number,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.EmailMfaCode,
      authCode,
    ),
    mfaCode,
    { expirationTtl: expiresIn },
  )
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

export const markOtpMfaVerified = async (
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
  return true
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
    { expirationTtl: 7200 },
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
    { expirationTtl: 7200 },
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
  if (isValid) await kv.delete(key)
  return isValid
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
