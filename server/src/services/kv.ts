import {
  errorConfig, adapterConfig, localeConfig,
  typeConfig,
} from 'configs'

export const getSessionSecret = async (kv: KVNamespace): Promise<string> => {
  const secretInKv = await kv.get(adapterConfig.BaseKVKey.sessionSecret)
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
    adapterConfig.BaseKVKey.MFACode,
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
    adapterConfig.BaseKVKey.MFACode,
    authCode,
  )
  await kv.put(
    key,
    '1',
    { expirationTtl: expiresIn },
  )
  return true
}

export const verifyEmailMfaCode = async (
  kv: KVNamespace,
  authCode: string,
  mfaCode: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.MFACode,
    authCode,
  )
  const storedCode = await kv.get(key)

  if (storedCode) {
    await kv.put(
      key,
      '1',
    )
  }
  return storedCode && storedCode === mfaCode
}

export const storeEmailMFACode = async (
  kv: KVNamespace,
  authCode: string,
  mfaCode: string,
  expiresIn: number,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.MFACode,
      authCode,
    ),
    mfaCode,
    { expirationTtl: expiresIn },
  )
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
