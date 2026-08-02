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
  prepareFollowUpBody,
  insertUsers,
  prepareFollowUpParams,
} from 'tests/identity'
import { dbTime } from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

describe(
  'get /app-consent',
  () => {
    test(
      'could get consent info',
      async () => {
        await insertUsers(
          db,
          false,
        )

        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AppConsent}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json).toStrictEqual({
          appName: 'Admin Panel (SPA)',
          scopes: [
            {
              createdAt: dbTime,
              deletedAt: null,
              id: 2,
              locales: [
                {
                  createdAt: dbTime,
                  deletedAt: null,
                  id: 1,
                  locale: 'en',
                  scopeId: 2,
                  updatedAt: dbTime,
                  value: 'Access your basic profile information',
                },
                {
                  createdAt: dbTime,
                  deletedAt: null,
                  id: 2,
                  locale: 'fr',
                  scopeId: 2,
                  updatedAt: dbTime,
                  value: 'Accéder à vos informations de profil de base',
                },
              ],
              name: 'profile',
              note: '',
              type: 'spa',
              updatedAt: dbTime,
            },
            {
              createdAt: dbTime,
              deletedAt: null,
              id: 1,
              locales: [],
              name: 'openid',
              note: '',
              type: 'spa',
              updatedAt: dbTime,
            },
            {
              createdAt: dbTime,
              deletedAt: null,
              updatedAt: dbTime,
              id: 3,
              locales: [],
              name: 'offline_access',
              note: '',
              type: 'spa',
            },
          ],
        })
      },
    )

    test(
      'should return empty scopes if scope not found',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)
        await db.prepare('update scope set "deletedAt" = ?').run('2024')

        const res = await app.request(
          `${routeConfig.IdentityRoute.AppConsent}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(200)
        expect(await res.json()).toStrictEqual({
          appName: 'Admin Panel (SPA)',
          scopes: [],
        })
      },
    )

    test(
      'should throw error if use wrong auth code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpParams(db)
        const res = await app.request(
          `${routeConfig.IdentityRoute.AppConsent}?code=abc`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)
      },
    )

    test(
      'should throw error if app consent is not enabled',
      async () => {
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)
        const res = await app.request(
          `${routeConfig.IdentityRoute.AppConsent}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.AppConsentNotEnabled)

        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )
  },
)

describe(
  'post /app-consent',
  () => {
    test(
      'should consent',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.AppConsent,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.MfaEnroll,
        })
        const consent = await db.prepare('SELECT * from user_app_consent WHERE "userId" = 1 AND "appId" = 1').get() as { scopes: string }
        expect(JSON.parse(consent.scopes)).toStrictEqual([
          'offline_access',
          'openid',
          'profile',
        ])
      },
    )

    test(
      'should extend an existing consent with newly approved scopes',
      async () => {
        await insertUsers(db)
        await db.prepare(`
          UPDATE user_app_consent
          SET "scopes" = ?
          WHERE "userId" = 1 AND "appId" = 1
        `).run('["profile"]')
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.AppConsent,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )

        expect(res.status).toBe(200)
        const consents = await db.prepare(`
          SELECT "scopes"
          FROM user_app_consent
          WHERE "userId" = 1 AND "appId" = 1 AND "deletedAt" IS NULL
        `).all() as { scopes: string }[]
        expect(consents).toHaveLength(1)
        expect(JSON.parse(consents[0].scopes)).toStrictEqual([
          'offline_access',
          'openid',
          'profile',
        ])
      },
    )

    test(
      'should throw error if use wrong auth code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.AppConsent,
          {
            method: 'POST',
            body: JSON.stringify({
              locale: 'en',
              code: 'abc',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)
      },
    )

    test(
      'should throw error if app consent is not enabled',
      async () => {
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.AppConsent,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.AppConsentNotEnabled)

        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )
  },
)
