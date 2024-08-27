import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { Scope } from 'shared'
import app from 'index'
import { routeConfig } from 'configs'
import {
  migrate, mock,
} from 'tests/mock'
import { getS2sToken } from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(() => {
  db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiApps

describe(
  'wrong token',
  () => {
    test(
      'should return 400 using wrong token',
      async () => {
        const res = await app.request(
          BaseRoute,
          { headers: { Authorization: 'Bearer ' } },
          mock(db),
        )
        expect(res.status).toBe(400)

        const res1 = await app.request(
          BaseRoute,
          { headers: { Authorization: 'abc' } },
          mock(db),
        )
        expect(res1.status).toBe(400)
      },
    )

    test(
      'should return 401 when there is no scope',
      async () => {
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadApp,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(401)
      },
    )
  },
)
