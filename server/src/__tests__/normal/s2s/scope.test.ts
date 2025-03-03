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
import { scopeModel } from 'models'
import {
  attachIndividualScopes,
  dbTime, getS2sToken,
} from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
})

const newScopeId = Object.keys(Scope).length + 1

const BaseRoute = routeConfig.InternalRoute.ApiScopes

const createNewScope = async (token?: string) => await app.request(
  BaseRoute,
  {
    method: 'POST',
    headers: token === '' ? undefined : { Authorization: `Bearer ${token ?? await getS2sToken(db)}` },
    body: JSON.stringify({
      name: 'test name',
      type: 'spa',
      note: 'test note',
      locales: [
        {
          locale: 'en', value: 'test en',
        },
        {
          locale: 'fr', value: 'test fr',
        },
      ],
    }),
  },
  mock(db),
)

const newScope = {
  id: newScopeId,
  name: 'test name',
  type: 'spa',
  note: 'test note',
  locales: [
    {
      id: 3,
      scopeId: newScopeId,
      value: 'test en',
      createdAt: dbTime,
      updatedAt: dbTime,
      deletedAt: null,
      locale: 'en',
    },
    {
      id: 4,
      scopeId: newScopeId,
      value: 'test fr',
      createdAt: dbTime,
      updatedAt: dbTime,
      deletedAt: null,
      locale: 'fr',
    },
  ],
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

describe(
  'get all',
  () => {
    test(
      'should return all scopes',
      async () => {
        const res = await app.request(
          BaseRoute,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { scopes: scopeModel.Record[] }
        expect(json.scopes.length).toBe(Object.keys(Scope).length)
        Object.values(Scope).forEach((key) => {
          expect(json.scopes.some((scope) => scope.name === key)).toBeTruthy()
        })
      },
    )

    test(
      'should return all scopes with read_scope scope',
      async () => {
        await attachIndividualScopes(db)
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadScope,
              )}`,
            },
          },
          mock(db),
        )
        const json = await res.json() as { scopes: scopeModel.Record[] }
        expect(json.scopes.length).toBe(Object.keys(Scope).length)
        Object.values(Scope).forEach((key) => {
          expect(json.scopes.some((scope) => scope.name === key)).toBeTruthy()
        })
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        await attachIndividualScopes(db)
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.WriteScope,
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

    test(
      'should return 401 without attach scope to app',
      async () => {
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadScope,
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
      'should return scope by id 1',
      async () => {
        const res = await app.request(
          `${BaseRoute}/1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          scope: {
            id: 1,
            name: 'openid',
            note: '',
            locales: [],
            type: 'spa',
            createdAt: dbTime,
            updatedAt: dbTime,
            deletedAt: null,
          },
        })
      },
    )

    test(
      'should return scope by id 12',
      async () => {
        const res = await app.request(
          `${BaseRoute}/12`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          scope: {
            id: 12,
            name: 'write_role',
            note: expect.any(String),
            locales: [],
            type: 's2s',
            createdAt: dbTime,
            updatedAt: dbTime,
            deletedAt: null,
          },
        })
      },
    )

    test(
      'should return 404 when can not find scope by id',
      async () => {
        const res = await app.request(
          `${BaseRoute}/${newScopeId}`,
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
      'should create scope',
      async () => {
        const res = await createNewScope()
        const json = await res.json()

        expect(json).toStrictEqual({ scope: newScope })
      },
    )

    test(
      'should create scope with write_scope scope',
      async () => {
        await attachIndividualScopes(db)
        const res = await createNewScope(await getS2sToken(
          db,
          Scope.WriteScope,
        ))
        const json = await res.json()

        expect(json).toStrictEqual({ scope: newScope })
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        attachIndividualScopes(db)
        const res = await createNewScope(await getS2sToken(
          db,
          Scope.ReadScope,
        ))
        expect(res.status).toBe(401)

        const res1 = await createNewScope('')
        expect(res1.status).toBe(401)
      },
    )

    test(
      'should return 401 without attach scope to app',
      async () => {
        const res = await createNewScope(await getS2sToken(
          db,
          Scope.WriteScope,
        ))
        expect(res.status).toBe(401)

        const res1 = await createNewScope('')
        expect(res1.status).toBe(401)
      },
    )
  },
)

describe(
  'update',
  () => {
    test(
      'should update scope',
      async () => {
        await createNewScope()
        const updateObj = {
          name: 'test name 1',
          note: '',
          locales: [
            {
              locale: 'en', value: 'test en 1',
            },
            {
              locale: 'fr', value: 'test fr 1',
            },
          ],
        }
        const res = await app.request(
          `${BaseRoute}/${newScopeId}`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          scope: {
            ...newScope,
            ...updateObj,
            locales: [
              {
                id: 5,
                scopeId: newScopeId,
                value: 'test en 1',
                createdAt: dbTime,
                updatedAt: dbTime,
                deletedAt: null,
                locale: 'en',
              },
              {
                id: 6,
                scopeId: newScopeId,
                value: 'test fr 1',
                createdAt: dbTime,
                updatedAt: dbTime,
                deletedAt: null,
                locale: 'fr',
              },
            ],
          },
        })
      },
    )

    test(
      'could only update scope locales',
      async () => {
        await createNewScope()
        const updateObj = {
          locales: [
            {
              locale: 'en', value: 'test en 1',
            },
            {
              locale: 'fr', value: 'test fr 1',
            },
          ],
        }
        const res = await app.request(
          `${BaseRoute}/${newScopeId}`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          scope: {
            ...newScope,
            locales: [
              {
                id: 5,
                scopeId: newScopeId,
                value: 'test en 1',
                createdAt: dbTime,
                updatedAt: dbTime,
                deletedAt: null,
                locale: 'en',
              },
              {
                id: 6,
                scopeId: newScopeId,
                value: 'test fr 1',
                createdAt: dbTime,
                updatedAt: dbTime,
                deletedAt: null,
                locale: 'fr',
              },
            ],
          },
        })
      },
    )

    test(
      'should update scope without affect locale',
      async () => {
        await createNewScope()
        const updateObj = {
          name: 'test name 1',
          note: '',
        }
        const res = await app.request(
          `${BaseRoute}/${newScopeId}`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          scope: {
            ...newScope,
            ...updateObj,
          },
        })
      },
    )

    test(
      'should throw error if scope not found',
      async () => {
        const updateObj = { note: 'test name 1' }
        const res = await app.request(
          `${BaseRoute}/${newScopeId}`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(404)
      },
    )
  },
)

describe(
  'delete',
  () => {
    test(
      'should delete scope',
      async () => {
        await createNewScope()
        const res = await app.request(
          `${BaseRoute}/${newScopeId}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(204)

        const checkRes = await app.request(
          `${BaseRoute}/${newScopeId}`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        expect(checkRes.status).toBe(404)
      },
    )
  },
)
