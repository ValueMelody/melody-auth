import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  messageConfig, routeConfig,
} from 'configs'
import {
  prepareFollowUpBody, insertUsers,
} from 'tests/identity'
import { Policy } from 'dtos/oauth'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const insertOrgs = (db: Database) => {
  db.exec(`
    INSERT INTO "org"
    ("id", "name", "slug", "onlyUseForBrandingOverride")
    VALUES 
    (1, 'Default Org', 'default-org', 0),
    (2, 'Second Org', 'second-org', 0),
    (3, 'Third Org', 'third-org', 0)
  `)
}

const insertUserOrgs = (
  db: Database,
  userId: number,
  orgIds: number[],
) => {
  const values = orgIds.map((orgId) => `(${userId}, ${orgId})`).join(', ')
  db.exec(`
    INSERT INTO "user_org"
    ("userId", "orgId")
    VALUES ${values}
  `)
}

const sendCorrectGetChangeOrgRequest = async ({ code }: {
  code?: string;
} = {}) => {
  const body = await prepareFollowUpBody(db)

  // Update user's orgSlug
  await db.prepare('UPDATE "user" SET "orgSlug" = ? WHERE id = ?').run(
    'default-org',
    1,
  )

  const res = await app.request(
    `${routeConfig.IdentityRoute.ChangeOrg}?code=${code ?? body.code}`,
    { method: 'GET' },
    mock(db),
  )
  return {
    res,
    code: body.code,
  }
}

const sendCorrectPostChangeOrgRequest = async ({
  org,
  code,
}: {
  org: string;
  code?: string;
}) => {
  const body = await prepareFollowUpBody(db)

  const res = await app.request(
    routeConfig.IdentityRoute.ChangeOrg,
    {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        code: code ?? body.code,
        org,
      }),
    },
    mock(db),
  )

  return {
    res,
    code: body.code,
  }
}

describe(
  'get /change-org',
  () => {
    test(
      'should get user orgs',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [] as unknown as string

        await insertOrgs(db)
        await insertUsers(
          db,
          false,
        )
        await db.prepare('UPDATE "user" SET "orgSlug" = ? WHERE id = ?').run(
          'default-org',
          1,
        )
        await insertUserOrgs(
          db,
          1,
          [1, 2, 3],
        )

        const { res } = await sendCorrectGetChangeOrgRequest()
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json).toStrictEqual({
          orgs: [
            {
              id: 1,
              name: 'Default Org',
              slug: 'default-org',
              companyLogoUrl: '',
            },
            {
              id: 2,
              name: 'Second Org',
              slug: 'second-org',
              companyLogoUrl: '',
            },
            {
              id: 3,
              name: 'Third Org',
              slug: 'third-org',
              companyLogoUrl: '',
            },
          ],
          activeOrgSlug: 'default-org',
        })

        process.env.ENABLE_ORG = false as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeOrg] as unknown as string
      },
    )

    test(
      'should return empty orgs when user has no org memberships',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [] as unknown as string

        await insertOrgs(db)
        await insertUsers(
          db,
          false,
        )
        await db.prepare('UPDATE "user" SET "orgSlug" = ? WHERE id = ?').run(
          'default-org',
          1,
        )

        const { res } = await sendCorrectGetChangeOrgRequest()
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json).toStrictEqual({
          orgs: [],
          activeOrgSlug: 'default-org',
        })

        process.env.ENABLE_ORG = false as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeOrg] as unknown as string
      },
    )

    test(
      'should throw error if auth code is wrong',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [] as unknown as string

        await insertOrgs(db)
        await insertUsers(
          db,
          false,
        )
        await db.prepare('UPDATE "user" SET "orgSlug" = ? WHERE id = ?').run(
          'default-org',
          1,
        )
        const { res } = await sendCorrectGetChangeOrgRequest({ code: 'invalid-code' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)

        process.env.ENABLE_ORG = false as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeOrg] as unknown as string
      },
    )

    test(
      'should throw error if org feature is not enabled',
      async () => {
        process.env.ENABLE_ORG = false as unknown as string
        global.process.env.BLOCKED_POLICIES = [] as unknown as string

        await insertOrgs(db)
        await insertUsers(
          db,
          false,
        )
        await db.prepare('UPDATE "user" SET "orgSlug" = ? WHERE id = ?').run(
          'default-org',
          1,
        )
        const { res } = await sendCorrectGetChangeOrgRequest()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.OrgNotEnabled)

        process.env.ENABLE_ORG = false as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeOrg] as unknown as string
      },
    )

    test(
      'should throw error if change org policy is blocked',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeOrg] as unknown as string

        await insertOrgs(db)
        await insertUsers(
          db,
          false,
        )
        await db.prepare('UPDATE "user" SET "orgSlug" = ? WHERE id = ?').run(
          'default-org',
          1,
        )
        const { res } = await sendCorrectGetChangeOrgRequest()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.ChangeOrgPolicyNotEnabled)

        process.env.ENABLE_ORG = false as unknown as string
        global.process.env.BLOCKED_POLICIES = [] as unknown as string
      },
    )
  },
)

describe(
  'post /change-org',
  () => {
    test(
      'should change user org',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [] as unknown as string

        await insertOrgs(db)
        await insertUsers(
          db,
          false,
        )
        await db.prepare('UPDATE "user" SET "orgSlug" = ? WHERE id = ?').run(
          'default-org',
          1,
        )
        await insertUserOrgs(
          db,
          1,
          [1, 2, 3],
        )

        const { res } = await sendCorrectPostChangeOrgRequest({ org: 'second-org' })
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        // Verify user's orgSlug was updated
        const user = await db.prepare('SELECT * FROM "user" WHERE id = ?').get(1) as any
        expect(user.orgSlug).toBe('second-org')

        process.env.ENABLE_ORG = false as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeOrg] as unknown as string
      },
    )

    test(
      'should return success when changing to same org',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [] as unknown as string

        await insertOrgs(db)
        await insertUsers(
          db,
          false,
        )
        await db.prepare('UPDATE "user" SET "orgSlug" = ? WHERE id = ?').run(
          'default-org',
          1,
        )
        await insertUserOrgs(
          db,
          1,
          [1, 2, 3],
        )

        const { res } = await sendCorrectPostChangeOrgRequest({ org: 'default-org' })
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        // Verify user's orgSlug remains the same
        const user = await db.prepare('SELECT * FROM "user" WHERE id = ?').get(1) as any
        expect(user.orgSlug).toBe('default-org')

        process.env.ENABLE_ORG = false as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeOrg] as unknown as string
      },
    )

    test(
      'should throw error when changing to non-existent org',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [] as unknown as string

        await insertOrgs(db)
        await insertUsers(
          db,
          false,
        )
        await db.prepare('UPDATE "user" SET "orgSlug" = ? WHERE id = ?').run(
          'default-org',
          1,
        )
        await insertUserOrgs(
          db,
          1,
          [1],
        )

        const { res } = await sendCorrectPostChangeOrgRequest({ org: 'non-existent-org' })
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoOrg)

        process.env.ENABLE_ORG = false as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeOrg] as unknown as string
      },
    )

    test(
      'should throw error when changing to org user does not belong to',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [] as unknown as string

        await insertOrgs(db)
        await insertUsers(
          db,
          false,
        )
        await db.prepare('UPDATE "user" SET "orgSlug" = ? WHERE id = ?').run(
          'default-org',
          1,
        )
        await insertUserOrgs(
          db,
          1,
          [1],
        )

        const { res } = await sendCorrectPostChangeOrgRequest({ org: 'second-org' })
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoOrg)

        process.env.ENABLE_ORG = false as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeOrg] as unknown as string
      },
    )

    test(
      'should throw error if auth code is wrong',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [] as unknown as string

        await insertOrgs(db)
        await insertUsers(
          db,
          false,
        )
        await insertUserOrgs(
          db,
          1,
          [1, 2],
        )

        const { res } = await sendCorrectPostChangeOrgRequest({
          org: 'second-org',
          code: 'invalid-code',
        })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)

        process.env.ENABLE_ORG = false as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeOrg] as unknown as string
      },
    )

    test(
      'should throw error if org feature is not enabled',
      async () => {
        process.env.ENABLE_ORG = false as unknown as string
        global.process.env.BLOCKED_POLICIES = [] as unknown as string

        await insertOrgs(db)
        await insertUsers(
          db,
          false,
        )
        await insertUserOrgs(
          db,
          1,
          [1, 2],
        )

        const { res } = await sendCorrectPostChangeOrgRequest({ org: 'second-org' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.OrgNotEnabled)

        process.env.ENABLE_ORG = false as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeOrg] as unknown as string
      },
    )

    test(
      'should throw error if change org policy is blocked',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeOrg] as unknown as string

        await insertOrgs(db)
        await insertUsers(
          db,
          false,
        )
        await insertUserOrgs(
          db,
          1,
          [1, 2],
        )

        const { res } = await sendCorrectPostChangeOrgRequest({ org: 'second-org' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.ChangeOrgPolicyNotEnabled)

        process.env.ENABLE_ORG = false as unknown as string
        global.process.env.BLOCKED_POLICIES = [] as unknown as string
      },
    )
  },
)
