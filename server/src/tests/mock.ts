import fs from 'fs'
import path from 'path'
import Sqlite, { Database } from 'better-sqlite3'
import {
  Mock, vi,
} from 'vitest'
import { adapterConfig } from 'configs'
import {
  pgAdapter, redisAdapter,
} from 'adapters'
import { userModel } from 'models'
import { cryptoUtil } from 'utils'

const convertQuery = (
  query: string, params: string[],
) => {
  let prepareQuery = query
  for (let i = 0; i < params.length; i++) {
    prepareQuery = prepareQuery.replace(
      `$${i + 1}`,
      '?',
    )
  }
  return prepareQuery
}

const kv: { [key: string]: string } = {}

export const sessionStore: { [key: string]: string } = {}
export const session = {
  get: (key: string) => sessionStore[key],
  set: (
    key: string, value: string,
  ) => {
    sessionStore[key] = value
  },
}

const kvMock = {
  get: async (key: string) => {
    switch (key) {
    case adapterConfig.BaseKVKey.JwtPublicSecret:
      return fs.readFileSync(
        path.resolve('node_jwt_public_key.pem'),
        'utf8',
      )
    case adapterConfig.BaseKVKey.JwtPrivateSecret:
      return fs.readFileSync(
        path.resolve('node_jwt_private_key.pem'),
        'utf8',
      )
    case adapterConfig.BaseKVKey.SessionSecret:
      return 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    default:
      return kv[key] ?? null
    }
  },
  put: (
    key: string, value: string,
  ) => {
    kv[key] = value
  },
  delete: (key: string) => {
    delete kv[key]
  },
  list: ({ prefix }: { prefix: string}) => {
    const keys = Object.keys(kv)
    return {
      keys: keys.filter((key) => key.includes(prefix))
        .map((key) => ({
          name: key, value: kv[key],
        })),
    }
  },
  empty: () => {
    Object.keys(kv).forEach((key) => delete kv[key])
  },
}

const getDbMock = (db: Database) => ({
  prepare: (query: string) => {
    return {
      bind: (...params: string[]) => ({
        all: async () => {
          const prepareQuery = convertQuery(
            query,
            params,
          )
          const stmt = db.prepare(prepareQuery)
          return { results: stmt.all(...params) }
        },
        first: async () => {
          const prepareQuery = convertQuery(
            query,
            params,
          )
          const stmt = db.prepare(prepareQuery)
          return stmt.get(...params)
        },
        run: async () => {
          const prepareQuery = convertQuery(
            query,
            params,
          )
          const stmt = db.prepare(prepareQuery)
          const result = stmt.run(...params)
          return {
            success: true,
            meta: { last_row_id: result.lastInsertRowid },
          }
        },
      }),
      all: async () => {
        const stmt = db.prepare(query)
        return { results: stmt.all() }
      },
      first: async () => {
        const stmt = db.prepare(query)
        return stmt.get()
      },
    }
  },
}) as D1Database

const isTestingNode = process.env.TEST_MODE === 'node'
export const mockedKV = isTestingNode ? redisAdapter.fit() : kvMock
export const getMockedDB = isTestingNode ? pgAdapter.fit : getDbMock

const formatUser = (raw: userModel.Raw) => ({
  ...raw,
  isActive: Number(raw.isActive),
  emailVerified: Number(raw.emailVerified),
  otpVerified: Number(raw.otpVerified),
  loginCount: Number(raw.loginCount),
})

export const mock = (db: any) => {
  return {
    DB: getMockedDB(db),
    KV: mockedKV,
  }
}

export const migrate = async () => {
  if (isTestingNode) {
    pgAdapter.initConnection()
    const db = await pgAdapter.getConnection()
    const migrationsDir = path.join(
      __dirname,
      '../../migrations/pg',
    )
    const migrationFiles = fs.readdirSync(migrationsDir)
    for (const file of migrationFiles) {
      await db.migrate.up({
        directory: migrationsDir,
        name: file,
      })
    }
    return {
      raw: async (
        query: string, params?: string[],
      ) => {
        const result = await db.raw(
          query,
          params || [],
        )
        const formatted = {
          ...result,
          rows: query.includes(' "user" ') ? result.rows.map((row: userModel.Raw) => formatUser(row)) : result.rows,
        }
        return formatted
      },
      prepare: (query: string) => ({
        run: async (...params: string[]) => {
          return db.raw(
            query,
            params,
          )
        },
        get: async (...params: string[]) => {
          const res = await db.raw(
            `${query} LIMIT 1`,
            params,
          )
          const record = res?.rows[0]
          return query.includes(' "user" ') ? formatUser(record) : record
        },
        all: async (...params: string[]) => {
          const res = await db.raw(
            query,
            params,
          )
          const records = res?.rows
          return query.includes(' "user" ') ? records.map((record: userModel.Raw) => formatUser(record)) : records
        },
      }),
      exec: async (query: string) => db.raw(query),
      close: async () => db.destroy(),
    } as unknown as Database
  }

  const db = new Sqlite(':memory:')

  const migrationsDir = path.join(
    __dirname,
    '../../migrations/sqlite',
  )
  const migrationFiles = fs.readdirSync(migrationsDir)

  migrationFiles.forEach((file) => {
    const filePath = path.join(
      migrationsDir,
      file,
    )

    const migration = fs.readFileSync(
      filePath,
      'utf8',
    )
    db.exec(migration)
  })

  return db
}

export const fetchMock = vi.fn(async (url) => {
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
