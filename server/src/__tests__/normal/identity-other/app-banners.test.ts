import { Database } from 'better-sqlite3'
import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { insertAppBanner } from '../s2s/app-banner.test'
import {
  routeConfig,
  messageConfig,
} from 'configs'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import { getApp } from 'tests/identity'
import { dbTime } from 'tests/util'
import { appModel } from 'models'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

describe(
  'get /app-banners',
  () => {
    test(
      'should get app banners',
      async () => {
        process.env.ENABLE_APP_BANNER = true as unknown as string

        const appRecord = await getApp(db)

        await insertAppBanner(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AppBanners}?client_id=${appRecord.clientId}`,
          {},
          mock(db),
        )

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

        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should throw error when use wrong clientId',
      async () => {
        process.env.ENABLE_APP_BANNER = true as unknown as string

        await insertAppBanner(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AppBanners}?client_id=wrong-client-id`,
          {},
          mock(db),
        )

        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoSpaAppFound)

        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should throw error when clientId is not provided',
      async () => {
        process.env.ENABLE_APP_BANNER = true as unknown as string

        await insertAppBanner(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AppBanners}`,
          {},
          mock(db),
        )

        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoSpaAppFound)

        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should throw error when when app is not SPA',
      async () => {
        process.env.ENABLE_APP_BANNER = true as unknown as string

        await insertAppBanner(db)

        const appRecord = await db.prepare('SELECT * FROM app where id = 2').get() as appModel.Record

        const res = await app.request(
          `${routeConfig.IdentityRoute.AppBanners}?client_id=${appRecord.clientId}`,
          {},
          mock(db),
        )

        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoSpaAppFound)

        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should throw error when feature is disabled',
      async () => {
        await insertAppBanner(db)

        const appRecord = await getApp(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AppBanners}?client_id=${appRecord.clientId}`,
          {},
          mock(db),
        )

        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.AppBannerNotEnabled)
      },
    )
  },
)
