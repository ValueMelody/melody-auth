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
