import knex from 'knex'

export let _db: knex.Knex | null = null

export const initConnection = () => {
  _db = knex({
    client: 'pg',
    connection: process.env.PG_CONNECTION_STRING,
  })
}

export const getConnection = (): knex.Knex => {
  if (!_db) initConnection()
  return _db!
}

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

export const fit = () => ({
  prepare: (query: string) => ({
    bind: (...params: string[]) => ({
      all: async () => {
        const prepareQuery = convertQuery(
          query,
          params,
        )
        const db = getConnection()
        const results = await db.raw(
          prepareQuery,
          params,
        )
        return { results: results?.rows }
      },
      first: async () => {
        const prepareQuery = convertQuery(
          query,
          params,
        )
        const db = getConnection()
        const result = await db.raw(
          `${prepareQuery} limit 1`,
          params,
        )
        return result?.rows[0]
      },
      run: async () => {
        const prepareQuery = convertQuery(
          query,
          params,
        )
        const db = getConnection()
        const result = await db.raw(
          `${prepareQuery} returning id`,
          params,
        )
        return {
          success: true,
          meta: { last_row_id: result.rows[0]?.id },
        }
      },
    }),
    all: async () => {
      const db = getConnection()
      const results = await db.raw(query)
      return { results: results?.rows }
    },
    first: async () => {
      const db = getConnection()
      const result = await db.raw(`${query} limit 1`)
      return result?.rows[0]
    },
  }),
})
