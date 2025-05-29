import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { Scope } from '@melody-auth/shared'
import app from 'index'
import {
  messageConfig, routeConfig,
} from 'configs'
import {
  migrate, mock,
} from 'tests/mock'
import {
  attachIndividualScopes,
  dbTime, getS2sToken,
} from 'tests/util'
import { userAttributeModel } from 'models'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiUserAttributes

const createNewUserAttribute = async (token?: string) => await app.request(
  BaseRoute,
  {
    method: 'POST',
    body: JSON.stringify({
      name: 'test name',
      includeInSignUpForm: false,
      requiredInSignUpForm: false,
      includeInIdTokenBody: false,
      includeInUserInfo: false,
    }),
    headers: token === '' ? undefined : { Authorization: `Bearer ${token ?? await getS2sToken(db)}` },
  },
  mock(db),
)

const createNewUserAttribute2 = async (token?: string) => await app.request(
  BaseRoute,
  {
    method: 'POST',
    body: JSON.stringify({
      name: 'test name 1',
      locales: [{
        locale: 'en', value: 'test name en',
      }, {
        locale: 'fr', value: 'test name fr',
      }],
      includeInSignUpForm: true,
      requiredInSignUpForm: true,
      includeInIdTokenBody: true,
      includeInUserInfo: true,
    }),
    headers: token === '' ? undefined : { Authorization: `Bearer ${token ?? await getS2sToken(db)}` },
  },
  mock(db),
)

const newUserAttribute = {
  id: 1,
  name: 'test name',
  locales: [],
  includeInSignUpForm: false,
  requiredInSignUpForm: false,
  includeInIdTokenBody: false,
  includeInUserInfo: false,
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

const newUserAttribute2 = {
  id: 2,
  name: 'test name 1',
  locales: [{
    locale: 'en', value: 'test name en',
  }, {
    locale: 'fr', value: 'test name fr',
  }],
  includeInSignUpForm: true,
  requiredInSignUpForm: true,
  includeInIdTokenBody: true,
  includeInUserInfo: true,
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

describe(
  'get all',
  () => {
    test(
      'should return all user attributes',
      async () => {
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        await createNewUserAttribute()

        await createNewUserAttribute2()

        const res = await app.request(
          BaseRoute,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { userAttributes: userAttributeModel.Record[] }

        expect(json.userAttributes.length).toBe(2)
        expect(json).toStrictEqual({
          userAttributes: [
            newUserAttribute,
            newUserAttribute2,
          ],
        })

        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should return all user attributes with read user scope',
      async () => {
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        await attachIndividualScopes(db)
        await createNewUserAttribute()
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadUser,
              )}`,
            },
          },
          mock(db),
        )
        const json = await res.json() as { userAttributes: userAttributeModel.Record[] }

        expect(json.userAttributes.length).toBe(1)
        expect(json).toStrictEqual({ userAttributes: [newUserAttribute] })

        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        await attachIndividualScopes(db)
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.WriteUser,
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

        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should throw error when ENABLE_USER_ATTRIBUTE is false',
      async () => {
        await attachIndividualScopes(db)
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadUser,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(messageConfig.ConfigError.UserAttributeNotEnabled)
      },
    )
  },
)

describe(
  'get attribute',
  () => {
    test(
      'should return user attribute',
      async () => {
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        await createNewUserAttribute()
        const res = await app.request(
          `${BaseRoute}/1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { userAttribute: userAttributeModel.Record }

        expect(json.userAttribute).toStrictEqual(newUserAttribute)

        await createNewUserAttribute2()
        const res2 = await app.request(
          `${BaseRoute}/2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json2 = await res2.json() as { userAttribute: userAttributeModel.Record }

        expect(json2.userAttribute).toStrictEqual(newUserAttribute2)

        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should return user attribute with read user scope',
      async () => {
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        await attachIndividualScopes(db)
        await createNewUserAttribute()
        const res = await app.request(
          `${BaseRoute}/1`,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadUser,
              )}`,
            },
          },
          mock(db),
        )
        const json = await res.json() as { userAttribute: userAttributeModel.Record }

        expect(json.userAttribute).toStrictEqual(newUserAttribute)

        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        await attachIndividualScopes(db)
        const res = await app.request(
          `${BaseRoute}/1`,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.WriteUser,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(401)

        const res1 = await app.request(
          `${BaseRoute}/1`,
          {},
          mock(db),
        )
        expect(res1.status).toBe(401)

        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should throw error when ENABLE_USER_ATTRIBUTE is false',
      async () => {
        await attachIndividualScopes(db)
        const res = await app.request(
          `${BaseRoute}/1`,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadUser,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(messageConfig.ConfigError.UserAttributeNotEnabled)
      },
    )
  },
)

describe(
  'create',
  () => {
    test(
      'should create user attribute',
      async () => {
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        const res = await createNewUserAttribute()
        const json = await res.json()

        expect(json).toStrictEqual({ userAttribute: newUserAttribute })

        const res2 = await createNewUserAttribute2()
        const json2 = await res2.json()
        expect(json2).toStrictEqual({ userAttribute: newUserAttribute2 })

        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should trigger unique constraint',
      async () => {
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        await createNewUserAttribute()
        const res1 = await createNewUserAttribute()
        expect(res1.status).toBe(500)

        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should create user attribute with enabled',
      async () => {
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        const res = await app.request(
          BaseRoute,
          {
            method: 'POST',
            body: JSON.stringify({
              name: 'test name1',
              includeInSignUpForm: true,
              requiredInSignUpForm: true,
              includeInIdTokenBody: true,
              includeInUserInfo: true,
            }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          userAttribute: {
            ...newUserAttribute,
            name: 'test name1',
            includeInSignUpForm: true,
            requiredInSignUpForm: true,
            includeInIdTokenBody: true,
            includeInUserInfo: true,
          },
        })

        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should create with mixed values',
      async () => {
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        const res = await app.request(
          BaseRoute,
          {
            method: 'POST',
            body: JSON.stringify({
              name: 'test name2',
              includeInSignUpForm: true,
              requiredInSignUpForm: false,
              includeInIdTokenBody: true,
              includeInUserInfo: false,
            }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          userAttribute: {
            ...newUserAttribute,
            name: 'test name2',
            includeInSignUpForm: true,
            requiredInSignUpForm: false,
            includeInIdTokenBody: true,
            includeInUserInfo: false,
          },
        })

        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        const res = await createNewUserAttribute(await getS2sToken(
          db,
          Scope.WriteRole,
        ))
        expect(res.status).toBe(401)

        const res1 = await createNewUserAttribute('')
        expect(res1.status).toBe(401)

        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should throw error when ENABLE_USER_ATTRIBUTE is false',
      async () => {
        await attachIndividualScopes(db)
        const res = await createNewUserAttribute()
        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(messageConfig.ConfigError.UserAttributeNotEnabled)
      },
    )
  },
)

describe(
  'update',
  () => {
    test(
      'should update user attribute',
      async () => {
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        await createNewUserAttribute()
        const updateObj = {
          name: 'test name 1',
          includeInSignUpForm: true,
          requiredInSignUpForm: true,
          includeInIdTokenBody: true,
          includeInUserInfo: true,
        }
        const res = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          userAttribute: {
            ...newUserAttribute,
            ...updateObj,
          },
        })

        const res2 = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify({
              locales: [{
                locale: 'en', value: 'test name en 1',
              }, {
                locale: 'fr', value: 'test name fr 1',
              }],
            }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json2 = await res2.json()

        expect(json2).toStrictEqual({
          userAttribute: {
            ...newUserAttribute,
            ...updateObj,
            locales: [{
              locale: 'en', value: 'test name en 1',
            }, {
              locale: 'fr', value: 'test name fr 1',
            }],
          },
        })

        const res3 = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify({
              locales: [{
                locale: 'en', value: 'test name en 2',
              }, {
                locale: 'fr', value: 'test name fr 2',
              }],
            }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json3 = await res3.json()

        expect(json3).toStrictEqual({
          userAttribute: {
            ...newUserAttribute,
            ...updateObj,
            locales: [{
              locale: 'en', value: 'test name en 2',
            }, {
              locale: 'fr', value: 'test name fr 2',
            }],
          },
        })

        const res4 = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify({
              locales: [{
                locale: 'en', value: 'test name en 3',
              }],
            }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json4 = await res4.json()

        expect(json4).toStrictEqual({
          userAttribute: {
            ...newUserAttribute,
            ...updateObj,
            locales: [{
              locale: 'en', value: 'test name en 3',
            }],
          },
        })

        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should throw error when ENABLE_USER_ATTRIBUTE is false',
      async () => {
        await attachIndividualScopes(db)
        await createNewUserAttribute()
        const res = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify({ name: 'test name 1' }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(messageConfig.ConfigError.UserAttributeNotEnabled)
      },
    )
  },
)

describe(
  'delete',
  () => {
    test(
      'should delete user attribute',
      async () => {
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string
        await createNewUserAttribute()
        const res = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(204)

        const checkRes = await app.request(
          `${BaseRoute}/1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        expect(checkRes.status).toBe(404)

        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should throw error when ENABLE_USER_ATTRIBUTE is false',
      async () => {
        await attachIndividualScopes(db)
        const res = await app.request(
          `${BaseRoute}/1`,
          { method: 'DELETE' },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(messageConfig.ConfigError.UserAttributeNotEnabled)
      },
    )
  },
)
