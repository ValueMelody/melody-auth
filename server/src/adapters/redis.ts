import fs from 'fs'
import path from 'path'
import { Redis } from 'ioredis'
import { adapterConfig } from 'configs'

let _cache: Redis | null = null

export const initConnection = () => {
  _cache = new Redis(process.env.REDIS_CONNECTION_STRING ?? 'redis://127.0.0.1:6379')
}

const getConnection = (): Redis => {
  if (!_cache) initConnection()
  return _cache!
}

export const fit = () => (
  {
    get: async (key: string) => {
      switch (key) {
      case adapterConfig.BaseKVKey.JwtPublicSecret:
        return fs.readFileSync(
          path.resolve('./node_jwt_public_key.pem'),
          'utf8',
        )
      case adapterConfig.BaseKVKey.JwtPrivateSecret:
        return fs.readFileSync(
          path.resolve('./node_jwt_private_key.pem'),
          'utf8',
        )
      case adapterConfig.BaseKVKey.SessionSecret:
        return fs.readFileSync(
          path.resolve('./node_session_secret'),
          'utf8',
        )
      default: {
        const cache = getConnection()
        return cache.get(key)
      }
      }
    },
    put: async (
      key: string, value: string, option: { expirationTtl: number },
    ) => {
      const cache = getConnection()
      return cache.set(
        key,
        value,
        'EX',
        option.expirationTtl,
      )
    },
    delete: async (key: string) => {
      const cache = getConnection()
      return cache.del(key)
    },
    list: async ({ prefix }: { prefix: string}) => {
      const cache = getConnection()
      const matchedKeys = await cache.keys(`${prefix}*`)
      const results = []
      for (const key of matchedKeys) {
        const value = await cache.get(key)
        results.push({
          name: key,
          value,
        })
      }
      return results
    },
  }
)
