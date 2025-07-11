import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { sendCorrectEnrollPasskeyReq } from './passkey-enroll.test'
import { sendInitiateRequest } from './initiate.test'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
  passkeyEnrollMock,
  passkeyVerifyMock,
} from 'tests/mock'
import {
  adapterConfig, messageConfig, routeConfig,
} from 'configs'
import {
  getApp,
  insertUsers,
} from 'tests/identity'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const sendInitialRequest = async (db: Database) => {
  const appRecord = await getApp(db)

  const initiateRes = await sendInitiateRequest(
    db,
    appRecord,
  )

  const { sessionId } = await initiateRes.json() as { sessionId: string }

  return { sessionId }
}

const sendEnrollRequest = async ({ db }: { db: Database }) => {
  const { sessionId } = await sendInitialRequest(db)

  await app.request(
    routeConfig.EmbeddedRoute.SignIn.replace(
      ':sessionId',
      sessionId,
    ),
    {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@email.com',
        password: 'Password1!',
      }),
    },
    mock(db),
  )

  await mockedKV.put(
    `${adapterConfig.BaseKVKey.PasskeyEnrollChallenge}-1`,
    'Gu09HnxTsc01smwaCtC6yHE0MEg_d-qKUSpKi5BbLgU',
  )

  const { res } = await sendCorrectEnrollPasskeyReq({
    sessionId, db,
  })

  return { res }
}

describe(
  'get /authorize-passkey-verify',
  () => {
    test(
      'could get passkey verify options by email',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        await insertUsers(db)

        await sendEnrollRequest({ db })

        const { sessionId } = await sendInitialRequest(db)

        const res = await app.request(
          `${routeConfig.EmbeddedRoute.PasskeyVerify.replace(
            ':sessionId',
            sessionId,
          )}?email=test@email.com`,
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
          `${routeConfig.EmbeddedRoute.PasskeyVerify.replace(
            ':sessionId',
            sessionId,
          )}?email=test1@email.com`,
          {},
          mock(db),
        )
        const json1 = await res1.json()
        expect(json1).toStrictEqual({ passkeyOption: null })

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if feature not allowed',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const { sessionId } = await sendInitialRequest(db)

        const res = await app.request(
          `${routeConfig.EmbeddedRoute.PasskeyVerify.replace(
            ':sessionId',
            sessionId,
          )}?email=test@email.com`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.PasskeyEnrollmentNotEnabled)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if email is not provided',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        const { sessionId } = await sendInitialRequest(db)

        const res = await app.request(
          `${routeConfig.EmbeddedRoute.PasskeyVerify.replace(
            ':sessionId',
            sessionId,
          )}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        const json = await res.json() as { constraints: { isEmail: string; isNotEmpty: string } }[]
        expect(json[0].constraints).toStrictEqual({
          isEmail: 'email must be an email',
          isNotEmpty: 'email should not be empty',
        })

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )
  },
)

describe(
  'post /passkey-verify',
  () => {
    test(
      'should verify passkey',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        await insertUsers(db)

        await sendEnrollRequest({ db })

        const { sessionId } = await sendInitialRequest(db)

        await mockedKV.put(
          `${adapterConfig.BaseKVKey.PasskeyVerifyChallenge}-test@email.com`,
          'hJ95J5Tc52hkJlWaWdBXqPUhnLGkGR3Nqkn2VwPjAXc',
        )

        const res = await app.request(
          routeConfig.EmbeddedRoute.PasskeyVerify.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({
              email: 'test@email.com',
              passkeyInfo: passkeyVerifyMock,
            }),
          },
          mock(db),
        )

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          success: true,
        })

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['otp', 'email'] as unknown as string
      },
    )

    test(
      'should throw error if wrong challenge provided',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        await insertUsers(db)

        await sendEnrollRequest({ db })

        const { sessionId } = await sendInitialRequest(db)

        await mockedKV.put(
          `${adapterConfig.BaseKVKey.PasskeyVerifyChallenge}-test@email.com`,
          'abc',
        )

        const res = await app.request(
          routeConfig.EmbeddedRoute.PasskeyVerify.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({
              email: 'test@email.com',
              passkeyInfo: passkeyVerifyMock,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidPasskeyVerifyRequest)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['otp', 'email'] as unknown as string
      },
    )

    test(
      'should throw error if feature not allowed',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        await insertUsers(db)

        await sendEnrollRequest({ db })

        const { sessionId } = await sendInitialRequest(db)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string

        const res = await app.request(
          routeConfig.EmbeddedRoute.PasskeyVerify.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({
              email: 'test@email.com',
              passkeyInfo: passkeyVerifyMock,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.PasskeyEnrollmentNotEnabled)

        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['otp', 'email'] as unknown as string
      },
    )
  },
)
