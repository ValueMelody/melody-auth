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
  adapterConfig, messageConfig, routeConfig,
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

const sendSignUpRequest = async (
  db: Database,
  {
    email,
    password,
    firstName,
    lastName,
  }: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
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
    routeConfig.EmbeddedRoute.SignUp.replace(
      ':sessionId',
      sessionId,
    ),
    {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
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
  'post /email-mfa-code',
  () => {
    test(
      'should post email mfa code',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string

        const {
          res, sessionId,
        } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
          },
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          nextStep: routeConfig.View.EmailMfa,
          success: false,
        })

        const consentRes = await app.request(
          routeConfig.EmbeddedRoute.EmailMfaCode.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'POST' },
          mock(db),
        )
        expect(consentRes.status).toBe(200)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${sessionId}`)
        expect(mfaCode?.length).toBe(6)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error with invalid session id',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string

        const consentRes = await app.request(
          routeConfig.EmbeddedRoute.EmailMfaCode.replace(
            ':sessionId',
            'abc',
          ),
          { method: 'POST' },
          mock(db),
        )
        expect(consentRes.status).toBe(404)
        expect(await consentRes.text()).toStrictEqual(messageConfig.RequestError.WrongSessionId)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-abc`)
        expect(mfaCode).toBeNull()

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )
  },
)

describe(
  'post /process-email-mfa',
  () => {
    test(
      'should process email mfa',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string

        const {
          res, sessionId,
        } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
          },
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          nextStep: routeConfig.View.EmailMfa,
          success: false,
        })

        const consentRes = await app.request(
          routeConfig.EmbeddedRoute.EmailMfaCode.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'POST' },
          mock(db),
        )
        expect(consentRes.status).toBe(200)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${sessionId}`)
        expect(mfaCode?.length).toBe(6)

        const processRes = await app.request(
          routeConfig.EmbeddedRoute.EmailMfa.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST', body: JSON.stringify({ mfaCode }),
          },
          mock(db),
        )
        expect(processRes.status).toBe(200)

        const processJson = await processRes.json()
        expect(processJson).toStrictEqual({
          sessionId,
          success: true,
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error with invalid session id',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string

        const {
          res, sessionId,
        } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
          },
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          nextStep: routeConfig.View.EmailMfa,
          success: false,
        })

        const consentRes = await app.request(
          routeConfig.EmbeddedRoute.EmailMfaCode.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'POST' },
          mock(db),
        )
        expect(consentRes.status).toBe(200)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${sessionId}`)
        expect(mfaCode?.length).toBe(6)

        const processRes = await app.request(
          routeConfig.EmbeddedRoute.EmailMfa.replace(
            ':sessionId',
            'abc',
          ),
          {
            method: 'POST', body: JSON.stringify({ mfaCode }),
          },
          mock(db),
        )
        expect(processRes.status).toBe(404)
        expect(await processRes.text()).toStrictEqual(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error if wrong mfa code is provided',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string

        const {
          res, sessionId,
        } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
          },
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          nextStep: routeConfig.View.EmailMfa,
          success: false,
        })

        const consentRes = await app.request(
          routeConfig.EmbeddedRoute.EmailMfaCode.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'POST' },
          mock(db),
        )
        expect(consentRes.status).toBe(200)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${sessionId}`)
        expect(mfaCode?.length).toBe(6)

        const processRes = await app.request(
          routeConfig.EmbeddedRoute.EmailMfa.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST', body: JSON.stringify({ mfaCode: '123456' }),
          },
          mock(db),
        )
        expect(processRes.status).toBe(401)
        expect(await processRes.text()).toStrictEqual(messageConfig.RequestError.WrongMfaCode)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should set remember device cookie when rememberDevice is true',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string

        const {
          res, sessionId,
        } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
          },
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          nextStep: routeConfig.View.EmailMfa,
          success: false,
        })

        const consentRes = await app.request(
          routeConfig.EmbeddedRoute.EmailMfaCode.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'POST' },
          mock(db),
        )
        expect(consentRes.status).toBe(200)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${sessionId}`)
        expect(mfaCode?.length).toBe(6)

        const processRes = await app.request(
          routeConfig.EmbeddedRoute.EmailMfa.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST', body: JSON.stringify({ mfaCode, rememberDevice: true }),
          },
          mock(db),
        )
        expect(processRes.status).toBe(200)

        const processJson = await processRes.json()
        expect(processJson).toStrictEqual({
          sessionId,
          success: true,
        })

        const setCookieHeader = processRes.headers.get('Set-Cookie')
        expect(setCookieHeader).toContain('EMRD-2=')
        expect(setCookieHeader).toContain('HttpOnly')
        expect(setCookieHeader).toContain('Secure')
        expect(setCookieHeader).toContain('SameSite=Strict')

        const cookieMatch = setCookieHeader?.match(/EMRD-2=([^;]+)/)
        const cookieValue = cookieMatch?.[1]
        expect(cookieValue).toBeDefined()
        expect(cookieValue?.split('-')).toHaveLength(2)
        expect(cookieValue?.split('-')[0]).toHaveLength(24)
        expect(cookieValue?.split('-')[1]).toHaveLength(128)

        const [deviceId, storedCookieValue] = cookieValue!.split('-')
        const kvKey = `${adapterConfig.BaseKVKey.EmailMfaRememberDevice}-2-${deviceId}`
        const storedValue = await mockedKV.get(kvKey)
        expect(storedValue).toBe(storedCookieValue)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
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
        process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string

        const {
          res, sessionId,
        } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
          },
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          nextStep: routeConfig.View.EmailMfa,
          success: false,
        })

        const consentRes = await app.request(
          routeConfig.EmbeddedRoute.EmailMfaCode.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'POST' },
          mock(db),
        )
        expect(consentRes.status).toBe(200)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${sessionId}`)
        expect(mfaCode?.length).toBe(6)

        const processRes = await app.request(
          routeConfig.EmbeddedRoute.EmailMfa.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST', body: JSON.stringify({ mfaCode, rememberDevice: false }),
          },
          mock(db),
        )
        expect(processRes.status).toBe(200)

        const processJson = await processRes.json()
        expect(processJson).toStrictEqual({
          sessionId,
          success: true,
        })

        const setCookieHeader = processRes.headers.get('Set-Cookie')
        expect(setCookieHeader).toBeNull()

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
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
        process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string

        const {
          res, sessionId,
        } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
          },
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          nextStep: routeConfig.View.EmailMfa,
          success: false,
        })

        const consentRes = await app.request(
          routeConfig.EmbeddedRoute.EmailMfaCode.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'POST' },
          mock(db),
        )
        expect(consentRes.status).toBe(200)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${sessionId}`)
        expect(mfaCode?.length).toBe(6)

        const processRes = await app.request(
          routeConfig.EmbeddedRoute.EmailMfa.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST', body: JSON.stringify({ mfaCode, rememberDevice: true }),
          },
          mock(db),
        )
        expect(processRes.status).toBe(200)

        const processJson = await processRes.json()
        expect(processJson).toStrictEqual({
          sessionId,
          success: true,
        })

        const setCookieHeader = processRes.headers.get('Set-Cookie')
        expect(setCookieHeader).toBeNull()

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should bypass email mfa on subsequent login when device is remembered',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string

        // First login with MFA to set remember device cookie
        const {
          res, sessionId,
        } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
          },
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          nextStep: routeConfig.View.EmailMfa,
          success: false,
        })

        // Generate MFA code
        const consentRes = await app.request(
          routeConfig.EmbeddedRoute.EmailMfaCode.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'POST' },
          mock(db),
        )
        expect(consentRes.status).toBe(200)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${sessionId}`)
        expect(mfaCode?.length).toBe(6)

        // Complete MFA with rememberDevice: true
        const processRes = await app.request(
          routeConfig.EmbeddedRoute.EmailMfa.replace(
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
        expect(processRes.status).toBe(200)

        const processJson = await processRes.json()
        expect(processJson).toStrictEqual({
          sessionId,
          success: true,
        })

        // Extract the remember device cookie
        const setCookieHeader = processRes.headers.get('Set-Cookie')
        expect(setCookieHeader).toContain('EMRD-2=')

        const cookieMatch = setCookieHeader?.match(/EMRD-2=([^;]+)/)
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
              email: 'test1@email.com',
              password: 'Password1!',
            }),
            headers: { Cookie: `EMRD-2=${cookieValue}` },
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
        process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
      },
    )

    test(
      'should not bypass email mfa when invalid remember device cookie is provided',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string

        const appRecord = await getApp(db)

        const initiateRes = await sendInitiateRequest(
          db,
          appRecord,
        )

        const { sessionId } = await initiateRes.json() as { sessionId: string }

        await insertUsers(db)

        const signInRes = await app.request(
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
            headers: { Cookie: 'EMRD-2=invalid-cookie-value-123' },
          },
          mock(db),
        )

        expect(signInRes.status).toBe(200)
        const signInJson = await signInRes.json()
        expect(signInJson).toStrictEqual({
          sessionId,
          nextStep: routeConfig.View.EmailMfa,
          success: false,
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
      },
    )
  },
)
