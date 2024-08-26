import fs from 'fs'
import path from 'path'
import Sqlite, { Database } from 'better-sqlite3'
import { adapterConfig } from 'configs'

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

export const kv: { [key: string]: string } = {}

export const sessionStore: { [key: string]: string } = {}
export const session = {
  get: (key: string) => sessionStore[key],
  set: (
    key: string, value: string,
  ) => {
    sessionStore[key] = value
  },
}

export const mock = (db: Database) => ({
  DB: {
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
      }
    },
  },
  KV: {
    get: (key: string) => {
      switch (key) {
      case adapterConfig.BaseKVKey.JwtPublicSecret:
        return `
          -----BEGIN PUBLIC KEY-----
          MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyTuKDtxWPXn/ZhRUrnjv
          0seFe+cEstFWbNGtiWnNxTE4vDHHN9rVwMqcI8CXgxfY5l8lxUqn95NCemUTAtd6
          BTCHpJYP4ktrxmez0Sst6PZWJe11QBGhr8qS/4GfOXb86tDiL4oRN7TP2FcRYrVt
          7+UOnZgRh9+9gnxMEXlvyRkasE7TTvSY0kQcbIoZoXc8EuTXLLVNDtx8lXrUepPV
          0JcAWXrRR5FbPL2bX1yNRsho55yiFKW/boazBw8nJpZGauHl8cOJdFQVDl8/ihzA
          +f53EOPiFRfWW+goEVgrfJ/ZsrKpzQGJGTdHBpc+ZGEdfDF2E2czLrxKLdim1E/j
          hQIDAQAB
          -----END PUBLIC KEY-----
        `
      case adapterConfig.BaseKVKey.JwtPrivateSecret:
        return fs.readFileSync(
          path.resolve('src/tests/private_key_mock'),
          'utf8',
        ).replace(
          /\n/g,
          '\r\n',
        )
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
  },
})

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
    const migration = fs.readFileSync(
      filePath,
      'utf8',
    )
    db.exec(migration)
  })

  return db
}
