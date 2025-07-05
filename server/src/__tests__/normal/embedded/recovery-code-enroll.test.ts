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

const sendVerifiedSignInRequest = async (
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

describe(
  'get /otp-mfa-setup',
  () => {
    test(
      'should get recovery code enroll',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const recoveryCodeEnrollRes = await app.request(
          routeConfig.EmbeddedRoute.RecoveryCodeEnroll.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(recoveryCodeEnrollRes.status).toBe(200)

        const recoveryCodeEnrollJson = await recoveryCodeEnrollRes.json() as { recoveryCode: string }
        expect(recoveryCodeEnrollJson.recoveryCode.length).toBe(24)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error if recovery code is already set',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const recoveryCodeEnrollRes = await app.request(
          routeConfig.EmbeddedRoute.RecoveryCodeEnroll.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(recoveryCodeEnrollRes.status).toBe(200)

        const recoveryCodeEnrollRes1 = await app.request(
          routeConfig.EmbeddedRoute.RecoveryCodeEnroll.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(recoveryCodeEnrollRes1.status).toBe(400)
        expect(await recoveryCodeEnrollRes1.text()).toBe(messageConfig.RequestError.RecoveryCodeAlreadySet)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error if session id is invalid',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string

        const recoveryCodeEnrollRes = await app.request(
          routeConfig.EmbeddedRoute.RecoveryCodeEnroll.replace(
            ':sessionId',
            '123456',
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(recoveryCodeEnrollRes.status).toBe(404)
        expect(await recoveryCodeEnrollRes.text()).toBe(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )
  },
)
