import fs from 'fs'
import path from 'path'
import Sqlite, { Database } from 'better-sqlite3'
import { adapterConfig } from 'configs'
import { redisAdapter } from 'adapters'

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
  }
}

export const getDbModule = (db: Database) => ({
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

export const mock = (db: Database) => {
  return {
    DB: getDbModule(db),
    KV: mockedKV,
  }
}

export const migrate = async () => {
  const db = new Sqlite(':memory:')

  const migrationsDir = path.join(
    __dirname,
    '../../migrations',
  )
  const migrationFiles = fs.readdirSync(migrationsDir)

  migrationFiles.forEach((file) => {
    const filePath = path.join(
      migrationsDir,
      file,
    )

    if (fs.statSync(filePath).isFile()) {
      const migration = fs.readFileSync(
        filePath,
        'utf8',
      )
      db.exec(migration)
    }
  })

  return db
}
