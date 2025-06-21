import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { Scope } from '@melody-auth/shared'
import {
  user1, user2, insertUsers,
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
  orgGroupModel, userModel,
} from 'models'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiOrgGroups

const createNewOrgGroup = async (token?: string) => {
  const res = await app.request(
    BaseRoute,
    {
      method: 'POST',
      body: JSON.stringify({
        name: 'test name',
        orgId: 1,
      }),
      headers: token === '' ? undefined : { Authorization: `Bearer ${token ?? await getS2sToken(db)}` },
    },
    mock(db),
  )
  return { res }
}

const newOrgGroup = {
  id: 1,
  orgId: 1,
  name: 'test name',
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

describe(
  'get all',
  () => {
    test(
      'should return all roles',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        db.prepare('INSERT INTO org (name) VALUES (?)').run('test org')
        await createNewOrgGroup()
        const res = await app.request(
          `${BaseRoute}?org_id=1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { orgGroups: orgGroupModel.Record[] }

        expect(json.orgGroups.length).toBe(1)
        expect(json).toStrictEqual({ orgGroups: [newOrgGroup] })

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return no group group for a different org',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        db.prepare('INSERT INTO org (name) VALUES (?)').run('test org')
        await createNewOrgGroup()
        const res = await app.request(
          `${BaseRoute}?org_id=2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { orgGroups: orgGroupModel.Record[] }

        expect(json.orgGroups.length).toBe(0)
        expect(json).toStrictEqual({ orgGroups: [] })

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        db.prepare('INSERT INTO org (name) VALUES (?)').run('test org')
        const res = await app.request(
          `${BaseRoute}?org_id=1`,
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
  'create',
  () => {
    test(
      'should create org group',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        db.prepare('INSERT INTO org (name) VALUES (?)').run('test org')
        const { res } = await createNewOrgGroup()
        const json = await res.json()

        expect(json).toStrictEqual({ orgGroup: newOrgGroup })

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should trigger unique constraint',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        db.prepare('INSERT INTO org (name) VALUES (?)').run('test org')
        await createNewOrgGroup()
        const { res } = await createNewOrgGroup()
        expect(res.status).toBe(500)

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should create org group with write_org scope',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        db.prepare('INSERT INTO org (name) VALUES (?)').run('test org')
        await attachIndividualScopes(db)
        const { res } = await createNewOrgGroup(await getS2sToken(
          db,
          Scope.WriteOrg,
        ))
        const json = await res.json()

        expect(json).toStrictEqual({ orgGroup: newOrgGroup })

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        db.prepare('INSERT INTO org (name) VALUES (?)').run('test org')
        const { res } = await createNewOrgGroup(await getS2sToken(
          db,
          Scope.ReadOrg,
        ))
        expect(res.status).toBe(401)

        const { res: res1 } = await createNewOrgGroup('')
        expect(res1.status).toBe(401)

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return 400 if feature not enabled',
      async () => {
        db.prepare('INSERT INTO org (name) VALUES (?)').run('test org')
        const { res } = await createNewOrgGroup()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.OrgNotEnabled)
      },
    )
  },
)

describe(
  'update',
  () => {
    test(
      'should update org group',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        db.prepare('INSERT INTO org (name) VALUES (?)').run('test org')
        await createNewOrgGroup()
        const updateObj = { name: 'test name 1' }
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
          orgGroup: {
            ...newOrgGroup,
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
      'should delete org group',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        db.prepare('INSERT INTO org (name) VALUES (?)').run('test org')
        await createNewOrgGroup()
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

        process.env.ENABLE_ORG = false as unknown as string
      },
    )
  },
)

describe(
  'get users by org group id',
  () => {
    test(
      'should return all users by org group id',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        db.prepare('INSERT INTO org (name, slug) VALUES (?, ?)').run(
          'test org',
          'test-org',
        )
        await createNewOrgGroup()

        await insertUsers(db)

        await db.exec(`
          update "user" set "orgSlug" = 'test-org' where id = 1
        `)
        await db.exec(`
          insert into "user_org_group" ("userId", "orgGroupId")
          values (1, 1)
        `)
        await db.exec(`
          insert into "user_org_group" ("userId", "orgGroupId")
          values (2, 1)
        `)

        const res = await app.request(
          `${BaseRoute}/1/users`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { users: userModel.Record[] }

        expect(json.users.length).toBe(2)
        expect(json).toStrictEqual({ users: [user1, user2] })

        await db.exec(`
          delete from "user_org_group" where "userId" = 1
        `)

        const res1 = await app.request(
          `${BaseRoute}/1/users`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json1 = await res1.json() as { users: userModel.Record[] }

        expect(json1.users.length).toBe(1)
        expect(json1).toStrictEqual({ users: [user2] })

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should return with read user and read org scope',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        await attachIndividualScopes(db)

        db.prepare('INSERT INTO org (name, slug) VALUES (?, ?)').run(
          'test org',
          'test-org',
        )
        await createNewOrgGroup()

        const res = await app.request(
          `${BaseRoute}/1/users`,
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
        const json = await res.json() as { users: userModel.Record[] }

        expect(json.users.length).toBe(0)
        expect(json).toStrictEqual({ users: [] })

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        const res = await app.request(
          `${BaseRoute}/1/users`,
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
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.OrgNotEnabled)
      },
    )
  },
)
