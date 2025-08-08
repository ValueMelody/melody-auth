import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { insertAppBanner } from '../s2s/app-banner.test'
import { sendInitiateRequest } from './initiate.test'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  messageConfig, routeConfig,
} from 'configs'
import { getApp } from 'tests/identity'
import { dbTime } from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const sendInitiateAndGetSessionId = async (db: Database) => {
  const appRecord = await getApp(db)
  const initiateRes = await sendInitiateRequest(
    db,
    appRecord,
  )
  const { sessionId } = await initiateRes.json() as { sessionId: string }
  return {
    sessionId, appRecord,
  }
}

describe(
  'get /app-banners',
  () => {
    test(
      'should get app banners',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_APP_BANNER = true as unknown as string

        const { sessionId } = await sendInitiateAndGetSessionId(db)

        await insertAppBanner(db)

        const res = await app.request(
          routeConfig.EmbeddedRoute.AppBanners.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          banners: [
            {
              id: 1,
              type: 'info',
              text: 'This is a info banner',
              isActive: true,
              locales: [
                {
                  locale: 'en',
                  value: 'This is an info banner',
                },
              ],
              createdAt: dbTime,
              updatedAt: dbTime,
              deletedAt: null,
            },
            {
              id: 2,
              type: 'error',
              text: null,
              isActive: true,
              locales: [
                {
                  locale: 'en',
                  value: 'This is an error banner',
                },
              ],
              createdAt: dbTime,
              updatedAt: dbTime,
              deletedAt: null,
            },
          ],
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should throw error when session id is invalid',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_APP_BANNER = true as unknown as string

        await insertAppBanner(db)

        const res = await app.request(
          routeConfig.EmbeddedRoute.AppBanners.replace(
            ':sessionId',
            'invalid-session-id',
          ),
          { method: 'GET' },
          mock(db),
        )

        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should throw error when feature is disabled',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_APP_BANNER = false as unknown as string

        const { sessionId } = await sendInitiateAndGetSessionId(db)

        await insertAppBanner(db)

        const res = await app.request(
          routeConfig.EmbeddedRoute.AppBanners.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )

        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.AppBannerNotEnabled)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should return empty banners when no banners exist',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_APP_BANNER = true as unknown as string

        const { sessionId } = await sendInitiateAndGetSessionId(db)

        const res = await app.request(
          routeConfig.EmbeddedRoute.AppBanners.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({ banners: [] })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should throw error when embedded auth origin is invalid',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_APP_BANNER = true as unknown as string

        await insertAppBanner(db)

        const res = await app.request(
          routeConfig.EmbeddedRoute.AppBanners.replace(
            ':sessionId',
            '123',
          ),
          { method: 'GET' },
          mock(db),
        )

        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.EmbeddedAuthFeatureNotEnabled)

        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )
  },
)
