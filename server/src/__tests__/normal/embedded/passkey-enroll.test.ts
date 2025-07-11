import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { sendInitiateRequest } from './initiate.test'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
  passkeyEnrollMock,
} from 'tests/mock'
import {
  adapterConfig,
  messageConfig, routeConfig,
} from 'configs'
import {
  getApp, insertUsers,
} from 'tests/identity'
import { userModel } from 'models'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

export const sendVerifiedSignInRequest = async (
  db: Database,
  {
    email,
    password,
  }: {
    email?: string;
    password?: string;
    genSecret?: boolean;
    markAsVerified?: boolean;
  },
) => {
  const appRecord = await getApp(db)

  const initiateRes = await sendInitiateRequest(
    db,
    appRecord,
  )

  const { sessionId } = await initiateRes.json() as { sessionId: string }

  await insertUsers(db)

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

export const sendCorrectEnrollPasskeyReq = async ({
  sessionId, challenge, db,
}: { sessionId: string; challenge?: string; db: Database }) => {
  await mockedKV.put(
    `${adapterConfig.BaseKVKey.PasskeyEnrollChallenge}-1`,
    challenge ?? 'Gu09HnxTsc01smwaCtC6yHE0MEg_d-qKUSpKi5BbLgU',
  )

  const res = await app.request(
    routeConfig.EmbeddedRoute.PasskeyEnroll.replace(
      ':sessionId',
      sessionId,
    ),
    {
      method: 'POST',
      body: JSON.stringify({ enrollInfo: passkeyEnrollMock }),
    },
    mock(db),
  )

  return { res }
}

describe(
  'get /passkey-enroll',
  () => {
    test(
      'should get passkey enroll',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const passkeyEnrollRes = await app.request(
          routeConfig.EmbeddedRoute.PasskeyEnroll.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(passkeyEnrollRes.status).toBe(200)

        const passkeyEnrollJson = await passkeyEnrollRes.json() as { enrollOptions: string }
        expect(passkeyEnrollJson).toStrictEqual({
          enrollOptions: {
            attestation: 'none',
            authenticatorSelection: {
              requireResidentKey: false,
              userVerification: 'preferred',
              residentKey: 'preferred',
            },
            challenge: expect.any(String),
            extensions: { credProps: true },
            excludeCredentials: [],
            hints: [],
            pubKeyCredParams: [
              {
                alg: -8,
                type: 'public-key',
              },
              {
                alg: -7,
                type: 'public-key',
              },
              {
                alg: -257,
                type: 'public-key',
              },
            ],
            rp: {
              id: 'localhost',
              name: '',
            },
            timeout: 60000,
            user: {
              displayName: ' ',
              id: expect.any(String),
              name: 'test@email.com',
            },
          },
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if feature not allowed',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const passkeyEnrollRes = await app.request(
          routeConfig.EmbeddedRoute.PasskeyEnroll.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(passkeyEnrollRes.status).toBe(400)
        expect(await passkeyEnrollRes.text()).toBe(messageConfig.ConfigError.PasskeyEnrollmentNotEnabled)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if passwordless sign in is enabled',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string
        const passkeyEnrollRes = await app.request(
          routeConfig.EmbeddedRoute.PasskeyEnroll.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(passkeyEnrollRes.status).toBe(400)
        expect(await passkeyEnrollRes.text()).toBe(messageConfig.ConfigError.PasskeyEnrollmentNotEnabled)

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if use wrong code',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const passkeyEnrollRes = await app.request(
          routeConfig.EmbeddedRoute.PasskeyEnroll.replace(
            ':sessionId',
            'abc',
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(passkeyEnrollRes.status).toBe(404)
        expect(await passkeyEnrollRes.text()).toBe(messageConfig.RequestError.WrongSessionId)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )
  },
)

describe(
  'post /passkey-enroll',
  () => {
    test(
      'should enroll passkey',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const { res } = await sendCorrectEnrollPasskeyReq({
          sessionId, db,
        })

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          success: true,
        })

        const passkey = db.prepare('SELECT * from user_passkey WHERE "userId" = 1 AND "credentialId" = ?').get(passkeyEnrollMock.rawId)
        expect(passkey).toBeTruthy()

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if can not find challenge',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const res = await app.request(
          routeConfig.EmbeddedRoute.PasskeyEnroll.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({ enrollInfo: passkeyEnrollMock }),
          },
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidPasskeyEnrollRequest)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if feature not allowed',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const { res } = await sendCorrectEnrollPasskeyReq({
          sessionId, db,
        })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.PasskeyEnrollmentNotEnabled)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if return wrong challenge',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const { res } = await sendCorrectEnrollPasskeyReq({
          sessionId, challenge: 'abcde', db,
        })
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidPasskeyEnrollRequest)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if use wrong session id',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const { res } = await sendCorrectEnrollPasskeyReq({
          sessionId: 'abc', db,
        })
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongSessionId)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if can not verify passkey',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const res = await app.request(
          routeConfig.EmbeddedRoute.PasskeyEnroll.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({
              enrollInfo: {
                ...passkeyEnrollMock,
                rawId: '123',
              },
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidPasskeyEnrollRequest)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )
  },
)

describe(
  'post /passkey-enroll-decline',
  () => {
    test(
      'should skip passkey enroll',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const res = await app.request(
          routeConfig.EmbeddedRoute.PasskeyEnrollDecline.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({ remember: false }),
          },
          mock(db),
        )

        expect(await res.json()).toStrictEqual({
          sessionId,
          success: true,
        })

        const user = await db.prepare('SELECT * from "user" WHERE "id" = 1').get() as userModel.Raw
        expect(user.skipPasskeyEnroll).toBe(0)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should skip passkey enroll and remember',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const res = await app.request(
          routeConfig.EmbeddedRoute.PasskeyEnrollDecline.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({ remember: true }),
          },
          mock(db),
        )

        expect(await res.json()).toStrictEqual({
          sessionId,
          success: true,
        })

        const user = await db.prepare('SELECT * from "user" WHERE "id" = 1').get() as userModel.Raw
        expect(user.skipPasskeyEnroll).toBe(1)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if use session id',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const res = await app.request(
          routeConfig.EmbeddedRoute.PasskeyEnrollDecline.replace(
            ':sessionId',
            'abc',
          ),
          {
            method: 'POST',
            body: JSON.stringify({ remember: false }),
          },
          mock(db),
        )

        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongSessionId)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if feature not allowed',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const res = await app.request(
          routeConfig.EmbeddedRoute.PasskeyEnrollDecline.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({ remember: false }),
          },
          mock(db),
        )

        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.PasskeyEnrollmentNotEnabled)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )
  },
)
