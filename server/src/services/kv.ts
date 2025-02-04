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
    let stampKey = key
    if (isOtpFallback) {
      stampKey = adapterConfig.getKVKey(
        adapterConfig.BaseKVKey.OtpMfaCode,
        authCode,
      )
    } else if (isSmsFallback) {
      stampKey = adapterConfig.getKVKey(
        adapterConfig.BaseKVKey.SmsMfaCode,
        authCode,
      )
    }

    await kv.put(
      stampKey,
      '1',
      { expirationTtl: expiresIn },
    )
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
  expiresIn: number,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.SmsMfaCode,
      authCode,
    ),
    mfaCode,
    { expirationTtl: expiresIn },
  )
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

export const markSmsMfaVerified = async (
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
  return true
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
    adapterConfig.BaseKVKey.SmsMfaMessageAttempts,
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
    { expirationTtl: 1800 },
  )
}

export const getPasskeyEnrollChallenge = async (
  kv: KVNamespace,
  userId: number,
) => {
  const key = adapterConfig.getKVKey(adapterConfig.BaseKVKey.PasskeyEnrollChallenge, String(userId))
  return await kv.get(key)
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
    { expirationTtl: 7200 },
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
