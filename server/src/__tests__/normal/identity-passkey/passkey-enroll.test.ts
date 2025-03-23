import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
  passkeyEnrollMock,
} from 'tests/mock'
import {
  adapterConfig, messageConfig, routeConfig,
} from 'configs'
import { userModel } from 'models'
import {
  prepareFollowUpBody, prepareFollowUpParams, insertUsers, getCodeFromParams,
} from 'tests/identity'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const sendCorrectGetEnrollPasskeyReq = async ({ code }: { code?: string } = {}) => {
  await insertUsers(db)
  const body = await prepareFollowUpBody(db)
  const res = await app.request(
    `${routeConfig.IdentityRoute.ProcessPasskeyEnroll}?code=${code ?? body.code}`,
    {},
    mock(db),
  )
  return { res }
}

const sendCorrectEnrollPasskeyReq = async ({ code }: { code?: string } = {}) => {
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
    routeConfig.IdentityRoute.ProcessPasskeyEnroll,
    {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        code: code ?? body.code,
        enrollInfo: passkeyEnrollMock,
      }),
    },
    mock(db),
  )
  return res
}

describe(
  'get /authorize-passkey-enroll',
  () => {
    test(
      'should get enrollment options',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        const { res } = await sendCorrectGetEnrollPasskeyReq()

        const json = await res.json()
        expect(json).toStrictEqual({
          enrollOptions: {
            challenge: expect.any(String),
            rpId: 'localhost',
            userDisplayName: ' ',
            userEmail: 'test@email.com',
            userId: 1,
          },
        })

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if feature not allowed',
      async () => {
        const { res } = await sendCorrectGetEnrollPasskeyReq()
        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if passwordless sign in is enabled',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        await insertUsers(
          db,
          false,
        )

        await mockedKV.put(
          `${adapterConfig.BaseKVKey.PasskeyEnrollChallenge}-1`,
          'Gu09HnxTsc01smwaCtC6yHE0MEg_d-qKUSpKi5BbLgU',
        )

        const body = await prepareFollowUpBody(db)

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string
        const res = await app.request(
          routeConfig.IdentityRoute.ProcessPasskeyEnroll,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              enrollInfo: passkeyEnrollMock,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if use wrong code',
      async () => {
        const { res } = await sendCorrectGetEnrollPasskeyReq({ code: 'abc' })
        expect(res.status).toBe(400)
      },
    )
  },
)

describe(
  'post /authorize-passkey-enroll',
  () => {
    test(
      'should enroll passkey',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        const res = await sendCorrectEnrollPasskeyReq()
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
        const res = await sendCorrectEnrollPasskeyReq()
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
          routeConfig.IdentityRoute.ProcessPasskeyEnroll,
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
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidPasskeyEnrollRequest)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if use wrong code',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        const res = await sendCorrectEnrollPasskeyReq({ code: 'abc' })
        expect(res.status).toBe(400)

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
          `${routeConfig.IdentityRoute.ProcessPasskeyEnroll}${params}`,
          {},
          mock(db),
        )

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessPasskeyEnrollDecline,
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
          `${routeConfig.IdentityRoute.ProcessPasskeyEnroll}${params}`,
          {},
          mock(db),
        )

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessPasskeyEnrollDecline,
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

    test(
      'should throw error if use wrong code',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        await app.request(
          `${routeConfig.IdentityRoute.ProcessPasskeyEnroll}${params}`,
          {},
          mock(db),
        )

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessPasskeyEnrollDecline,
          {
            method: 'POST',
            body: JSON.stringify({
              code: 'abc', locale: 'en', remember: false,
            }),
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
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)
        const code = getCodeFromParams(params)

        await app.request(
          `${routeConfig.IdentityRoute.ProcessPasskeyEnroll}${params}`,
          {},
          mock(db),
        )

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessPasskeyEnrollDecline,
          {
            method: 'POST',
            body: JSON.stringify({
              code, locale: 'en', remember: false,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )
  },
)
