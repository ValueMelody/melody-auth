import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { sendInitiateRequest } from './initiate.test'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  messageConfig, routeConfig,
} from 'configs'
import {
  getApp, insertUsers,
} from 'tests/identity'

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

const sendVerifiedSignInRequest = async (
  db: Database,
  {
    email,
    password,
    orgSlug,
  }: {
    email?: string;
    password?: string;
    orgSlug?: string;
  } = {},
) => {
  const appRecord = await getApp(db)

  const initiateRes = await sendInitiateRequest(
    db,
    appRecord,
    { orgSlug },
  )

  const { sessionId } = await initiateRes.json() as { sessionId: string }

  await insertUsers(db)

  // Update user's orgSlug
  await db.prepare('UPDATE "user" SET "orgSlug" = ? WHERE id = ?').run(
    orgSlug ?? 'default-org',
    1,
  )

  const res = await app.request(
    routeConfig.EmbeddedRoute.SignIn.replace(
      ':sessionId',
      sessionId,
    ),
    {
      method: 'POST',
      body: JSON.stringify({
        email: email ?? 'test@email.com',
        password: password ?? 'Password1!',
      }),
    },
    mock(db),
  )
  return {
    res,
    sessionId,
  }
}

describe(
  'get /user-orgs',
  () => {
    test(
      'should get user orgs',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_ORG = true as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = true as unknown as string

        await insertOrgs(db)
        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          { orgSlug: 'default-org' },
        )

        // Insert user_org relationships
        await insertUserOrgs(
          db,
          1,
          [1, 2, 3],
        )

        const userOrgsRes = await app.request(
          routeConfig.EmbeddedRoute.UserOrgs.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(userOrgsRes.status).toBe(200)

        const userOrgsJson = await userOrgsRes.json()
        expect(userOrgsJson).toStrictEqual({
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

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_ORG = false as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should throw error when sessionId is invalid',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_ORG = true as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = true as unknown as string

        const userOrgsRes = await app.request(
          routeConfig.EmbeddedRoute.UserOrgs.replace(
            ':sessionId',
            'invalid-session-id',
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(userOrgsRes.status).toBe(404)
        expect(await userOrgsRes.text()).toContain(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_ORG = false as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should throw error when org feature is disabled',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_ORG = false as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = true as unknown as string

        await insertOrgs(db)
        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          { orgSlug: 'default-org' },
        )

        const userOrgsRes = await app.request(
          routeConfig.EmbeddedRoute.UserOrgs.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(userOrgsRes.status).toBe(400)
        expect(await userOrgsRes.text()).toContain(messageConfig.ConfigError.OrgNotEnabled)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_ORG = false as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should throw error when user switch org feature is disabled',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_ORG = true as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = false as unknown as string

        await insertOrgs(db)
        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          { orgSlug: 'default-org' },
        )

        const userOrgsRes = await app.request(
          routeConfig.EmbeddedRoute.UserOrgs.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(userOrgsRes.status).toBe(400)
        expect(await userOrgsRes.text()).toContain(messageConfig.ConfigError.SwitchOrgNotEnabled)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_ORG = false as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = false as unknown as string
      },
    )
  },
)

describe(
  'post /user-orgs',
  () => {
    test(
      'should switch user org',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_ORG = true as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = true as unknown as string

        await insertOrgs(db)
        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          { orgSlug: 'default-org' },
        )

        // Insert user_org relationships
        await insertUserOrgs(
          db,
          1,
          [1, 2, 3],
        )

        const switchOrgRes = await app.request(
          routeConfig.EmbeddedRoute.UserOrgs.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({ org: 'second-org' }),
          },
          mock(db),
        )

        expect(switchOrgRes.status).toBe(200)
        const switchOrgJson = await switchOrgRes.json()
        expect(switchOrgJson).toStrictEqual({
          sessionId,
          success: true,
        })

        // Verify user's orgSlug was updated
        const user = await db.prepare('SELECT * FROM "user" WHERE id = ?').get(1) as any
        expect(user.orgSlug).toBe('second-org')

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_ORG = false as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should throw error when switching to non-existent org',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_ORG = true as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = true as unknown as string

        await insertOrgs(db)
        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          { orgSlug: 'default-org' },
        )

        // Insert user_org relationships (only org 1)
        await insertUserOrgs(
          db,
          1,
          [1],
        )

        const switchOrgRes = await app.request(
          routeConfig.EmbeddedRoute.UserOrgs.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({ org: 'non-existent-org' }),
          },
          mock(db),
        )

        expect(switchOrgRes.status).toBe(404)
        expect(await switchOrgRes.text()).toContain(messageConfig.RequestError.NoOrg)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_ORG = false as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should throw error when switching to org user does not belong to',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_ORG = true as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = true as unknown as string

        await insertOrgs(db)
        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          { orgSlug: 'default-org' },
        )

        // Insert user_org relationships (only org 1, not org 2)
        await insertUserOrgs(
          db,
          1,
          [1],
        )

        const switchOrgRes = await app.request(
          routeConfig.EmbeddedRoute.UserOrgs.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({ org: 'second-org' }),
          },
          mock(db),
        )

        expect(switchOrgRes.status).toBe(404)
        expect(await switchOrgRes.text()).toContain(messageConfig.RequestError.NoOrg)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_ORG = false as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should throw error when sessionId is invalid',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_ORG = true as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = true as unknown as string

        const switchOrgRes = await app.request(
          routeConfig.EmbeddedRoute.UserOrgs.replace(
            ':sessionId',
            'invalid-session-id',
          ),
          {
            method: 'POST',
            body: JSON.stringify({ org: 'second-org' }),
          },
          mock(db),
        )

        expect(switchOrgRes.status).toBe(404)
        expect(await switchOrgRes.text()).toContain(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_ORG = false as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should throw error when org parameter is missing',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_ORG = true as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = true as unknown as string

        await insertOrgs(db)
        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          { orgSlug: 'default-org' },
        )

        const switchOrgRes = await app.request(
          routeConfig.EmbeddedRoute.UserOrgs.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({}),
          },
          mock(db),
        )

        expect(switchOrgRes.status).toBe(400)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_ORG = false as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should throw error when org feature is disabled',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_ORG = false as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = true as unknown as string

        await insertOrgs(db)
        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          { orgSlug: 'default-org' },
        )

        const switchOrgRes = await app.request(
          routeConfig.EmbeddedRoute.UserOrgs.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({ org: 'second-org' }),
          },
          mock(db),
        )

        expect(switchOrgRes.status).toBe(400)
        expect(await switchOrgRes.text()).toContain(messageConfig.ConfigError.OrgNotEnabled)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_ORG = false as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should throw error when user switch org feature is disabled',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_ORG = true as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = false as unknown as string

        await insertOrgs(db)
        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          { orgSlug: 'default-org' },
        )

        const switchOrgRes = await app.request(
          routeConfig.EmbeddedRoute.UserOrgs.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({ org: 'second-org' }),
          },
          mock(db),
        )

        expect(switchOrgRes.status).toBe(400)
        expect(await switchOrgRes.text()).toContain(messageConfig.ConfigError.SwitchOrgNotEnabled)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_ORG = false as unknown as string
        process.env.ALLOW_USER_SWITCH_ORG_ON_SIGN_IN = false as unknown as string
      },
    )
  },
)
