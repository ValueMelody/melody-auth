import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import app from 'index'
import {
  migrate, mock,
} from 'tests/mock'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
})

const BaseRoute = ''

describe(
  'get jwks',
  () => {
    test(
      'should return jwks',
      async () => {
        const res = await app.request(
          `${BaseRoute}/.well-known/jwks.json`,
          {},
          mock(db),
        )
        const json = await res.json() as { keys: any[] }

        expect(json).toStrictEqual({
          keys: [
            {
              kty: 'RSA',
              n: expect.any(String),
              e: 'AQAB',
              alg: 'RS256',
              use: 'sig',
              kid: expect.any(String),
            },
            {
              kty: 'RSA',
              n: expect.any(String),
              e: 'AQAB',
              alg: 'RS256',
              use: 'sig',
              kid: expect.any(String),
            }
          ],
        })
      },
    )
  },
)
