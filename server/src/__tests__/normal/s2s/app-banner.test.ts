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
import { bannerModel } from 'models'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiAppBanners

const insertAppBanner = async () => {
  await db.prepare('INSERT INTO "banner" (type, text, locales) values (?, ?, ?)').run(
    'info',
    'This is a info banner',
    JSON.stringify({ en: 'This is an info banner' }),
  )

  await db.prepare('INSERT INTO "app_banner" ("bannerId", "appId") values (?, ?)').run(
    '1',
    '1',
  )

  await db.prepare('INSERT INTO "app_banner" ("bannerId", "appId") values (?, ?)').run(
    '1',
    '2',
  )

  await db.prepare('INSERT INTO "banner" (type, locales) values (?, ?)').run(
    'error',
    JSON.stringify({ en: 'This is an error banner' }),
  )

  await db.prepare('INSERT INTO "app_banner" ("bannerId", "appId") values (?, ?)').run(
    '2',
    '1',
  )

  await db.prepare('INSERT INTO "banner" (type, text) values (?,?)').run(
    'warning',
    'This is a warning banner',
  )
}

describe(
  'get all',
  () => {
    test(
      'should return all app banners',
      async () => {
        process.env.ENABLE_APP_BANNER = true as unknown as string

        await insertAppBanner()

        const res = await app.request(
          BaseRoute,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { appBanners: bannerModel.Record[] }

        expect(json).toStrictEqual({
          appBanners: [
            {
              id: 1,
              type: 'info',
              isActive: true,
              text: 'This is a info banner',
              locales: [{
                locale: 'en', value: 'This is an info banner',
              }],
              appIds: [1, 2],
              createdAt: dbTime,
              updatedAt: dbTime,
              deletedAt: null,
            },
            {
              id: 2,
              type: 'error',
              isActive: true,
              text: null,
              locales: [{
                locale: 'en', value: 'This is an error banner',
              }],
              appIds: [1],
              createdAt: dbTime,
              updatedAt: dbTime,
              deletedAt: null,
            },
            {
              id: 3,
              type: 'warning',
              isActive: true,
              text: 'This is a warning banner',
              locales: [],
              appIds: [],
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
      'should return all app banners with read app scope',
      async () => {
        process.env.ENABLE_APP_BANNER = true as unknown as string

        await attachIndividualScopes(db)
        await insertAppBanner()
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadApp,
              )}`,
            },
          },
          mock(db),
        )
        const json = await res.json() as { appBanners: bannerModel.Record[] }

        expect(json.appBanners.length).toBe(3)

        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        process.env.ENABLE_APP_BANNER = true as unknown as string

        await attachIndividualScopes(db)
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.WriteApp,
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

        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should throw error when ENABLE_APP_BANNER is false',
      async () => {
        await attachIndividualScopes(db)
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadApp,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(messageConfig.ConfigError.AppBannerNotEnabled)
      },
    )
  },
)

describe(
  'create',
  () => {
    test(
      'should create app banner',
      async () => {
        process.env.ENABLE_APP_BANNER = true as unknown as string

        const res = await app.request(
          BaseRoute,
          {
            method: 'POST',
            body: JSON.stringify({
              type: 'info',
              text: 'This is a info banner',
              locales: [{
                locale: 'en', value: 'This is an info banner',
              }],
            }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          appBanner: {
            id: 1,
            type: 'info',
            isActive: true,
            text: 'This is a info banner',
            locales: [{
              locale: 'en', value: 'This is an info banner',
            }],
            appIds: [],
            createdAt: dbTime,
            updatedAt: dbTime,
            deletedAt: null,
          },
        })

        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should create with no text value',
      async () => {
        process.env.ENABLE_APP_BANNER = true as unknown as string

        const res = await app.request(
          BaseRoute,
          {
            method: 'POST',
            body: JSON.stringify({
              type: 'info',
              locales: [{
                locale: 'en', value: 'This is an info banner',
              }],
            }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          appBanner: {
            id: 1,
            type: 'info',
            isActive: true,
            text: null,
            locales: [{
              locale: 'en', value: 'This is an info banner',
            }],
            appIds: [],
            createdAt: dbTime,
            updatedAt: dbTime,
            deletedAt: null,
          },
        })

        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should create with no locales value',
      async () => {
        process.env.ENABLE_APP_BANNER = true as unknown as string

        await attachIndividualScopes(db)
        const token = await getS2sToken(
          db,
          Scope.WriteApp,
        )
        const res = await app.request(
          BaseRoute,
          {
            method: 'POST',
            body: JSON.stringify({
              type: 'info',
              text: 'This is a info banner',
            }),
            headers: { Authorization: `Bearer ${token}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          appBanner: {
            id: 1,
            type: 'info',
            isActive: true,
            text: 'This is a info banner',
            locales: [],
            appIds: [],
            createdAt: dbTime,
            updatedAt: dbTime,
            deletedAt: null,
          },
        })

        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        process.env.ENABLE_APP_BANNER = true as unknown as string

        await attachIndividualScopes(db)
        const res = await app.request(
          BaseRoute,
          {
            method: 'POST',
            body: JSON.stringify({
              type: 'info',
              text: 'This is a info banner',
              locales: [{
                locale: 'en', value: 'This is an info banner',
              }],
            }),
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadApp,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(401)

        const res1 = await app.request(
          BaseRoute,
          {
            method: 'POST',
            body: JSON.stringify({
              type: 'info',
              text: 'This is a info banner',
              locales: [{
                locale: 'en', value: 'This is an info banner',
              }],
            }),
          },
          mock(db),
        )
        expect(res1.status).toBe(401)

        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should throw error when ENABLE_APP_BANNER is false',
      async () => {
        await attachIndividualScopes(db)
        const res = await app.request(
          BaseRoute,
          {
            method: 'POST',
            body: JSON.stringify({
              type: 'info',
              text: 'This is a info banner',
              locales: JSON.stringify({ en: 'This is an info banner' }),
            }),
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadApp,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(messageConfig.ConfigError.AppBannerNotEnabled)
      },
    )
  },
)

describe(
  'get banner',
  () => {
    test(
      'should return app banner',
      async () => {
        process.env.ENABLE_APP_BANNER = true as unknown as string

        await insertAppBanner()
        const res = await app.request(
          `${BaseRoute}/1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { appBanner: bannerModel.Record }

        expect(json.appBanner).toStrictEqual({
          id: 1,
          type: 'info',
          text: 'This is a info banner',
          locales: [{
            locale: 'en', value: 'This is an info banner',
          }],
          appIds: [1, 2],
          isActive: true,
          createdAt: dbTime,
          updatedAt: dbTime,
          deletedAt: null,
        })
        const res2 = await app.request(
          `${BaseRoute}/2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json2 = await res2.json() as { appBanner: bannerModel.Record }

        expect(json2.appBanner).toStrictEqual({
          id: 2,
          type: 'error',
          text: null,
          locales: [{
            locale: 'en', value: 'This is an error banner',
          }],
          appIds: [1],
          isActive: true,
          createdAt: dbTime,
          updatedAt: dbTime,
          deletedAt: null,
        })

        const res3 = await app.request(
          `${BaseRoute}/3`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json3 = await res3.json() as { appBanner: bannerModel.Record }

        expect(json3.appBanner).toStrictEqual({
          id: 3,
          type: 'warning',
          text: 'This is a warning banner',
          locales: [],
          appIds: [],
          isActive: true,
          createdAt: dbTime,
          updatedAt: dbTime,
          deletedAt: null,
        })

        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should return app banner with read app scope',
      async () => {
        process.env.ENABLE_APP_BANNER = true as unknown as string

        await attachIndividualScopes(db)
        await insertAppBanner()
        const res = await app.request(
          `${BaseRoute}/1`,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadApp,
              )}`,
            },
          },
          mock(db),
        )
        const json = await res.json() as { appBanner: bannerModel.Record }

        expect(json.appBanner).toStrictEqual({
          id: 1,
          type: 'info',
          text: 'This is a info banner',
          locales: [{
            locale: 'en', value: 'This is an info banner',
          }],
          appIds: [1, 2],
          isActive: true,
          createdAt: dbTime,
          updatedAt: dbTime,
          deletedAt: null,
        })

        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        process.env.ENABLE_APP_BANNER = true as unknown as string

        await attachIndividualScopes(db)
        const res = await app.request(
          `${BaseRoute}/1`,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.WriteApp,
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

        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should throw error when ENABLE_APP_BANNER is false',
      async () => {
        await attachIndividualScopes(db)
        const res = await app.request(
          `${BaseRoute}/1`,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadApp,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(messageConfig.ConfigError.AppBannerNotEnabled)
      },
    )
  },
)

describe(
  'delete',
  () => {
    test(
      'should delete app banner',
      async () => {
        process.env.ENABLE_APP_BANNER = true as unknown as string
        await insertAppBanner()
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

        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should throw error when ENABLE_APP_BANNER is false',
      async () => {
        const res = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'DELETE', headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(messageConfig.ConfigError.AppBannerNotEnabled)
      },
    )
  },
)

describe(
  'update',
  () => {
    test(
      'should update app banner',
      async () => {
        process.env.ENABLE_APP_BANNER = true as unknown as string

        await insertAppBanner()
        const updateObj = {
          type: 'error',
          text: 'This is a error banner 1',
          locales: [{
            locale: 'en', value: 'This is an error banner 1',
          }],
          isActive: false,
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
          appBanner: {
            id: 1,
            type: 'error',
            text: 'This is a error banner 1',
            locales: [{
              locale: 'en', value: 'This is an error banner 1',
            }],
            appIds: [1, 2],
            isActive: false,
            createdAt: dbTime,
            updatedAt: dbTime,
            deletedAt: null,
          },
        })

        const res2 = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify({
              locales: [{
                locale: 'en', value: 'This is an error banner 1 en',
              }, {
                locale: 'fr', value: 'This is an error banner 1 fr',
              }],
            }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json2 = await res2.json()

        expect(json2).toStrictEqual({
          appBanner: {
            id: 1,
            type: 'error',
            text: 'This is a error banner 1',
            locales: [{
              locale: 'en', value: 'This is an error banner 1 en',
            }, {
              locale: 'fr', value: 'This is an error banner 1 fr',
            }],
            appIds: [1, 2],
            isActive: false,
            createdAt: dbTime,
            updatedAt: dbTime,
            deletedAt: null,
          },
        })

        const res3 = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify({ text: 'This is a error banner 2' }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json3 = await res3.json()

        expect(json3).toStrictEqual({
          appBanner: {
            id: 1,
            type: 'error',
            text: 'This is a error banner 2',
            locales: [{
              locale: 'en', value: 'This is an error banner 1 en',
            }, {
              locale: 'fr', value: 'This is an error banner 1 fr',
            }],
            appIds: [1, 2],
            isActive: false,
            createdAt: dbTime,
            updatedAt: dbTime,
            deletedAt: null,
          },
        })

        const res4 = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify({ isActive: true }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json4 = await res4.json()

        expect(json4).toStrictEqual({
          appBanner: {
            id: 1,
            type: 'error',
            text: 'This is a error banner 2',
            locales: [{
              locale: 'en', value: 'This is an error banner 1 en',
            }, {
              locale: 'fr', value: 'This is an error banner 1 fr',
            }],
            appIds: [1, 2],
            isActive: true,
            createdAt: dbTime,
            updatedAt: dbTime,
            deletedAt: null,
          },
        })

        const res5 = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify({ appIds: [1] }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json5 = await res5.json()

        expect(json5).toStrictEqual({
          appBanner: {
            id: 1,
            type: 'error',
            text: 'This is a error banner 2',
            locales: [{
              locale: 'en', value: 'This is an error banner 1 en',
            }, {
              locale: 'fr', value: 'This is an error banner 1 fr',
            }],
            appIds: [1],
            isActive: true,
            createdAt: dbTime,
            updatedAt: dbTime,
            deletedAt: null,
          },
        })

        const res6 = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify({ appIds: [2] }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json6 = await res6.json()

        expect(json6).toStrictEqual({
          appBanner: {
            id: 1,
            type: 'error',
            text: 'This is a error banner 2',
            locales: [{
              locale: 'en', value: 'This is an error banner 1 en',
            }, {
              locale: 'fr', value: 'This is an error banner 1 fr',
            }],
            appIds: [2],
            isActive: true,
            createdAt: dbTime,
            updatedAt: dbTime,
            deletedAt: null,
          },
        })

        process.env.ENABLE_APP_BANNER = false as unknown as string
      },
    )

    test(
      'should throw error when ENABLE_USER_ATTRIBUTE is false',
      async () => {
        await attachIndividualScopes(db)
        await insertAppBanner()
        const res = await app.request(
          `${BaseRoute}/1`,
          {
            method: 'PUT',
            body: JSON.stringify({ type: 'error' }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(messageConfig.ConfigError.AppBannerNotEnabled)
      },
    )
  },
)
