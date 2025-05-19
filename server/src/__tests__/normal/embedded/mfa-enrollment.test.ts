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
import { cryptoUtil } from 'utils'

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
    genSecret = true,
    markAsVerified = false,
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

  const otpSecret = genSecret ? cryptoUtil.genOtpSecret() : ''
  await db.prepare('UPDATE "user" SET "otpSecret" = ? WHERE id = ?').run(
    otpSecret,
    1,
  )

  if (markAsVerified) {
    await db.prepare('UPDATE "user" SET "otpVerified" = 1 WHERE id = ?').run(1)
  }

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
    otpSecret,
  }
}

describe(
  'get /mfa-enrollment',
  () => {
    test(
      'should get mfa enrollment',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const mfaEnrollmentRes = await app.request(
          routeConfig.EmbeddedRoute.MfaEnrollment.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(mfaEnrollmentRes.status).toBe(200)

        const mfaEnrollmentJson = await mfaEnrollmentRes.json()
        expect(mfaEnrollmentJson).toStrictEqual({ mfaTypes: ['otp', 'email'] })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        const mfaEnrollmentRes = await app.request(
          routeConfig.EmbeddedRoute.MfaEnrollment.replace(
            ':sessionId',
            '123',
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(mfaEnrollmentRes.status).toBe(404)
        expect(await mfaEnrollmentRes.text()).toContain(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )
  },
)

describe(
  'post /mfa-enrollment',
  () => {
    test(
      'should enroll otp mfa',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const mfaEnrollmentRes = await app.request(
          routeConfig.EmbeddedRoute.MfaEnrollment.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST', body: JSON.stringify({ type: 'otp' }),
          },
          mock(db),
        )

        expect(mfaEnrollmentRes.status).toBe(200)
        expect(await mfaEnrollmentRes.json()).toStrictEqual({
          sessionId,
          nextStep: 'otp_setup',
          success: false,
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should enroll email mfa',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const mfaEnrollmentRes = await app.request(
          routeConfig.EmbeddedRoute.MfaEnrollment.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST', body: JSON.stringify({ type: 'email' }),
          },
          mock(db),
        )

        expect(mfaEnrollmentRes.status).toBe(200)
        expect(await mfaEnrollmentRes.json()).toStrictEqual({
          sessionId,
          nextStep: 'email_mfa',
          success: false,
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error when sessionId is invalid',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        const mfaEnrollmentRes = await app.request(
          routeConfig.EmbeddedRoute.MfaEnrollment.replace(
            ':sessionId',
            '123',
          ),
          {
            method: 'POST', body: JSON.stringify({ type: 'otp' }),
          },
          mock(db),
        )
        expect(mfaEnrollmentRes.status).toBe(404)
        expect(await mfaEnrollmentRes.text()).toContain(messageConfig.RequestError.WrongSessionId)
      },
    )
  },
)
