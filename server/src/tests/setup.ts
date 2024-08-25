import { readFileSync } from 'fs'
import {
  Context, Next,
} from 'hono'
import {
  vi, Mock,
} from 'vitest'
import toml from 'toml'

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

vi.mock(
  'middlewares',
  async (importOriginal: Function) => ({
    ...(await importOriginal() as object),
    authMiddleware: {
      s2sReadRole: mockMiddleware,
      s2sWriteRole: mockMiddleware,
      s2sReadScope: mockMiddleware,
      s2sWriteScope: mockMiddleware,
      s2sReadApp: mockMiddleware,
      s2sWriteApp: mockMiddleware,
      s2sReadUser: mockMiddleware,
      s2sWriteUser: mockMiddleware,
    },
    setupMiddleware: { session: mockMiddleware },
  }),
)

global.fetch = vi.fn(() =>
  Promise.resolve({ ok: true })) as Mock
