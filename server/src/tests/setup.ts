import fs, { readFileSync } from 'fs'
import path from 'path'
import {
  Context, Next,
} from 'hono'
import {
  vi, Mock,
} from 'vitest'
import toml from 'toml'
import { session } from 'tests/mock'
import { cryptoUtil } from 'utils'

const config = toml.parse(readFileSync(
  './wrangler.toml',
  'utf-8',
))

global.process.env = {
  ...global.process.env,
  ...config.vars,
  AUTH_SERVER_URL: 'http://localhost:8787',
  SENDGRID_API_KEY: 'abc',
  SENDGRID_SENDER_ADDRESS: 'app@valuemelody.com',
}

const mockMiddleware = async (
  c: Context, next: Next,
) => {
  await next()
}

vi.mock('ioredis', async () => {
  const IoredisMock = await import('ioredis-mock');
  return {
    Redis: IoredisMock.default,
  }
})

vi.mock(
  'middlewares',
  async (importOriginal: Function) => ({
    ...(await importOriginal() as object),
    setupMiddleware: {
      validOrigin: mockMiddleware,
      session: async (
        c: Context, next: Next,
      ) => {
        c.set(
          'session',
          session,
        )
        await next()
      },
    },
  }),
)

global.fetch = vi.fn(async (url) => {
  if (url === 'https://www.googleapis.com/oauth2/v3/certs') {
    const key = fs.readFileSync(
      path.resolve('node_jwt_public_key.pem'),
      'utf8',
    )
    const jwk = await cryptoUtil.secretToJwk(key)
    return Promise.resolve({
      ok: true,
      json: () => ({
        keys: [
          jwk,
        ],
      }),
    })
  }
  return Promise.resolve({ ok: true })
}) as Mock
