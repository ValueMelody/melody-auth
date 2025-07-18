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
  adapterConfig,
  messageConfig, routeConfig,
  typeConfig,
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
  'get /otp-mfa-setup',
  () => {
    test(
      'should get otp mfa setup',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string

        const {
          sessionId, otpSecret,
        } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.OtpMfaSetup.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(otpRes.status).toBe(200)

        const otpJson = await otpRes.json()
        expect(otpJson).toStrictEqual({
          otpUri: `otpauth://totp/Admin Panel (SPA):test@email.com?secret=${otpSecret}&issuer=melody-auth&algorithm=SHA1&digits=6&period=30`,
          otpSecret,
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error if otp mfa is already set',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          { markAsVerified: true },
        )

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.OtpMfaSetup.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(otpRes.status).toBe(400)
        expect(await otpRes.text()).toBe(messageConfig.RequestError.OtpAlreadySet)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error if session id is invalid',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.OtpMfaSetup.replace(
            ':sessionId',
            '123456',
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(otpRes.status).toBe(404)
        expect(await otpRes.text()).toBe(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'could generate secret if not set',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          { genSecret: false },
        )

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.OtpMfaSetup.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(otpRes.status).toBe(200)

        const {
          otpUri, otpSecret,
        } = await otpRes.json() as { otpUri: string; otpSecret: string }
        expect(otpSecret.length).toBe(32)
        expect(otpUri).toBe(`otpauth://totp/Admin Panel (SPA):test@email.com?secret=${otpSecret}&issuer=melody-auth&algorithm=SHA1&digits=6&period=30`)

        const user = await db.prepare('select * from "user" where id = ?').get(1) as userModel.Raw
        expect(user.otpSecret).toBe(otpSecret)

        const sessionBody = await mockedKV.get(`${adapterConfig.BaseKVKey.EmbeddedSession}-${sessionId}`)
        expect((JSON.parse(sessionBody!) as typeConfig.EmbeddedSessionBody).user?.otpSecret).toBe(otpSecret)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )
  },
)

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

    test(
      'should set remember device cookie when rememberDevice is true',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string

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
            method: 'POST',
            body: JSON.stringify({
              mfaCode,
              rememberDevice: true,
            }),
          },
          mock(db),
        )
        expect(otpRes.status).toBe(200)

        const otpJson = await otpRes.json()
        expect(otpJson).toStrictEqual({
          sessionId,
          success: true,
        })

        const setCookieHeader = otpRes.headers.get('Set-Cookie')
        expect(setCookieHeader).toContain('OMRD-1=')
        expect(setCookieHeader).toContain('HttpOnly')
        expect(setCookieHeader).toContain('Secure')
        expect(setCookieHeader).toContain('SameSite=Strict')

        const cookieMatch = setCookieHeader?.match(/OMRD-1=([^;]+)/)
        const cookieValue = cookieMatch?.[1]
        expect(cookieValue).toBeDefined()
        expect(cookieValue?.split('-')).toHaveLength(2)
        expect(cookieValue?.split('-')[0]).toHaveLength(24)
        expect(cookieValue?.split('-')[1]).toHaveLength(128)

        const [deviceId, storedCookieValue] = cookieValue!.split('-')
        const kvKey = `${adapterConfig.BaseKVKey.OtpMfaRememberDevice}-1-${deviceId}`
        const storedValue = await mockedKV.get(kvKey)
        expect(storedValue).toBe(storedCookieValue)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
      },
    )

    test(
      'should not set remember device cookie when rememberDevice is false',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string

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
            method: 'POST',
            body: JSON.stringify({
              mfaCode,
              rememberDevice: false,
            }),
          },
          mock(db),
        )
        expect(otpRes.status).toBe(200)

        const otpJson = await otpRes.json()
        expect(otpJson).toStrictEqual({
          sessionId,
          success: true,
        })

        const setCookieHeader = otpRes.headers.get('Set-Cookie')
        expect(setCookieHeader).toBeNull()

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
      },
    )

    test(
      'should not set remember device cookie when ENABLE_MFA_REMEMBER_DEVICE is false',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string

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
            method: 'POST',
            body: JSON.stringify({
              mfaCode,
              rememberDevice: true,
            }),
          },
          mock(db),
        )
        expect(otpRes.status).toBe(200)

        const otpJson = await otpRes.json()
        expect(otpJson).toStrictEqual({
          sessionId,
          success: true,
        })

        const setCookieHeader = otpRes.headers.get('Set-Cookie')
        expect(setCookieHeader).toBeNull()

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should bypass otp mfa on subsequent login when device is remembered',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string

        // First login with OTP MFA to set remember device cookie
        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const user = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const mfaCode = authenticator.generate(user.otpSecret)

        // Complete OTP MFA with rememberDevice: true
        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.OtpMfa.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({
              mfaCode,
              rememberDevice: true,
            }),
          },
          mock(db),
        )
        expect(otpRes.status).toBe(200)

        const otpJson = await otpRes.json()
        expect(otpJson).toStrictEqual({
          sessionId,
          success: true,
        })

        // Extract the remember device cookie
        const setCookieHeader = otpRes.headers.get('Set-Cookie')
        expect(setCookieHeader).toContain('OMRD-1=')

        const cookieMatch = setCookieHeader?.match(/OMRD-1=([^;]+)/)
        const cookieValue = cookieMatch?.[1]
        expect(cookieValue).toBeDefined()

        // Start a new login with the remember device cookie
        const appRecord = await getApp(db)

        const initiateRes = await sendInitiateRequest(
          db,
          appRecord,
        )

        const { sessionId: newSessionId } = await initiateRes.json() as { sessionId: string }

        const secondSignInRes = await app.request(
          routeConfig.EmbeddedRoute.SignIn.replace(
            ':sessionId',
            newSessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({
              email: 'test@email.com',
              password: 'Password1!',
            }),
            headers: { Cookie: `OMRD-1=${cookieValue}` },
          },
          mock(db),
        )

        expect(secondSignInRes.status).toBe(200)
        const secondSignInJson = await secondSignInRes.json()
        expect(secondSignInJson).toStrictEqual({
          sessionId: newSessionId,
          success: true,
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
      },
    )

    test(
      'should not bypass otp mfa when invalid remember device cookie is provided',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string

        const appRecord = await getApp(db)

        const initiateRes = await sendInitiateRequest(
          db,
          appRecord,
        )

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const user = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const mfaCode = authenticator.generate(user.otpSecret)

        // Complete OTP MFA with rememberDevice: true
        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.OtpMfa.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({
              mfaCode,
            }),
          },
          mock(db),
        )
        expect(otpRes.status).toBe(200)

        const { sessionId: newSessionId } = await initiateRes.json() as { sessionId: string }

        const signInRes = await app.request(
          routeConfig.EmbeddedRoute.SignIn.replace(
            ':sessionId',
            newSessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({
              email: 'test@email.com',
              password: 'Password1!',
            }),
            headers: { Cookie: 'OMRD-1=invalid-cookie-value-123' },
          },
          mock(db),
        )

        expect(signInRes.status).toBe(200)
        const signInJson = await signInRes.json()
        expect(signInJson).toStrictEqual({
          sessionId: newSessionId,
          nextStep: routeConfig.View.OtpMfa,
          success: false,
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
      },
    )
  },
)
