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
            MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxRFeP3Q7HHnrrSGb5Cw+
            mOzWuq0OQJ/oTUUflUrgOtugbZZ3uWlnD/BEqDEdetVRi3bhxkWvRsjYzl242rZX
            nkPWs/eLBCUKBrCjkU6ixv/SfG1hGR/C8EJlYzo+2KGjfR5w8xpO93AKATT5jaDH
            4mPE4hxhStEANfi48SyNDwlY8AvDYzjSp/7FOD5VrvhUotdDRuvlLrHW7e6bnBbx
            RMCD4+DY5p8M4S/3P/NneuUTBspl5J9siNcNGCr6Z+8qJagBULVaVPGdcl64fvnc
            n/Zhy5rVeqvhMzD6IAfrsuD+4lJbT8YxqOJdwjU9j0RV/i7yQdwLi1pjc83RuDuq
            gwIDAQAB
            -----END PUBLIC KEY-----
          `
      default:
        return null
      }
    },
    set: () => {},
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
