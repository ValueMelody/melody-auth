import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { Scope } from '@melody-auth/shared'
import {
  insertUsers, user1, user2,
} from './user.test'
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
import {
  orgModel, userModel,
} from 'models'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiOrgs

const createNewOrg = async (
  token?: string, values?: { name?: string; slug?: string },
) => await app.request(
  BaseRoute,
  {
    method: 'POST',
    body: JSON.stringify({
      name: values?.name ?? 'test name', slug: values?.slug ?? 'test slug',
    }),
    headers: token === '' ? undefined : { Authorization: `Bearer ${token ?? await getS2sToken(db)}` },
  },
  mock(db),
)

const setOrgUsers = async () => {
  await db.exec(`
    update "user" set "orgSlug" = 'test slug'
  `)
}

const newOrg = {
  id: 1,
  name: 'test name',
  slug: 'test slug',
  companyLogoUrl: '',
  fontFamily: '',
  fontUrl: '',
  layoutColor: '',
  labelColor: '',
  primaryButtonColor: '',
  primaryButtonLabelColor: '',
  primaryButtonBorderColor: '',
  secondaryButtonColor: '',
  secondaryButtonLabelColor: '',
  secondaryButtonBorderColor: '',
  criticalIndicatorColor: '',
  emailSenderName: '',
  termsLink: '',
  privacyPolicyLink: '',
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

describe(
  'get all',
  () => {
    test(
      'should return all orgs',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        const res = await app.request(
          BaseRoute,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { orgs: orgModel.Record[] }

        expect(json.orgs.length).toBe(1)
        expect(json).toStrictEqual({ orgs: [newOrg] })

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return all org with read_org scope',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await attachIndividualScopes(db)
        await createNewOrg()
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadOrg,
              )}`,
            },
          },
          mock(db),
        )
        const json = await res.json() as { orgs: orgModel.Record[] }

        expect(json.orgs.length).toBe(1)
        expect(json).toStrictEqual({ orgs: [newOrg] })

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return 401 if org not enabled in config',
      async () => {
        await attachIndividualScopes(db)
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadOrg,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await attachIndividualScopes(db)
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.WriteOrg,
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

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )
  },
)

describe(
  'get by id',
  () => {
    test(
      'should return org by id',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        const res = await app.request(
          `${BaseRoute}/1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({ org: newOrg })

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return 404 when can not find org by id',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        const res = await app.request(
          `${BaseRoute}/2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        expect(res.status).toBe(404)

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )
  },
)

describe(
  'create',
  () => {
    test(
      'should create org',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        const res = await createNewOrg()
        const json = await res.json()

        expect(json).toStrictEqual({ org: newOrg })

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should trigger unique constraint on name',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        const res1 = await createNewOrg(
          undefined,
          { slug: 'another slug' },
        )
        expect(res1.status).toBe(500)

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should trigger unique constraint on slug',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        const res1 = await createNewOrg(
          undefined,
          { name: 'another name' },
        )
        expect(res1.status).toBe(500)

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should create org with write_org scope',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await attachIndividualScopes(db)
        const res = await createNewOrg(await getS2sToken(
          db,
          Scope.WriteOrg,
        ))
        const json = await res.json()

        expect(json).toStrictEqual({ org: newOrg })

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        const res = await createNewOrg(await getS2sToken(
          db,
          Scope.ReadOrg,
        ))
        expect(res.status).toBe(401)

        const res1 = await createNewOrg('')
        expect(res1.status).toBe(401)

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )
  },
)

describe(
  'update',
  () => {
    test(
      'should update org',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        const updateObj = {
          name: 'test name 1', slug: 'test slug 1',
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
          org: {
            ...newOrg,
            ...updateObj,
          },
        })

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should update org with write_org scope',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        await attachIndividualScopes(db)

        const updateObj = {
          name: 'test name 1', slug: 'test slug 1',
        }
        const res = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.WriteOrg,
              )}`,
            },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          org: {
            ...newOrg,
            ...updateObj,
          },
        })

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        const res = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify({
              name: 'test name 1', slug: 'test slug 1',
            }),
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadOrg,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(401)

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )
    test(
      'should update user orgSlug when update org slug',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        await insertUsers(db)

        await db.exec(`
          update "user" set "orgSlug" = 'test slug' where "id" = 1
        `)

        const updateObj = {
          name: 'test name 1', slug: 'test slug 1',
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
          org: {
            ...newOrg,
            ...updateObj,
          },
        })

        const users = await db.prepare(`
          select * from "user"
        `).all() as userModel.Record[]

        expect((users.find((user) => user.id === 1))?.orgSlug).toBe(updateObj.slug)

        expect((users.find((user) => user.id === 2))?.orgSlug).toBe('')

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if org not found',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()

        const res = await app.request(
          `${BaseRoute}/2`,
          {
            method: 'PUT',
            body: JSON.stringify({
              name: 'test name 1', slug: 'test slug 1',
            }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toStrictEqual(messageConfig.RequestError.NoOrg)

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )
  },
)

describe(
  'delete',
  () => {
    test(
      'should delete org',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
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

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should delete org with write_org scope',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        await attachIndividualScopes(db)

        const res = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.WriteOrg,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(204)

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        await attachIndividualScopes(db)

        const res = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadOrg,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(401)

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if org not found',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()

        const res = await app.request(
          `${BaseRoute}/2`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toStrictEqual(messageConfig.RequestError.NoOrg)

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if org has users',
      async () => {
        global.process.env.ENABLE_ORG = true as unknown as string

        await createNewOrg()
        await insertUsers(db)
        await setOrgUsers()

        const res = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(messageConfig.RequestError.OrgHasUsers)

        global.process.env.ENABLE_ORG = false as unknown as string
      },
    )
  },
)

describe(
  'get all',
  () => {
    test(
      'should return all users',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await createNewOrg()
        await setOrgUsers()

        const res = await app.request(
          `${BaseRoute}/1/users`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { users: userModel.Record[] }
        expect(json.users).toStrictEqual([user1, user2])

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should only get user from queried org',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await createNewOrg()

        await db.exec(`
          update "user" set "orgSlug" = 'test slug' where "id" = 1
        `)

        const res = await app.request(
          `${BaseRoute}/1/users`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { users: userModel.Record[] }
        expect(json.users).toStrictEqual([user1])

        await db.exec(`
          insert into "org" ("name", "slug") values ('test name2', 'test slug2')
        `)

        const res1 = await app.request(
          `${BaseRoute}/2/users`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json1 = await res1.json() as { users: userModel.Record[] }
        expect(json1.users).toStrictEqual([])

        const res2 = await app.request(
          `${BaseRoute}/3/users`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        expect(res2.status).toBe(404)
        expect(await res2.text()).toStrictEqual(messageConfig.RequestError.NoOrg)

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'could get users by pagination',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await createNewOrg()
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

        await setOrgUsers()

        const res = await app.request(
          `${BaseRoute}/1/users?page_size=2&page_number=1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          users: [user1, user2],
          count: 5,
        })

        const res1 = await app.request(
          `${BaseRoute}/1/users?page_size=2&page_number=2`,
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
          `${BaseRoute}/1/users?page_size=2&page_number=1&search=test`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json2 = await res2.json()
        expect(json2).toStrictEqual({
          users: [user1, user2],
          count: 5,
        })

        const res3 = await app.request(
          `${BaseRoute}/1/users?page_size=2&page_number=1&search=test1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json3 = await res3.json()
        expect(json3).toStrictEqual({
          users: [user2],
          count: 1,
        })

        const res4 = await app.request(
          `${BaseRoute}/1/users?page_size=2&page_number=1&search=another`,
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
          `${BaseRoute}/1/users?page_size=2&page_number=1&search=last`,
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

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return all users with read_user and read org scope',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await createNewOrg()
        await setOrgUsers()
        await attachIndividualScopes(db)

        const res = await app.request(
          `${BaseRoute}/1/users`,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                `${Scope.ReadUser} ${Scope.ReadOrg}`,
              )}`,
            },
          },
          mock(db),
        )
        const json = await res.json() as { users: userModel.Record[] }
        expect(json.users).toStrictEqual([user1, user2])

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        await insertUsers(db)
        await createNewOrg()
        await setOrgUsers()
        await attachIndividualScopes(db)

        const res = await app.request(
          `${BaseRoute}/1/users`,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                `${Scope.ReadUser} ${Scope.ReadOrg}`,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(messageConfig.ConfigError.OrgNotEnabled)
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await attachIndividualScopes(db)
        await createNewOrg()
        await setOrgUsers()

        const res = await app.request(
          `${BaseRoute}/1/users`,
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
        expect(res.status).toBe(401)

        const res1 = await app.request(
          `${BaseRoute}/1/users`,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadOrg,
              )}`,
            },
          },
          mock(db),
        )
        expect(res1.status).toBe(401)

        const res2 = await app.request(
          BaseRoute,
          {},
          mock(db),
        )
        expect(res2.status).toBe(401)

        process.env.ENABLE_ORG = false as unknown as string
      },
    )
  },
)
