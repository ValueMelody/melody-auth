import { readFileSync } from 'fs'
import crypto from 'crypto'
import {
  Context, Next,
} from 'hono'
import { vi } from 'vitest'
import toml from 'toml'
import {
  fetchMock, session,
} from 'tests/mock'

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
  ENVIRONMENT: 'prod',
  DEV_EMAIL_RECEIVER: 'dev@email.com',
}

const mockMiddleware = async (
  c: Context, next: Next,
) => {
  await next()
}

vi.mock(
  'ioredis',
  async () => {
    const IoredisMock = await import('ioredis-mock')
    return { Redis: IoredisMock.default }
  },
)

vi.mock(
  'knex',
  async () => {
    const pgMem = await import('pg-mem')
    const knex = () => {
      const db = pgMem.newDb()
      db.public.registerFunction({
        name: 'gen_random_uuid',
        returns: pgMem.DataType.uuid,
        implementation: () => crypto.randomUUID,
      })
      db.public.registerFunction({
        name: 'random',
        returns: pgMem.DataType.decimal,
        implementation: () => Math.random,
      })
      db.public.registerFunction({
        name: 'md5',
        args: [pgMem.DataType.text],
        returns: pgMem.DataType.text,
        implementation: (text: string) => {
          return crypto.hash(
            'md5',
            text,
          )
        },
      })
      db.public.registerFunction({
        name: 'to_char',
        args: [pgMem.DataType.timestamp, pgMem.DataType.text],
        returns: pgMem.DataType.text,
        implementation: (timestamp) => () => {
          const date = new Date(timestamp)
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            '0',
          )}-${String(date.getDate()).padStart(
            2,
            '0',
          )} ${String(date.getHours()).padStart(
            2,
            '0',
          )}:${String(date.getMinutes()).padStart(
            2,
            '0',
          )}:${String(date.getSeconds()).padStart(
            2,
            '0',
          )}`
        },
      })
      return db.adapters.createKnex(0)
    }

    return { default: knex }
  },
)

vi.mock(
  'middlewares',
  async (importOriginal: Function) => {
    const origin = await importOriginal() as object
    return {
      ...origin,
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
    }
  },
)

global.fetch = fetchMock
