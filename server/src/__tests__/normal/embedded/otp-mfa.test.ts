import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { authenticator } from 'otplib'
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
import { userModel } from 'models'

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
  },
) => {
  const appRecord = await getApp(db)

  const initiateRes = await sendInitiateRequest(
    db,
    appRecord,
  )

  const { sessionId } = await initiateRes.json() as { sessionId: string }

  await insertUsers(db)

  const otpSecret = cryptoUtil.genOtpSecret()
  await db.prepare('UPDATE "user" SET "otpSecret" = ? WHERE id = ?').run(
    otpSecret,
    1,
  )

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
  'get /otp-mfa',
  () => {
    test(
      'should get otp mfa config',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.OtpMfa.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(otpRes.status).toBe(200)

        const otpJson = await otpRes.json()
        expect(otpJson).toStrictEqual({ allowFallbackToEmailMfa: true })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should get false if otp mfa is not enrolled',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.OtpMfa.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(otpRes.status).toBe(200)

        const otpJson = await otpRes.json()
        expect(otpJson).toStrictEqual({ allowFallbackToEmailMfa: false })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should get false if user enrolled email mfa',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.OtpMfa.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(otpRes.status).toBe(200)

        const otpJson = await otpRes.json()
        expect(otpJson).toStrictEqual({ allowFallbackToEmailMfa: false })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'should get false if fallback is not allowed',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        process.env.ALLOW_EMAIL_MFA_AS_BACKUP = false as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.OtpMfa.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(otpRes.status).toBe(200)

        const otpJson = await otpRes.json()
        expect(otpJson).toStrictEqual({ allowFallbackToEmailMfa: false })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        process.env.ALLOW_EMAIL_MFA_AS_BACKUP = true as unknown as string
      },
    )
  },
)

describe(
  'post /otp-mfa',
  () => {
    test(
      'should verify otp mfa',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const user = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const mfaCode = authenticator.generate(user.otpSecret)

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.OtpMfa.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST', body: JSON.stringify({ mfaCode }),
          },
          mock(db),
        )
        expect(otpRes.status).toBe(200)

        const otpJson = await otpRes.json()
        expect(otpJson).toStrictEqual({
          sessionId,
          success: true,
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error if mfa code is invalid',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.OtpMfa.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST', body: JSON.stringify({ mfaCode: '123456' }),
          },
          mock(db),
        )
        expect(otpRes.status).toBe(401)
        expect(await otpRes.text()).toStrictEqual(messageConfig.RequestError.WrongMfaCode)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error if user has no otp secret',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        await db.prepare('UPDATE "user" SET "otpSecret" = ? WHERE id = 1').run('')

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.OtpMfa.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST', body: JSON.stringify({ mfaCode: '123456' }),
          },
          mock(db),
        )
        expect(otpRes.status).toBe(401)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )
  },
)
