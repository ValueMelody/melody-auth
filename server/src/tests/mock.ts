import fs from 'fs'
import path from 'path'
import Sqlite, { Database } from 'better-sqlite3'

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
