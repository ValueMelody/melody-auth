import {
  errorConfig, adapterConfig, localeConfig,
} from 'configs'

export const getJwtPrivateSecret = async (kv: KVNamespace) => {
  const secretInKv = await kv.get(adapterConfig.BaseKVKey.JwtPrivateSecret)
  if (!secretInKv) throw new errorConfig.Forbidden()
  return secretInKv
}

export const getJwtPublicSecret = async (kv: KVNamespace) => {
  const secretInKv = await kv.get(adapterConfig.BaseKVKey.JwtPublicSecret)
  if (!secretInKv) throw new errorConfig.Forbidden()
  return secretInKv
}

export const storeRefreshToken = async (
  kv: KVNamespace, refreshToken: string, expiresIn: number,
) => {
  await kv.put(
    adapterConfig.getKVKey(
      adapterConfig.BaseKVKey.RefreshToken,
      refreshToken,
    ),
    '1',
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

export const validateRefreshToken = async (
  kv: KVNamespace, refreshToken: string,
) => {
  const tokenInKv = await kv.get(adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.RefreshToken,
    refreshToken,
  ))
  if (!tokenInKv) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongRefreshToken)
  }
}
