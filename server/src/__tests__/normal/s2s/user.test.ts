import { Database } from 'better-sqlite3'
import { Scope } from '@melody-auth/shared'
import {
  afterEach, beforeEach, describe, expect, Mock, test,
  vi,
} from 'vitest'
import { decode } from 'hono/jwt'
import { exchangeWithAuthToken } from '../oauth.test'
import {
  adapterConfig, localeConfig, messageConfig, routeConfig,
} from 'configs'
import app from 'index'
import {
  userAppConsentModel, userModel,
  userPasskeyModel,
} from 'models'
import {
  emailLogRecord,
  emailResponseMock,
  fetchMock,
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  attachIndividualScopes,
  dbTime, disableUser, enrollEmailMfa, enrollOtpMfa,
  enrollSmsMfa,
  getS2sToken,
} from 'tests/util'
import { oauthDto } from 'dtos'

let db: Database

export const insertUsers = async (db: Database) => {
  await db.exec(`
    INSERT INTO "user"
    ("authId", locale, email, "socialAccountId", "socialAccountType", password, "firstName", "lastName")
    values ('1-1-1-1', 'en', 'test@email.com', null, null, '$2a$10$3HtEAf8YcN94V4GOR6ZBNu9tmoIflmEOqb9hUf0iqS4OjYVKe.9/C', null, null)
  `)
  await db.exec(`
    INSERT INTO "user"
    ("authId", locale, email, "socialAccountId", "socialAccountType", password, "firstName", "lastName")
    values ('1-1-1-2', 'fr', 'test1@email.com', null, null, '$2a$10$Pv1pI5pskwwUXA9hiu3k5.E0Lk6x8PxAyIAhJz3nBZTRkGZTxfPyy', null, null)
  `)
  await db.exec(`
    INSERT INTO user_app_consent
    ("userId", "appId")
    values (1, 1)
  `)
  await db.exec(`
    INSERT INTO user_role
    ("userId", "roleId")
    values (2, 1)
  `)
}

export const user1 = {
  id: 1,
  authId: '1-1-1-1',
  linkedAuthId: null,
  socialAccountId: null,
  socialAccountType: null,
  email: 'test@email.com',
  locale: 'en',
  emailVerified: false,
  otpVerified: false,
  smsPhoneNumberVerified: false,
  mfaTypes: [],
  isActive: true,
  loginCount: 0,
  firstName: null,
  lastName: null,
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

export const user2 = {
  id: 2,
  authId: '1-1-1-2',
  linkedAuthId: null,
  socialAccountId: null,
  socialAccountType: null,
  email: 'test1@email.com',
  locale: 'fr',
  emailVerified: false,
  otpVerified: false,
  smsPhoneNumberVerified: false,
  mfaTypes: [],
  isActive: true,
  loginCount: 0,
  firstName: null,
  lastName: null,
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await mockedKV.empty()
  await db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiUsers

const insertUserAttributes = async (db: Database) => {
  await db.exec(`
    INSERT INTO user_attribute
    (name)
    values ('test 1')
  `)
  await db.exec(`
    INSERT INTO user_attribute
    (name)
    values ('test 2')
  `)
  await db.exec(`
    INSERT INTO user_attribute_value
    ("userId", "userAttributeId", "value")
    values (1, 1, 'test value 1')
  `)
  await db.exec(`
    INSERT INTO user_attribute_value
    ("userId", "userAttributeId", "value")
    values (1, 2, 'test value 2')
  `)
}

describe(
  'get all',
  () => {
    test(
      'should return all users',
      async () => {
        await insertUsers(db)

        const res = await app.request(
          BaseRoute,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { users: userModel.Record[] }
        expect(json.users).toStrictEqual([user1, user2])
      },
    )

    test(
      'could get users by pagination',
      async () => {
        await insertUsers(db)
        await db.exec(`
          INSERT INTO "user"
          ("authId", locale, email, "socialAccountId", "socialAccountType", password, "firstName", "lastName")
          values ('1-1-1-3', 'en', 'test2@email.com', null, null, '$2a$10$Pv1pI5pskwwUXA9hiu3k5.E0Lk6x8PxAyIAhJz3nBZTRkGZTxfPyy', 'first', 'last')
        `)
        await db.exec(`
          INSERT INTO "user"
          ("authId", locale, email, "socialAccountId", "socialAccountType", password, "firstName", "lastName")
          values ('1-1-1-4', 'en', 'test3@email.com', null, null, '$2a$10$Pv1pI5pskwwUXA9hiu3k5.E0Lk6x8PxAyIAhJz3nBZTRkGZTxfPyy', 'another', 'one')
        `)
        await db.exec(`
          INSERT INTO "user"
          ("authId", locale, email, "socialAccountId", "socialAccountType", password, "firstName", "lastName")
          values ('1-1-1-5', 'en', 'test4@email.com', null, null, '$2a$10$Pv1pI5pskwwUXA9hiu3k5.E0Lk6x8PxAyIAhJz3nBZTRkGZTxfPyy', 'other', 'name')
        `)

        const res = await app.request(
          `${BaseRoute}?page_size=2&page_number=1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          users: [user1, user2],
          count: 5,
        })

        const res1 = await app.request(
          `${BaseRoute}?page_size=2&page_number=2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json1 = await res1.json()
        expect(json1).toStrictEqual({
          users: [{
            ...user1,
            id: 3,
            authId: '1-1-1-3',
            email: 'test2@email.com',
            firstName: 'first',
            lastName: 'last',
          }, {
            ...user1,
            id: 4,
            authId: '1-1-1-4',
            email: 'test3@email.com',
            firstName: 'another',
            lastName: 'one',
          }],
          count: 5,
        })

        const res2 = await app.request(
          `${BaseRoute}?page_size=2&page_number=1&search=test`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json2 = await res2.json()
        expect(json2).toStrictEqual({
          users: [user1, user2],
          count: 5,
        })

        const res3 = await app.request(
          `${BaseRoute}?page_size=2&page_number=1&search=test1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json3 = await res3.json()
        expect(json3).toStrictEqual({
          users: [user2],
          count: 1,
        })

        const res4 = await app.request(
          `${BaseRoute}?page_size=2&page_number=1&search=another`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json4 = await res4.json()
        expect(json4).toStrictEqual({
          users: [{
            ...user1,
            id: 4,
            authId: '1-1-1-4',
            email: 'test3@email.com',
            firstName: 'another',
            lastName: 'one',
          }],
          count: 1,
        })

        const res5 = await app.request(
          `${BaseRoute}?page_size=2&page_number=1&search=la`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json5 = await res5.json()
        expect(json5).toStrictEqual({
          users: [{
            ...user1,
            id: 3,
            authId: '1-1-1-3',
            email: 'test2@email.com',
            firstName: 'first',
            lastName: 'last',
          }],
          count: 1,
        })
      },
    )

    test(
      'should return all users with read_user scope',
      async () => {
        await insertUsers(db)
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
        const json = await res.json() as { users: userModel.Record[] }
        expect(json.users).toStrictEqual([user1, user2])
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
      },
    )
  },
)

describe(
  'get by id',
  () => {
    test(
      'should return user by authId 1-1-1-1',
      async () => {
        await insertUsers(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        const json = await res.json() as { user: userModel.Record }
        expect(json.user).toStrictEqual({
          ...user1,
          roles: [],
        })
      },
    )

    test(
      'should return user with attributes',
      async () => {
        global.process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        await insertUsers(db)

        await insertUserAttributes(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        const json = await res.json() as { user: userModel.Record }
        expect(json.user).toStrictEqual({
          ...user1,
          roles: [],
          attributes: {
            'test 1': 'test value 1',
            'test 2': 'test value 2',
          },
        })

        global.process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should not return user with attributes if feature flag is disabled',
      async () => {
        await insertUsers(db)

        await insertUserAttributes(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        const json = await res.json() as { user: userModel.Record }
        expect(json.user).toStrictEqual({
          ...user1,
          roles: [],
        })
      },
    )

    test(
      'should return user with org info',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await db.exec('insert into "org" (name, slug, "termsLink", "privacyPolicyLink") values (\'test\', \'default\', \'https://google1.com\', \'https://microsoft1.com\')')

        await insertUsers(db)

        await db.prepare('update "user" set "orgSlug" = ?').run('default')

        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        const json = await res.json() as { user: userModel.Record }
        expect(json.user).toStrictEqual({
          ...user1,
          roles: [],
          org: {
            name: 'test',
            slug: 'default',
            id: 1,
          },
        })

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return user by authId 1-1-1-2',
      async () => {
        await insertUsers(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { user: userModel.Record }
        expect(json.user).toStrictEqual({
          ...user2,
          roles: ['super_admin'],
        })
      },
    )

    test(
      'should return 404 when can not find user by id',
      async () => {
        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        expect(res.status).toBe(404)
      },
    )
  },
)

describe(
  'get locked ips',
  () => {
    test(
      'should return all locked ips',
      async () => {
        await insertUsers(db)
        await mockedKV.put(
          `${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com-1.1.1.1`,
          '1',
        )
        await mockedKV.put(
          `${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com-1.1.1.2`,
          '2',
        )

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/locked-ips`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { lockedIPs: string[] }
        expect(json.lockedIPs).toStrictEqual(['1.1.1.1', '1.1.1.2'])
      },
    )

    test(
      'placeholder test for user has no email',
      async () => {
        await insertUsers(db)
        await db.prepare('update "user" set email = ?').run(null)
        const res = await app.request(
          `${BaseRoute}/1-1-1-1/locked-ips`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { lockedIPs: string[] }
        expect(json.lockedIPs).toStrictEqual([])
      },
    )
  },
)

describe(
  'delete locked ips',
  () => {
    test(
      'should delete all locked ips',
      async () => {
        await insertUsers(db)
        mockedKV.put(
          `${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com-1.1.1.1`,
          '1',
        )
        mockedKV.put(
          `${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com-1.1.1.2`,
          '2',
        )

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/locked-ips`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )

        expect(res.status).toBe(204)

        const checkRes = await app.request(
          `${BaseRoute}/1-1-1-1/locked-ips`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const checkJson = await checkRes.json() as { lockedIPs: string[] }
        expect(checkJson.lockedIPs).toStrictEqual([])
      },
    )

    test(
      'placeholder test for user has no email',
      async () => {
        await insertUsers(db)
        db.prepare('update "user" set email = ?').run(null)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/locked-ips`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(204)
      },
    )
  },
)

describe(
  'update',
  () => {
    test(
      'should update user',
      async () => {
        await insertUsers(db)
        await db.prepare('insert into role (name) values (?)').run('test')

        const updateObj = {
          locale: 'fr',
          isActive: false,
          firstName: 'First',
          lastName: 'Last',
          roles: ['test'],
        }
        const res = await app.request(
          `${BaseRoute}/1-1-1-2`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          user: {
            ...user2,
            ...updateObj,
          },
        })

        const res1 = await app.request(
          `${BaseRoute}/1-1-1-2`,
          {
            method: 'PUT',
            body: JSON.stringify({ isActive: true }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json1 = await res1.json()

        expect(json1).toStrictEqual({
          user: {
            ...user2,
            ...updateObj,
            isActive: true,
          },
        })
      },
    )

    test(
      'should update user attributes',
      async () => {
        global.process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        await insertUsers(db)
        await insertUserAttributes(db)

        await db.exec(`
          INSERT INTO user_attribute (name)
          values ('test 3')
        `)
        await db.exec(`
          INSERT INTO user_attribute_value ("userId", "userAttributeId", "value")
          values (1, 3, 'test value 3')
        `)
        await db.exec(`
          INSERT INTO user_attribute (name)
          values ('test 4')
        `)

        const updateObj = {
          locale: 'fr',
          isActive: false,
          firstName: 'First',
          lastName: 'Last',
          roles: ['test'],
        }
        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {
            method: 'PUT',
            body: JSON.stringify({
              ...updateObj,
              attributes: {
                1: 'test new value 1',
                2: null,
                3: 'test value 3',
                4: 'test value 4',
              },
            }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          user: {
            ...user1,
            ...updateObj,
            attributes: {
              'test 1': 'test new value 1',
              'test 3': 'test value 3',
              'test 4': 'test value 4',
            },
          },
        })

        const attributeValues = await db.prepare('select * from "user_attribute_value" order by id asc').all()
        expect(attributeValues).toStrictEqual([
          {
            id: 1,
            userId: 1,
            userAttributeId: 1,
            value: 'test new value 1',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deletedAt: null,
          },
          {
            id: 2,
            userId: 1,
            userAttributeId: 2,
            value: 'test value 2',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deletedAt: expect.any(String),
          },
          {
            id: 3,
            userId: 1,
            userAttributeId: 3,
            value: 'test value 3',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deletedAt: null,
          },
          {
            id: 4,
            userId: 1,
            userAttributeId: 4,
            value: 'test value 4',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deletedAt: null,
          },
        ])

        global.process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should not update if feature flag is disabled',
      async () => {
        await insertUsers(db)
        await insertUserAttributes(db)

        await db.prepare('insert into user_attribute (name) values (?)').run('test 3')
        await db.prepare('insert into user_attribute_value ("userId", "userAttributeId", "value") values (?, ?, ?)').run(
          1,
          3,
          'test value 3',
        )

        const updateObj = {
          locale: 'fr',
          isActive: false,
          firstName: 'First',
          lastName: 'Last',
          roles: ['test'],
        }
        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {
            method: 'PUT',
            body: JSON.stringify({
              ...updateObj,
              attributes: {
                1: 'test new value 1',
                2: null,
                3: 'test value 3',
              },
            }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        const attributeValues = await db.prepare('select * from user_attribute_value order by id asc').all()
        expect(attributeValues).toStrictEqual([
          {
            id: 1,
            userId: 1,
            userAttributeId: 1,
            value: 'test value 1',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deletedAt: null,
          },
          {
            id: 2,
            userId: 1,
            userAttributeId: 2,
            value: 'test value 2',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deletedAt: null,
          },
          {
            id: 3,
            userId: 1,
            userAttributeId: 3,
            value: 'test value 3',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deletedAt: null,
          },
        ])

        expect(json).toStrictEqual({
          user: {
            ...user1,
            ...updateObj,
          },
        })
      },
    )

    test(
      'should update user and get org info',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await db.prepare('insert into role (name) values (?)').run('test')

        await db.prepare('insert into "org" (name, slug) values (?, ?)').run(
          'test',
          'test',
        )

        const updateObj = {
          locale: 'fr',
          isActive: false,
          firstName: 'First',
          lastName: 'Last',
          roles: ['test'],
        }
        const res = await app.request(
          `${BaseRoute}/1-1-1-2`,
          {
            method: 'PUT',
            body: JSON.stringify({
              ...updateObj,
              orgSlug: 'test',
            }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          user: {
            ...user2,
            ...updateObj,
            org: {
              name: 'test',
              slug: 'test',
              id: 1,
            },
          },
        })

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'return null if can not find user org by slug',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string
        await insertUsers(db)
        await db.prepare('insert into role (name) values (?)').run('test')

        await db.prepare('update "user" set "orgSlug" = ?').run('test')

        const updateObj = {
          locale: 'fr',
          isActive: false,
          firstName: 'First',
          lastName: 'Last',
          roles: ['test'],
        }
        const res = await app.request(
          `${BaseRoute}/1-1-1-2`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          user: {
            ...user2,
            ...updateObj,
            org: null,
          },
        })

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if no user found',
      async () => {
        await insertUsers(db)
        await db.prepare('insert into role (name) values (?)').run('test')

        const res = await app.request(
          `${BaseRoute}/1-1-1-3`,
          {
            method: 'PUT',
            body: JSON.stringify({}),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoUser)
      },
    )

    test(
      'return when nothing updated',
      async () => {
        await insertUsers(db)
        await db.prepare('insert into role (name) values (?)').run('test')

        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {
            method: 'PUT',
            body: JSON.stringify({}),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          user: {
            ...user1,
            roles: [],
          },
        })
      },
    )

    test(
      'should update user with write_user scope',
      async () => {
        await insertUsers(db)
        await attachIndividualScopes(db)

        const updateObj = {
          firstName: 'First',
          lastName: 'Last',
        }
        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.WriteUser,
              )}`,
            },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          user: {
            ...user1,
            ...updateObj,
            roles: [],
          },
        })
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        await insertUsers(db)
        await attachIndividualScopes(db)

        const updateObj = { locale: 'fr' }
        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadUser,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(401)

        const res1 = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
          },
          mock(db),
        )
        expect(res1.status).toBe(401)
      },
    )
  },
)

describe(
  'send verification email',
  () => {
    test(
      'should send email',
      async () => {
        await insertUsers(db)

        const mockFetch = emailResponseMock
        global.fetch = mockFetch as Mock

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/verify-email`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({ success: true })

        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`) ?? ''
        expect(code.length).toBe(6)

        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(body).toContain(code)
        expect(body).toContain(localeConfig.emailVerificationEmail.verify.en)
        expect(body).toContain('/identity/v1/view/verify-email?id=1-1-1-1&amp;locale=en')

        const logs = await db.prepare('select * from email_log').all()
        expect(logs.length).toBe(0)

        global.fetch = fetchMock
      },
    )

    test(
      'could log email',
      async () => {
        global.process.env.ENABLE_EMAIL_LOG = true as unknown as string
        await insertUsers(db)

        const mockFetch = emailResponseMock
        global.fetch = mockFetch as Mock

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/verify-email`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({ success: true })

        const logs = await db.prepare('select * from email_log').all()
        expect(logs.length).toBe(1)
        expect(logs[0]).toStrictEqual(emailLogRecord)

        global.fetch = fetchMock
        global.process.env.ENABLE_EMAIL_LOG = false as unknown as string
      },
    )

    test(
      'could log email when failed',
      async () => {
        global.process.env.ENABLE_EMAIL_LOG = true as unknown as string
        await insertUsers(db)

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({
            ok: false, text: () => {}, status: 400, statusText: 'wrong request',
          })
        })
        global.fetch = mockFetch as Mock

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/verify-email`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({ success: true })

        const logs = await db.prepare('select * from email_log').all()
        expect(logs.length).toBe(1)
        expect(logs[0]).toStrictEqual({
          ...emailLogRecord,
          success: 0,
          response: '{"status":400,"statusText":"wrong request"}',
        })

        global.fetch = fetchMock
        global.process.env.ENABLE_EMAIL_LOG = false as unknown as string
      },
    )

    test(
      'pass through if failed to send email',
      async () => {
        await insertUsers(db)

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: false })
        })
        global.fetch = mockFetch as Mock

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/verify-email`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({ success: true })

        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`) ?? ''
        expect(code.length).toBeFalsy()
        global.fetch = fetchMock
      },
    )

    test(
      'throw error if no email sender set',
      async () => {
        process.env.SENDGRID_API_KEY = ''
        process.env.SENDGRID_SENDER_ADDRESS = ''

        await insertUsers(db)

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: false })
        })
        global.fetch = mockFetch as Mock

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/verify-email`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.NoEmailSender)

        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`) ?? ''
        expect(code).toBeFalsy()
        global.fetch = fetchMock
        process.env.SENDGRID_API_KEY = 'abc'
        process.env.SENDGRID_SENDER_ADDRESS = 'app@valuemelody.com'
      },
    )

    test(
      'should throw error if user has no email',
      async () => {
        await insertUsers(db)
        await db.prepare('update "user" set "email" = ?').run(null)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/verify-email`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.SocialAccountNotSupported)
      },
    )

    test(
      'should throw error if email already verified',
      async () => {
        await insertUsers(db)
        await db.prepare('update "user" set "emailVerified" = ?').run(1)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/verify-email`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.EmailAlreadyVerified)
      },
    )
  },
)

describe(
  'delete',
  () => {
    test(
      'should delete user',
      async () => {
        await insertUsers(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(204)

        const checkRes = await app.request(
          `${BaseRoute}/1-1-1-1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        expect(checkRes.status).toBe(404)
      },
    )

    test(
      'should throw error if can not find user',
      async () => {
        await insertUsers(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-3`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoUser)
      },
    )
  },
)

describe(
  'get user app consents',
  () => {
    test(
      'should return user app consents',
      async () => {
        await insertUsers(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/consented-apps`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { consentedApps: userAppConsentModel.ConsentedApp[] }
        expect(json.consentedApps).toStrictEqual([{
          appId: 1,
          appName: 'Admin Panel (SPA)',
        }])
      },
    )

    test(
      'should throw error if user not found',
      async () => {
        await insertUsers(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-3/consented-apps`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoUser)
      },
    )
  },
)

describe(
  'delete app consent',
  () => {
    test(
      'should delete app consent',
      async () => {
        await insertUsers(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/consented-apps/1`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(204)

        const checkRes = await app.request(
          `${BaseRoute}/1-1-1-1/consented-apps`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const checkJson = await checkRes.json() as { consentedApps: userAppConsentModel.ConsentedApp[] }
        expect(checkJson.consentedApps).toStrictEqual([])
      },
    )
  },
)

describe(
  'enroll email mfa',
  () => {
    const enrollAndCheckUser = async () => {
      await insertUsers(db)

      const res = await app.request(
        `${BaseRoute}/1-1-1-1/email-mfa`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
        },
        mock(db),
      )
      expect(res.status).toBe(204)

      const userRes = await app.request(
        `${BaseRoute}/1-1-1-1`,
        { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
        mock(db),
      )
      return userRes
    }

    test(
      'should enroll email mfa',
      async () => {
        const userRes = await enrollAndCheckUser()

        const userJson = await userRes.json() as { user: userModel.Record }
        expect(userJson.user.mfaTypes).toStrictEqual(['email'])
      },
    )

    test(
      'if email is enforced by config',
      async () => {
        global.process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string
        const userRes = await enrollAndCheckUser()

        const userJson = await userRes.json() as { user: userModel.Record }
        expect(userJson.user.mfaTypes).toStrictEqual([])
        global.process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'if user already enrolled with email',
      async () => {
        await insertUsers(db)
        await db.prepare('update "user" set "mfaTypes" = ?').run('email')

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/email-mfa`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(204)

        const userRes = await app.request(
          `${BaseRoute}/1-1-1-1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const userJson = await userRes.json() as { user: userModel.Record }
        expect(userJson.user.mfaTypes).toStrictEqual(['email'])
      },
    )

    test(
      'should throw error for wrong id',
      async () => {
        await insertUsers(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-3/email-mfa`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoUser)
      },
    )

    test(
      'should throw error for inactive user',
      async () => {
        await insertUsers(db)
        await disableUser(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/email-mfa`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.UserDisabled)
      },
    )
  },
)

describe(
  'Unenroll email mfa',
  () => {
    const handleUnenrollRequest = async () => {
      const res = await app.request(
        `${BaseRoute}/1-1-1-1/email-mfa`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
        },
        mock(db),
      )
      expect(res.status).toBe(204)

      const userRes = await app.request(
        `${BaseRoute}/1-1-1-1`,
        { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
        mock(db),
      )

      const userJson = await userRes.json() as { user: userModel.Record }
      expect(userJson.user.mfaTypes).toStrictEqual([])
    }

    test(
      'should unenroll email mfa',
      async () => {
        await insertUsers(db)
        await enrollEmailMfa(db)

        await handleUnenrollRequest()
      },
    )

    test(
      'if user is not enrolled',
      async () => {
        insertUsers(db)
        await handleUnenrollRequest()
      },
    )

    test(
      'should throw error for wrong id',
      async () => {
        await insertUsers(db)
        await enrollEmailMfa(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-3/email-mfa`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoUser)
      },
    )

    test(
      'should throw error for inactive user',
      async () => {
        await insertUsers(db)
        await enrollEmailMfa(db)
        await disableUser(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/email-mfa`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.UserDisabled)
      },
    )
  },
)

describe(
  'enroll otp mfa',
  () => {
    const enrollAndCheckUser = async () => {
      await insertUsers(db)

      await app.request(
        `${BaseRoute}/1-1-1-1/otp-mfa`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
        },
        mock(db),
      )

      const userRes = await app.request(
        `${BaseRoute}/1-1-1-1`,
        { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
        mock(db),
      )
      return userRes
    }

    test(
      'should enroll otp mfa',
      async () => {
        const userRes = await enrollAndCheckUser()

        const userJson = await userRes.json() as { user: userModel.Record }
        expect(userJson.user.mfaTypes).toStrictEqual(['otp'])
      },
    )

    test(
      'if otp is enforced by config',
      async () => {
        global.process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        const userRes = await enrollAndCheckUser()

        const userJson = await userRes.json() as { user: userModel.Record }
        expect(userJson.user.mfaTypes).toStrictEqual([])
        global.process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
      },
    )
  },
)

describe(
  'Unenroll otp mfa',
  () => {
    const handleUnenrollCheck = async () => {
      const res = await app.request(
        `${BaseRoute}/1-1-1-1/otp-mfa`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
        },
        mock(db),
      )
      expect(res.status).toBe(204)

      const userRes = await app.request(
        `${BaseRoute}/1-1-1-1`,
        { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
        mock(db),
      )

      const userJson = await userRes.json() as { user: userModel.Record }
      expect(userJson.user.mfaTypes).toStrictEqual([])
    }

    test(
      'should unenroll otp mfa',
      async () => {
        await insertUsers(db)
        await enrollOtpMfa(db)

        await handleUnenrollCheck()
      },
    )

    test(
      'If user is not enrolled',
      async () => {
        await insertUsers(db)
        await handleUnenrollCheck()
      },
    )
  },
)

describe(
  'enroll sms mfa',
  () => {
    const enrollAndCheckUser = async () => {
      await insertUsers(db)

      await app.request(
        `${BaseRoute}/1-1-1-1/sms-mfa`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
        },
        mock(db),
      )

      const userRes = await app.request(
        `${BaseRoute}/1-1-1-1`,
        { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
        mock(db),
      )
      return userRes
    }

    test(
      'should enroll sms mfa',
      async () => {
        const userRes = await enrollAndCheckUser()

        const userJson = await userRes.json() as { user: userModel.Record }
        expect(userJson.user.mfaTypes).toStrictEqual(['sms'])
      },
    )

    test(
      'if sms is enforced by config',
      async () => {
        global.process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        const userRes = await enrollAndCheckUser()

        const userJson = await userRes.json() as { user: userModel.Record }
        expect(userJson.user.mfaTypes).toStrictEqual([])
        global.process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
      },
    )
  },
)

describe(
  'Unenroll sms mfa',
  () => {
    const handleUnenrollCheck = async () => {
      const res = await app.request(
        `${BaseRoute}/1-1-1-1/sms-mfa`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
        },
        mock(db),
      )
      expect(res.status).toBe(204)

      const userRes = await app.request(
        `${BaseRoute}/1-1-1-1`,
        { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
        mock(db),
      )

      const userJson = await userRes.json() as { user: userModel.Record }
      expect(userJson.user.mfaTypes).toStrictEqual([])
    }

    test(
      'should unenroll sms mfa',
      async () => {
        await insertUsers(db)
        await enrollSmsMfa(db)

        await handleUnenrollCheck()
      },
    )

    test(
      'If user is not enrolled',
      async () => {
        await insertUsers(db)
        await handleUnenrollCheck()
      },
    )
  },
)

describe(
  'link account',
  () => {
    test(
      'should linking account',
      async () => {
        await insertUsers(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/account-linking/1-1-1-2`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )

        expect(res.status).toBe(200)
        expect(await res.json()).toStrictEqual({ success: true })

        const user1Res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        const user2Res = await app.request(
          `${BaseRoute}/1-1-1-2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        const user1Json = await user1Res.json() as { user: userModel.Record }
        const user2Json = await user2Res.json() as { user: userModel.Record }
        expect(user1Json.user.linkedAuthId).toBe('1-1-1-2')
        expect(user2Json.user.linkedAuthId).toBe('1-1-1-1')
      },
    )

    test(
      'should throw error if account already linked',
      async () => {
        await insertUsers(db)
        await db.exec(`
          INSERT INTO "user"
          ("authId", locale, email, "socialAccountId", "socialAccountType", password, "firstName", "lastName")
          values ('1-1-1-3', 'en', 'test1@email.com', null, null, '$2a$10$3HtEAf8YcN94V4GOR6ZBNu9tmoIflmEOqb9hUf0iqS4OjYVKe.9/C', null, null)
        `)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/account-linking/1-1-1-2`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )

        expect(res.status).toBe(200)
        expect(await res.json()).toStrictEqual({ success: true })

        const res1 = await app.request(
          `${BaseRoute}/1-1-1-1/account-linking/1-1-1-3`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res1.status).toBe(400)
        expect(await res1.text()).toBe(messageConfig.RequestError.UserAlreadyLinked)

        const res2 = await app.request(
          `${BaseRoute}/1-1-1-3/account-linking/1-1-1-1`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res2.status).toBe(400)
        expect(await res2.text()).toBe(messageConfig.RequestError.TargetUserAlreadyLinked)
      },
    )
  },
)

describe(
  'unlink account',
  () => {
    test(
      'should unlinking account',
      async () => {
        await insertUsers(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/account-linking/1-1-1-2`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(200)
        expect(await res.json()).toStrictEqual({ success: true })

        const unlinkRes = await app.request(
          `${BaseRoute}/1-1-1-1/account-linking`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(unlinkRes.status).toBe(200)
        expect(await unlinkRes.json()).toStrictEqual({ success: true })

        const user1Res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        const user2Res = await app.request(
          `${BaseRoute}/1-1-1-2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        const user1Json = await user1Res.json() as { user: userModel.Record }
        const user2Json = await user2Res.json() as { user: userModel.Record }
        expect(user1Json.user.linkedAuthId).toBe(null)
        expect(user2Json.user.linkedAuthId).toBe(null)
      },
    )
  },
)

describe(
  'get user passkeys',
  () => {
    test(
      'should return user passkeys',
      async () => {
        await insertUsers(db)

        await db.exec(`
          INSERT INTO "user_passkey"
          ("userId", "credentialId", "publicKey", "counter")
          values (1, 'abc', 'def', 1)
        `)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/passkeys`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { passkeys: userPasskeyModel.Record[] }
        expect(json.passkeys).toStrictEqual([{
          id: 1,
          credentialId: 'abc',
          counter: 1,
          createdAt: dbTime,
          updatedAt: dbTime,
          deletedAt: null,
        }])

        const res2 = await app.request(
          `${BaseRoute}/1-1-1-2/passkeys`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json2 = await res2.json() as { passkeys: userPasskeyModel.Record[] }
        expect(json2.passkeys).toStrictEqual([])
      },
    )

    test(
      'should throw error if user not found',
      async () => {
        await insertUsers(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-3/passkeys`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoUser)
      },
    )
  },
)

describe(
  'delete passkey',
  () => {
    test(
      'should delete user passkey',
      async () => {
        await insertUsers(db)

        await db.exec(`
          INSERT INTO "user_passkey"
          ("userId", "credentialId", "publicKey", "counter")
          values (1, 'abc', 'def', 1)
        `)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/passkeys/1`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(204)

        const checkRes = await app.request(
          `${BaseRoute}/1-1-1-1/passkeys`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const checkJson = await checkRes.json() as { passkeys: userPasskeyModel.Record[] }
        expect(checkJson.passkeys).toStrictEqual([])
      },
    )
  },
)

describe(
  'impersonate user',
  () => {
    test(
      'should impersonate user',
      async () => {
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await insertUsers(db)
        db.exec('delete from "user_role"')
        db.exec('insert into "user_role" ("userId", "roleId") values (1, 1)')

        const adminUser = await exchangeWithAuthToken(db)
        const adminUserRes = await adminUser.json() as { access_token: string }

        const res = await app.request(
          `${BaseRoute}/1-1-1-2/impersonation/1`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
            body: JSON.stringify({ impersonatorToken: adminUserRes.access_token }),
          },
          mock(db),
        )
        expect(res.status).toBe(200)
        const result = await res.json() as { refresh_token: string }
        expect(result).toHaveProperty('refresh_token')

        const body = {
          grant_type: oauthDto.TokenGrantType.RefreshToken,
          refresh_token: result.refresh_token,
        }

        const refreshTokenRes = await app.request(
          routeConfig.OauthRoute.Token,
          {
            method: 'POST',
            body: new URLSearchParams(body).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        const refreshRes = await refreshTokenRes.json() as { access_token: string }
        expect(refreshRes).toStrictEqual({
          access_token: expect.any(String),
          expires_in: 1800,
          expires_on: expect.any(Number),
          token_type: 'Bearer',
        })

        expect(decode(refreshRes.access_token)).toStrictEqual({
          header: {
            alg: 'RS256',
            typ: 'JWT',
            kid: expect.any(String),
          },
          payload: {
            sub: '1-1-1-2',
            azp: expect.any(String),
            iss: 'http://localhost:8787',
            scope: 'offline_access profile',
            iat: expect.any(Number),
            exp: expect.any(Number),
            roles: [],
            impersonatedBy: '1-1-1-1',
          },
        })

        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error if no impersonatorToken provided',
      async () => {
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await insertUsers(db)
        db.exec('delete from "user_role"')
        db.exec('insert into "user_role" ("userId", "roleId") values (1, 1)')

        const res = await app.request(
          `${BaseRoute}/1-1-1-2/impersonation/1`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
            body: JSON.stringify({}),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.impersonatorTokenIsRequired)

        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error if impersonator is not super admin',
      async () => {
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await insertUsers(db)
        db.exec('delete from "user_role"')

        const adminUser = await exchangeWithAuthToken(db)
        const adminUserRes = await adminUser.json() as { access_token: string }

        const res = await app.request(
          `${BaseRoute}/1-1-1-2/impersonation/1`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
            body: JSON.stringify({ impersonatorToken: adminUserRes.access_token }),
          },
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.impersonatorIsNotSuperAdmin)

        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error if impersonate non-SPA app',
      async () => {
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await insertUsers(db)
        db.exec('delete from "user_role"')
        db.exec('insert into "user_role" ("userId", "roleId") values (1, 1)')

        const adminUser = await exchangeWithAuthToken(db)
        const adminUserRes = await adminUser.json() as { access_token: string }

        const res = await app.request(
          `${BaseRoute}/1-1-1-2/impersonation/2`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
            body: JSON.stringify({ impersonatorToken: adminUserRes.access_token }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.impersonateNonSpaApp)

        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error if consent is required',
      async () => {
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        await insertUsers(db)
        db.exec('delete from "user_role"')
        db.exec('insert into "user_role" ("userId", "roleId") values (1, 1)')

        const adminUser = await exchangeWithAuthToken(db)
        const adminUserRes = await adminUser.json() as { access_token: string }

        const res = await app.request(
          `${BaseRoute}/1-1-1-2/impersonation/1`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
            body: JSON.stringify({ impersonatorToken: adminUserRes.access_token }),
          },
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.NoConsent)

        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
      },
    )

    test(
      'should throw error if not using root scope',
      async () => {
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await insertUsers(db)
        db.exec('delete from "user_role"')
        db.exec('insert into "user_role" ("userId", "roleId") values (1, 1)')

        const adminUser = await exchangeWithAuthToken(db)
        const adminUserRes = await adminUser.json() as { access_token: string }

        const res = await app.request(
          `${BaseRoute}/1-1-1-2/impersonation/1`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.WriteUser,
              )}`,
            },
            body: JSON.stringify({ impersonatorToken: adminUserRes.access_token }),
          },
          mock(db),
        )
        expect(res.status).toBe(401)

        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )
  },
)
