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
import { userModel } from 'models'

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
  kv: KVNamespace,
  authCode: string,
  options: { allowDelivered?: boolean } = {},
): Promise<typeConfig.AuthCodeBody | false> => {
  const codeInKv = await kv.get(adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.AuthCode,
    authCode,
  ))
  if (!codeInKv) return false
  const codeBody = JSON.parse(codeInKv)
  if (!codeBody) return false
  if (codeBody.isDelivered && !options.allowDelivered) return false
  return codeBody
}

export const getAuthCodeBodyForPolicy = async (
  kv: KVNamespace,
  authCode: string,
  policy: string,
): Promise<typeConfig.AuthCodeBody | false> => {
  const authCodeBody = await getAuthCodeBody(
    kv,
    authCode,
  )

  if (!authCodeBody || authCodeBody.request.policy !== policy) return false

  return authCodeBody
}

export const deleteAuthCode = async (
  kv: KVNamespace,
  authCode: string,
) => {
  await kv.delete(adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.AuthCode,
    authCode,
  ))
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

export const deleteEmbeddedSession = async (
  kv: KVNamespace,
  sessionId: string,
) => {
  await kv.delete(adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.EmbeddedSession,
    sessionId,
  ))
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

const hashSessionId = async (kvKeyName: string): Promise<string> => {
  const data = new TextEncoder().encode(kvKeyName)
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    data,
  )
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(
      2,
      '0',
    ))
    .join('')
}

const getOtpMfaUsedStepKey = (
  userId: number,
  timeStep: number,
) => {
  return adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.OtpMfaUsedStep,
    String(userId),
    String(timeStep),
  )
}

export const listActiveSessionsByUser = async (
  kv: KVNamespace,
  userId: number,
) => {
  const prefix = `${adapterConfig.BaseKVKey.RefreshToken}-${userId}.`
  const { keys } = await kv.list({ prefix })
  const sessions = await Promise.all(keys.map(async (key) => {
    const value = await kv.get(key.name)
    const body: typeConfig.RefreshTokenBody | null = value ? JSON.parse(value) : null
    return {
      sessionId: await hashSessionId(key.name),
      ...body,
    }
  }))
  return sessions
}

export const invalidRefreshTokenBySessionId = async (
  kv: KVNamespace,
  userId: number,
  sessionId: string,
): Promise<boolean> => {
  const prefix = `${adapterConfig.BaseKVKey.RefreshToken}-${userId}.`
  const { keys } = await kv.list({ prefix })
  for (const key of keys) {
    if (await hashSessionId(key.name) === sessionId) {
      await kv.delete(key.name)
      return true
    }
  }
  return false
}

const deleteKeysByPrefix = async (
  kv: KVNamespace,
  prefix: string,
) => {
  let cursor: string | undefined
  do {
    const result = await kv.list({
      prefix, cursor,
    })
    await Promise.all(result.keys.map((key) => kv.delete(key.name)))
    cursor = result.list_complete ? undefined : result.cursor
  } while (cursor)
}

export const invalidRefreshTokensByUser = async (
  kv: KVNamespace,
  userId: number,
) => {
  await deleteKeysByPrefix(
    kv,
    `${adapterConfig.BaseKVKey.RefreshToken}-${userId}.`,
  )
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
  userId: number,
  expiresIn: number,
) => {
  const timeStep = await cryptoUtil.verifyTotp(
    otpSecret,
    mfaCode,
  )
  if (timeStep === null) return false

  const usedStepKey = getOtpMfaUsedStepKey(
    userId,
    timeStep,
  )
  const usedStep = await kv.get(usedStepKey)
  if (usedStep) return false

  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.OtpMfaCode,
    authCode,
  )
  await kv.put(
    usedStepKey,
    '1',
    { expirationTtl: cryptoUtil.totpReplayWindowSeconds },
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

export const storePasswordlessBrowserBinding = async (
  kv: KVNamespace,
  authCode: string,
  bindingValue: string,
  expiresIn: number,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.PasswordlessBrowserBinding,
      authCode,
    ),
    bindingValue,
    { expirationTtl: expiresIn },
  )
}

export const verifyPasswordlessBrowserBinding = async (
  kv: KVNamespace,
  authCode: string,
  bindingValue: string | undefined,
) => {
  if (!bindingValue) return false
  const storedValue = await kv.get(adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.PasswordlessBrowserBinding,
    authCode,
  ))
  return !!storedValue && storedValue === bindingValue
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

export interface CodeAttemptKeys {
  ipKey: string;
  totalKey: string;
}

export type CodeAttemptLock = 'ip' | 'total'

const failedCodeAttemptsExpiresIn = 1800

const getCodeAttemptCount = async (
  kv: KVNamespace,
  key: string,
) => {
  const stored = await kv.get(key)
  return stored ? Number(stored) : 0
}

// Counts the attempt before the code is checked, so a guess is recorded even while it is still being verified.
// KV has no atomic increment, so concurrent attempts can still read the same count; this narrows that race but
// does not close it. A failed write throws, which rejects the attempt before the code is checked.
export const recordCodeAttempt = async (
  kv: KVNamespace,
  keys: CodeAttemptKeys,
  threshold: number,
): Promise<CodeAttemptLock | null> => {
  const [failedAttempts, totalFailedAttempts] = await Promise.all([
    getCodeAttemptCount(
      kv,
      keys.ipKey,
    ),
    getCodeAttemptCount(
      kv,
      keys.totalKey,
    ),
  ])

  if (failedAttempts >= threshold) return 'ip'
  if (totalFailedAttempts >= threshold * variableConfig.systemConfig.codeFailedAttemptsMultiplier) return 'total'

  await Promise.all([
    kv.put(
      keys.ipKey,
      String(failedAttempts + 1),
      { expirationTtl: failedCodeAttemptsExpiresIn },
    ),
    kv.put(
      keys.totalKey,
      String(totalFailedAttempts + 1),
      { expirationTtl: failedCodeAttemptsExpiresIn * variableConfig.systemConfig.codeFailedAttemptsWindowMultiplier },
    ),
  ])

  return null
}

// Clears both counters once the code is verified. KV allows one write per second per key and recordCodeAttempt
// has just written these keys, so a failed delete is ignored: it leaves the attempt counted instead of failing a
// correct code.
export const clearCodeAttempts = async (
  kv: KVNamespace,
  keys: CodeAttemptKeys,
) => {
  await Promise.all([
    kv.delete(keys.ipKey),
    kv.delete(keys.totalKey),
  ]).catch(() => undefined)
}

const getFailedMfaCodeAttemptsKey = (
  userId: number,
  ip?: string,
) => adapterConfig.getKVKey(
  adapterConfig.BaseKVKey.FailedMfaCodeAttempts,
  String(userId),
  ip,
)

export const getEmailMfaCodeAttemptKeys = (
  userId: number,
  authCode: string,
  ip?: string,
): CodeAttemptKeys => ({
  ipKey: getFailedMfaCodeAttemptsKey(
    userId,
    ip,
  ),
  totalKey: adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.TotalFailedEmailMfaCodeAttempts,
    authCode,
  ),
})

export const getSmsMfaCodeAttemptKeys = (
  userId: number,
  authCode: string,
  ip?: string,
): CodeAttemptKeys => ({
  ipKey: getFailedMfaCodeAttemptsKey(
    userId,
    ip,
  ),
  totalKey: adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.TotalFailedSmsMfaCodeAttempts,
    authCode,
  ),
})

export const getPasswordlessCodeAttemptKeys = (
  userId: number,
  authCode: string,
  ip?: string,
): CodeAttemptKeys => ({
  ipKey: getFailedMfaCodeAttemptsKey(
    userId,
    ip,
  ),
  totalKey: adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.TotalFailedPasswordlessCodeAttempts,
    authCode,
  ),
})

// OTP MFA has no per-sign-in code to invalidate, so failures are counted per user instead.
export const getOtpMfaCodeAttemptKeys = (
  userId: number,
  ip?: string,
): CodeAttemptKeys => ({
  ipKey: getFailedMfaCodeAttemptsKey(
    userId,
    ip,
  ),
  totalKey: adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.TotalFailedOtpMfaCodeAttempts,
    String(userId),
  ),
})

export const getPasswordResetCodeAttemptKeys = (
  userId: number,
  ip?: string,
): CodeAttemptKeys => ({
  ipKey: adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.FailedPasswordResetCodeAttempts,
    String(userId),
    ip,
  ),
  totalKey: adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.TotalFailedPasswordResetCodeAttempts,
    String(userId),
  ),
})

export const getChangeEmailCodeAttemptKeys = (
  userId: number,
  email: string,
  ip?: string,
): CodeAttemptKeys => ({
  ipKey: adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.FailedChangeEmailCodeAttempts,
    String(userId),
    ip,
  ),
  totalKey: adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.TotalFailedChangeEmailCodeAttempts,
    String(userId),
    email,
  ),
})

export const getEmailVerificationCodeAttemptKeys = (
  userId: number,
  ip?: string,
): CodeAttemptKeys => ({
  ipKey: adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.FailedEmailVerificationCodeAttempts,
    String(userId),
    ip,
  ),
  totalKey: adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.TotalFailedEmailVerificationCodeAttempts,
    String(userId),
  ),
})

export const getFailedAuthCodeVerifierAttemptsByIP = async (
  kv: KVNamespace,
  userId: number,
  ip?: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.FailedAuthCodeVerifierAttempts,
    String(userId),
    ip,
  )
  const stored = await kv.get(key)
  return stored ? Number(stored) : 0
}

export const setFailedAuthCodeVerifierAttempts = async (
  kv: KVNamespace,
  userId: number,
  ip: string | undefined,
  count: number,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.FailedAuthCodeVerifierAttempts,
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

const listKeyNames = async (
  kv: KVNamespace,
  prefix: string,
) => {
  const names: string[] = []
  let cursor: string | undefined
  do {
    const stored = await kv.list({
      prefix,
      cursor,
    })
    names.push(...stored.keys.map((storedKey) => storedKey.name))
    cursor = stored.list_complete ? undefined : stored.cursor
  } while (cursor)
  return names
}

// Clears the user's per-IP and total code attempt counters. Email MFA, SMS MFA and passwordless totals are kept
// per sign-in rather than per user, so they end with that sign-in and are not cleared here.
export const deleteCodeAttemptsByUser = async (
  kv: KVNamespace,
  userId: number,
) => {
  const userKeys = [
    adapterConfig.BaseKVKey.FailedMfaCodeAttempts,
    adapterConfig.BaseKVKey.FailedPasswordResetCodeAttempts,
    adapterConfig.BaseKVKey.FailedChangeEmailCodeAttempts,
    adapterConfig.BaseKVKey.FailedEmailVerificationCodeAttempts,
    adapterConfig.BaseKVKey.TotalFailedPasswordResetCodeAttempts,
    adapterConfig.BaseKVKey.TotalFailedChangeEmailCodeAttempts,
    adapterConfig.BaseKVKey.TotalFailedEmailVerificationCodeAttempts,
    adapterConfig.BaseKVKey.TotalFailedOtpMfaCodeAttempts,
  ].map((baseKey) => adapterConfig.getKVKey(
    baseKey,
    String(userId),
  ))

  for (const userKey of userKeys) {
    const names = await listKeyNames(
      kv,
      userKey,
    )
    // Keys are "<base>-<userId>" with an optional "-<ip>" or "-<email>" suffix, so skip users whose id only shares
    // the prefix, such as user 11 when clearing user 1.
    for (const name of names) {
      if (name === userKey || name.startsWith(`${userKey}-`)) await kv.delete(name)
    }
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
  challenge: string,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.PasskeyVerifyChallenge,
      challenge,
    ),
    '1',
    { expirationTtl: 300 },
  )
}

export const verifyPasskeyVerifyChallenge = async (
  kv: KVNamespace,
  challenge: string,
) => {
  const key = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.PasskeyVerifyChallenge,
    challenge,
  )
  const stored = await kv.get(key)
  const isValid = stored && stored === '1'
  if (isValid) await kv.delete(key)
  return isValid
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

export const isSamlAssertionConsumed = async (
  kv: KVNamespace,
  assertionId: string,
): Promise<boolean> => {
  const stored = await kv.get(adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.SamlAssertionId,
    assertionId,
  ))
  return stored === '1'
}

export const markSamlAssertionConsumed = async (
  kv: KVNamespace,
  assertionId: string,
  expiresIn: number,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.SamlAssertionId,
      assertionId,
    ),
    '1',
    { expirationTtl: expiresIn },
  )
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

export const invalidMfaRememberDevicesByUser = async (
  kv: KVNamespace,
  userId: number,
  mfaType?: userModel.MfaType,
) => {
  const baseKeys = {
    [userModel.MfaType.Email]: adapterConfig.BaseKVKey.EmailMfaRememberDevice,
    [userModel.MfaType.Otp]: adapterConfig.BaseKVKey.OtpMfaRememberDevice,
    [userModel.MfaType.Sms]: adapterConfig.BaseKVKey.SmsMfaRememberDevice,
  }
  const targetBaseKeys = mfaType ? [baseKeys[mfaType]] : Object.values(baseKeys)
  for (const baseKey of targetBaseKeys) {
    await deleteKeysByPrefix(
      kv,
      `${adapterConfig.getKVKey(
        baseKey,
        String(userId),
      )}-`,
    )
  }
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
