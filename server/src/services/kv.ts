import {
  errorConfig, kvConfig, localeConfig,
} from 'configs'

export const storeRefreshToken = async (
  kv: KVNamespace, refreshToken: string, expiresIn: number,
) => {
  await kv.put(
    kvConfig.getKey(
      kvConfig.BaseKey.RefreshToken,
      refreshToken,
    ),
    '1',
    { expirationTtl: expiresIn },
  )
}

export const invalidRefreshToken = async (
  kv: KVNamespace, refreshToken: string,
) => {
  await kv.delete(kvConfig.getKey(
    kvConfig.BaseKey.RefreshToken,
    refreshToken,
  ))
}

export const validateRefreshToken = async (
  kv: KVNamespace, refreshToken: string,
) => {
  const tokenInKv = await kv.get(kvConfig.getKey(
    kvConfig.BaseKey.RefreshToken,
    refreshToken,
  ))
  if (!tokenInKv) throw new errorConfig.Forbidden(localeConfig.Error.WrongRefreshToken)
}
