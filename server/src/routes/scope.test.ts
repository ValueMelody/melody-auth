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
import { dbTime } from 'tests/seed'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(() => {
  db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiScopes

const createNewScope = async () => await app.request(
  BaseRoute,
  {
    method: 'POST',
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
  id: 13,
  name: 'test name',
  type: 'spa',
  note: 'test note',
  locales: [
    {
      id: 3,
      scopeId: 13,
      value: 'test en',
      createdAt: dbTime,
      updatedAt: dbTime,
      deletedAt: null,
      locale: 'en',
    },
    {
      id: 4,
      scopeId: 13,
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
          {},
          mock(db),
        )
        const json = await res.json() as { scopes: scopeModel.Record[] }
        expect(json.scopes.length).toBe(12)
        Object.values(Scope).forEach((key) => {
          expect(json.scopes.some((scope) => scope.name === key)).toBeTruthy()
        })
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
          {},
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
          {},
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
          `${BaseRoute}/13`,
          {},
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
          `${BaseRoute}/13`,
          {
            method: 'PUT', body: JSON.stringify(updateObj),
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
                scopeId: 13,
                value: 'test en 1',
                createdAt: dbTime,
                updatedAt: dbTime,
                deletedAt: null,
                locale: 'en',
              },
              {
                id: 6,
                scopeId: 13,
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
          `${BaseRoute}/13`,
          { method: 'DELETE' },
          mock(db),
        )
        expect(res.status).toBe(204)
      },
    )
  },
)
