import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { JSDOM } from 'jsdom'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
  passkeyEnrollMock,
  passkeyVerifyMock,
} from 'tests/mock'
import {
  adapterConfig, localeConfig, routeConfig,
} from 'configs'
import { userModel } from 'models'
import {
  prepareFollowUpBody, prepareFollowUpParams, insertUsers,
  postAuthorizeBody,
  getApp,
  getCodeFromParams,
} from 'tests/identity'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

describe(
  'get /authorize-passkey-enroll',
  () => {
    test(
      'should show passkey enroll page',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizePasskeyEnroll}${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        expect(html).toContain(localeConfig.authorizePasskeyEnroll.title.en)
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(1)
        expect(document.getElementsByTagName('button').length).toBe(2)
        expect(document.getElementsByTagName('button')[0].innerHTML).toBe(localeConfig.authorizePasskeyEnroll.skip.en)
        expect(document.getElementsByTagName('button')[1].innerHTML).toBe(localeConfig.authorizePasskeyEnroll.enroll.en)
        expect(document.getElementsByTagName('input')[0].type).toBe('checkbox')

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should redirect if use wrong auth code',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizePasskeyEnroll}?locale=en&code=abc`,
          {},
          mock(db),
        )
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=en`)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizePasskeyEnroll}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )
  },
)

export const enrollPasskey = async (db: Database) => {
  await insertUsers(
    db,
    false,
  )

  await mockedKV.put(
    `${adapterConfig.BaseKVKey.PasskeyEnrollChallenge}-1`,
    'Gu09HnxTsc01smwaCtC6yHE0MEg_d-qKUSpKi5BbLgU',
  )

  const body = await prepareFollowUpBody(db)
  const res = await app.request(
    routeConfig.IdentityRoute.AuthorizePasskeyEnroll,
    {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        enrollInfo: passkeyEnrollMock,
      }),
    },
    mock(db),
  )
  return res
}

describe(
  'post /authorize-passkey-enroll',
  () => {
    test(
      'should enroll passkey',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        const res = await enrollPasskey(db)
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        const passkey = db.prepare('SELECT * from user_passkey WHERE "userId" = 1 AND "credentialId" = ?').get(passkeyEnrollMock.rawId)
        expect(passkey).toBeTruthy()

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if feature not allowed',
      async () => {
        const res = await enrollPasskey(db)
        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if return wrong challenge',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await insertUsers(
          db,
          false,
        )

        await mockedKV.put(
          `${adapterConfig.BaseKVKey.PasskeyEnrollChallenge}-1`,
          'abcde',
        )

        const body = await prepareFollowUpBody(db)
        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizePasskeyEnroll,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              enrollInfo: passkeyEnrollMock,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(localeConfig.Error.InvalidRequest)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )
  },
)

describe(
  'post /authorize-passkey-enroll-decline',
  () => {
    test(
      'should skip passkey enroll',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)
        const code = getCodeFromParams(params)

        await app.request(
          `${routeConfig.IdentityRoute.AuthorizePasskeyEnroll}${params}`,
          {},
          mock(db),
        )

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizePasskeyEnrollDecline,
          {
            method: 'POST',
            body: JSON.stringify({
              code, locale: 'en', remember: false,
            }),
          },
          mock(db),
        )
        expect(await res.json()).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        const user = await db.prepare('SELECT * from "user" WHERE "id" = 1').get() as userModel.Raw
        expect(user.skipPasskeyEnroll).toBe(0)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should skip passkey enroll and remember',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)
        const code = getCodeFromParams(params)

        await app.request(
          `${routeConfig.IdentityRoute.AuthorizePasskeyEnroll}${params}`,
          {},
          mock(db),
        )

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizePasskeyEnrollDecline,
          {
            method: 'POST',
            body: JSON.stringify({
              code, locale: 'en', remember: true,
            }),
          },
          mock(db),
        )
        expect(await res.json()).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        const user = await db.prepare('SELECT * from "user" WHERE "id" = 1').get() as userModel.Raw
        expect(user.skipPasskeyEnroll).toBe(1)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )
  },
)

describe(
  'get /authorize-passkey-verify',
  () => {
    test(
      'could get passkey verify options by email',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await enrollPasskey(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizePasskeyVerify}?email=test@email.com`,
          {},
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          passkeyOption: {
            rpId: 'localhost',
            timeout: 60000,
            userVerification: 'preferred',
            challenge: await mockedKV.get(`${adapterConfig.BaseKVKey.PasskeyVerifyChallenge}-test@email.com`),
            allowCredentials: [{
              id: passkeyEnrollMock.rawId, type: 'public-key',
            }],
          },
        })

        const res1 = await app.request(
          `${routeConfig.IdentityRoute.AuthorizePasskeyVerify}?email=test1@email.com`,
          {},
          mock(db),
        )
        const json1 = await res1.json()
        expect(json1).toStrictEqual({ passkeyOption: null })

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if feature not allowed',
      async () => {
        const res = await app.request(`${routeConfig.IdentityRoute.AuthorizePasskeyVerify}?email=test@email.com`)
        expect(res.status).toBe(400)
      },
    )
  },
)

describe(
  'post /authorize-passkey-verify',
  () => {
    const passkeyVerify = async (db: Database) => {
      await enrollPasskey(db)

      await mockedKV.put(
        `${adapterConfig.BaseKVKey.PasskeyVerifyChallenge}-test@email.com`,
        'hJ95J5Tc52hkJlWaWdBXqPUhnLGkGR3Nqkn2VwPjAXc',
      )

      const appRecord = await getApp(db)
      const body = {
        ...(await postAuthorizeBody(appRecord)),
        email: 'test@email.com',
        passkeyInfo: passkeyVerifyMock,
      }

      const res = await app.request(
        routeConfig.IdentityRoute.AuthorizePasskeyVerify,
        {
          method: 'POST', body: JSON.stringify(body),
        },
        mock(db),
      )

      return res
    }

    test(
      'should verify passkey',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        const res = await passkeyVerify(db)

        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error if wrong challenge provided',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await enrollPasskey(db)

        await mockedKV.put(
          `${adapterConfig.BaseKVKey.PasskeyVerifyChallenge}-test@email.com`,
          'abc',
        )

        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
          passkeyInfo: passkeyVerifyMock,
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizePasskeyVerify,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(localeConfig.Error.InvalidRequest)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if passkey not match',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await enrollPasskey(db)

        await mockedKV.put(
          `${adapterConfig.BaseKVKey.PasskeyVerifyChallenge}-test@email.com`,
          'hJ95J5Tc52hkJlWaWdBXqPUhnLGkGR3Nqkn2VwPjAXc',
        )

        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test1@email.com',
          passkeyInfo: passkeyVerifyMock,
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizePasskeyVerify,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(400)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if feature not allowed',
      async () => {
        const res = await passkeyVerify(db)
        expect(res.status).toBe(400)
      },
    )
  },
)
