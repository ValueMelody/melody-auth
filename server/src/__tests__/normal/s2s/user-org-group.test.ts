import { Database } from 'better-sqlite3'
import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { insertUsers } from './user.test'
import {
  messageConfig, routeConfig,
} from 'configs'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  attachIndividualScopes,
  dbTime, getS2sToken,
} from 'tests/util'
import { userOrgGroupModel } from 'models'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await mockedKV.empty()
  await db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiUsers

const insertOrgGroups = async (db: Database) => {
  await db.exec(`
    INSERT INTO org (name, slug)
    values ('org 1', 'org-1')
  `)
  await db.exec(`
    INSERT INTO "org_group" (name, "orgId")
    values ('org group 1', 1)
  `)
  await db.exec(`
    INSERT INTO "org_group" (name, "orgId")
    values ('org group 2', 1)
  `)
}

describe(
  'get user org groups',
  () => {
    test(
      'should return user org groups',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await insertOrgGroups(db)

        await db.exec(`
          INSERT INTO "user_org_group" ("userId", "orgGroupId")
          values (1, 1)
        `)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/org-groups`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { orgGroups: userOrgGroupModel.UserOrgGroup[] }
        expect(json.orgGroups).toStrictEqual([{
          orgGroupId: 1,
          orgGroupName: 'org group 1',
        }])

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return empty array if user has no org groups',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await insertOrgGroups(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/org-groups`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { orgGroups: userOrgGroupModel.UserOrgGroup[] }
        expect(json.orgGroups).toStrictEqual([])

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'could read with read user and read org scope',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await attachIndividualScopes(db)
        await insertOrgGroups(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/org-groups`,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                'read_user read_org',
              )}`,
            },
          },
          mock(db),
        )
        const json = await res.json() as { orgGroups: userOrgGroupModel.UserOrgGroup[] }
        expect(json.orgGroups).toStrictEqual([])

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if user not found',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await insertOrgGroups(db)

        const res = await app.request(
          `${BaseRoute}/1-1-2-1/org-groups`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoUser)

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if feature flag is disabled',
      async () => {
        await insertUsers(db)
        await insertOrgGroups(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-2/org-groups`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.OrgNotEnabled)
      },
    )
  },
)

describe(
  'create user org group',
  () => {
    test(
      'should create user org group',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await insertOrgGroups(db)

        await db.exec(`
          update "user" set "orgSlug" = 'org-1' where id = 1
        `)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/org-groups/1`,
          {
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
            method: 'POST',
          },
          mock(db),
        )

        const json = await res.json()

        expect(json).toStrictEqual({ success: true })

        const userOrgGroup = await db.prepare('SELECT * FROM "user_org_group" WHERE "userId" = 1 AND "orgGroupId" = 1').get()
        expect(userOrgGroup).toStrictEqual({
          id: 1,
          userId: 1,
          orgGroupId: 1,
          createdAt: dbTime,
          updatedAt: dbTime,
          deletedAt: null,
        })

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if user does not belong to org',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await insertOrgGroups(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/org-groups/1`,
          {
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
            method: 'POST',
          },
          mock(db),
        )

        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoOrg)

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if org group not found',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await insertOrgGroups(db)

        await db.exec(`
          update "user" set "orgSlug" = 'org-1' where id = 1
        `)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/org-groups/3`,
          {
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
            method: 'POST',
          },
          mock(db),
        )

        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.OrgGroupNotFound)

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if feature flag is disabled',
      async () => {
        await insertUsers(db)
        await insertOrgGroups(db)

        await db.exec(`
          update "user" set "orgSlug" = 'org-1' where id = 1
        `)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/org-groups/1`,
          {
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
            method: 'POST',
          },
          mock(db),
        )

        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.OrgNotEnabled)
      },
    )
  },
)

describe(
  'delete user org group',
  () => {
    test(
      'should delete user org group',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await insertOrgGroups(db)

        await db.exec(`
          update "user" set "orgSlug" = 'org-1' where id = 1
        `)

        await db.exec(`
          INSERT INTO "user_org_group" ("userId", "orgGroupId")
          values (1, 1)
        `)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/org-groups/1`,
          {
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
            method: 'DELETE',
          },
          mock(db),
        )

        const json = await res.json()

        expect(json).toStrictEqual({ success: true })

        const userOrgGroup = await db.prepare('SELECT * FROM "user_org_group" WHERE "userId" = 1 AND "orgGroupId" = 1').get()
        expect(userOrgGroup).toStrictEqual({
          id: 1,
          userId: 1,
          orgGroupId: 1,
          createdAt: dbTime,
          updatedAt: dbTime,
          deletedAt: dbTime,
        })

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if org group not found',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await insertUsers(db)
        await insertOrgGroups(db)

        await db.exec(`
          update "user" set "orgSlug" = 'org-1' where id = 1
        `)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/org-groups/2`,
          {
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
            method: 'DELETE',
          },
          mock(db),
        )

        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.OrgGroupNotFound)

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if feature flag is disabled',
      async () => {
        await insertUsers(db)
        await insertOrgGroups(db)

        await db.exec(`
          update "user" set "orgSlug" = 'org-1' where id = 1
        `)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/org-groups/1`,
          {
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
            method: 'DELETE',
          },
          mock(db),
        )

        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.OrgNotEnabled)
      },
    )
  },
)
