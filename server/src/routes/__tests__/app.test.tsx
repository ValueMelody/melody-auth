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
import { appModel } from 'models'
import {
  adminS2sApp, adminSpaApp, attachIndividualScopes, dbTime,
  getS2sToken,
} from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(() => {
  db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiApps

const createNewApp = async (token?: string) => await app.request(
  BaseRoute,
  {
    method: 'POST',
    body: JSON.stringify({
      name: 'test name',
      type: 'spa',
      scopes: ['profile', 'openid'],
      redirectUris: ['http://localhost:4200', 'http://localhost:4300'],
    }),
    headers: token === '' ? undefined : { Authorization: `Bearer ${token ?? await getS2sToken(db)}` },
  },
  mock(db),
)

const newApp = {
  id: 3,
  clientId: expect.any(String),
  secret: expect.any(String),
  type: 'spa',
  isActive: true,
  name: 'test name',
  scopes: ['openid', 'profile'],
  redirectUris: [
    'http://localhost:4200',
    'http://localhost:4300',
  ],
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

describe(
  'get all',
  () => {
    test(
      'should return all apps',
      async () => {
        const res = await app.request(
          BaseRoute,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { apps: appModel.Record[] }

        expect(json.apps.length).toBe(2)
        expect(json).toStrictEqual({ apps: [adminSpaApp, adminS2sApp] })
      },
    )

    test(
      'should return all apps with read_app scope',
      async () => {
        attachIndividualScopes(db)
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
        const json = await res.json() as { apps: appModel.Record[] }

        expect(json.apps.length).toBe(2)
        expect(json).toStrictEqual({ apps: [adminSpaApp, adminS2sApp] })
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                'write_app',
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(401)

        const res1 = await app.request(
          BaseRoute,
          {},
          mock(db),
        )
        expect(res1.status).toBe(401)
      },
    )
  },
)

describe(
  'get by id',
  () => {
    test(
      'should return app by id 1',
      async () => {
        const res = await app.request(
          `${BaseRoute}/1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          app: {
            ...adminSpaApp,
            scopes: [
              'openid', 'profile', 'offline_access',
            ],
          },
        })
      },
    )

    test(
      'should return app by id 2',
      async () => {
        const res = await app.request(
          `${BaseRoute}/2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          app: {
            ...adminS2sApp,
            scopes: ['root'],
          },
        })
      },
    )

    test(
      'should return 404 when can not find app by id',
      async () => {
        const res = await app.request(
          `${BaseRoute}/3`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        expect(res.status).toBe(404)
      },
    )
  },
)

describe(
  'create',
  () => {
    test(
      'should create app',
      async () => {
        const res = await createNewApp()
        const json = await res.json()

        expect(json).toStrictEqual({ app: newApp })
      },
    )

    test(
      'should create app with write app scope',
      async () => {
        attachIndividualScopes(db)
        const token = await getS2sToken(
          db,
          Scope.WriteApp,
        )
        const res = await createNewApp(token)
        const json = await res.json()

        expect(json).toStrictEqual({ app: newApp })
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        attachIndividualScopes(db)
        const res = await createNewApp(Scope.ReadApp)
        expect(res.status).toBe(401)

        const res1 = await createNewApp('')
        expect(res1.status).toBe(401)
      },
    )
  },
)

describe(
  'update',
  () => {
    test(
      'should update app',
      async () => {
        await createNewApp()
        const updateObj = {
          name: 'test name 1',
          redirectUris: ['http://localhost:5200', 'http://google.com'],
          scopes: ['openid', 'offline_access'],
        }
        const res = await app.request(
          `${BaseRoute}/3`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          app: {
            ...newApp,
            ...updateObj,
          },
        })
      },
    )
  },
)

describe(
  'delete',
  () => {
    test(
      'should delete app',
      async () => {
        await createNewApp()
        const res = await app.request(
          `${BaseRoute}/3`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(204)

        const checkRes = await app.request(
          `${BaseRoute}/3`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        expect(checkRes.status).toBe(404)
      },
    )
  },
)
