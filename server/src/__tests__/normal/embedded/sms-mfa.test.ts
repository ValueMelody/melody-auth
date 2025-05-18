import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { sendInitiateRequest } from './initiate.test'
import app from 'index'
import {
  fetchMock,
  getSmsResponseMock,
  migrate, mock,
  mockedKV,
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

const sendVerifiedSignInRequest = async (
  db: Database,
  {
    email,
    password,
    insertPhoneNumber = true,
  }: {
    email?: string;
    password?: string;
    insertPhoneNumber?: boolean;
  },
) => {
  const appRecord = await getApp(db)

  await insertUsers(db)

  if (insertPhoneNumber) {
    await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
      '+16471231234',
      1,
    )
  }

  const initiateRes = await sendInitiateRequest(
    db,
    appRecord,
  )

  const { sessionId } = await initiateRes.json() as { sessionId: string }

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
  'post /sms-mfa-setup',
  () => {
    test(
      'should post sms mfa setup',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          { insertPhoneNumber: false },
        )

        const otpSetupRes = await app.request(
          routeConfig.EmbeddedRoute.SmsMfaSetup.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST', body: JSON.stringify({ phoneNumber: '+16471231234' }),
          },
          mock(db),
        )

        expect(otpSetupRes.status).toBe(200)

        const user = await db.prepare('select * from "user" where id = ?').get(1) as userModel.Raw
        expect(user.smsPhoneNumber).toBe('+16471231234')
        expect(user.smsPhoneNumberVerified).toBe(0)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${sessionId}`)
        expect(mfaCode?.length).toBe(6)

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.SmsMfa.replace(
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

        const newUser = await db.prepare('select * from "user" where id = ?').get(1) as userModel.Raw
        expect(newUser.smsPhoneNumber).toBe('+16471231234')
        expect(newUser.smsPhoneNumberVerified).toBe(1)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error if phone number is already enrolled',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const otpSetupRes = await app.request(
          routeConfig.EmbeddedRoute.SmsMfaSetup.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST', body: JSON.stringify({ phoneNumber: '+16471231234' }),
          },
          mock(db),
        )

        expect(otpSetupRes.status).toBe(400)
        expect(await otpSetupRes.text()).toBe(messageConfig.RequestError.MfaEnrolled)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error if session id is invalid',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        const otpSetupRes = await app.request(
          routeConfig.EmbeddedRoute.SmsMfaSetup.replace(
            ':sessionId',
            'invalid-session-id',
          ),
          {
            method: 'POST', body: JSON.stringify({ phoneNumber: '+16471231234' }),
          },
          mock(db),
        )

        expect(otpSetupRes.status).toBe(404)
        expect(await otpSetupRes.text()).toBe(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )
  },
)

describe(
  'get /sms-mfa',
  () => {
    test(
      'should get sms mfa config',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.SmsMfa.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )

        expect(otpRes.status).toBe(200)

        const otpJson = await otpRes.json()
        expect(otpJson).toStrictEqual({
          allowFallbackToEmailMfa: true,
          countryCode: '+1',
          phoneNumber: '********1234',
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error if session id is invalid',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.SmsMfa.replace(
            ':sessionId',
            'invalid-session-id',
          ),
          { method: 'GET' },
          mock(db),
        )

        expect(otpRes.status).toBe(404)
        expect(await otpRes.text()).toBe(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'should return fallback as false if not enabled',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'
        process.env.ALLOW_EMAIL_MFA_AS_BACKUP = false as unknown as string

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.SmsMfa.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )

        expect(otpRes.status).toBe(200)

        const otpJson = await otpRes.json()
        expect(otpJson).toStrictEqual({
          allowFallbackToEmailMfa: false,
          countryCode: '+1',
          phoneNumber: '********1234',
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
        process.env.ALLOW_EMAIL_MFA_AS_BACKUP = true as unknown as string
      },
    )

    test(
      'should return fallback as false if email mfa is required',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'
        process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.SmsMfa.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )

        expect(otpRes.status).toBe(200)

        const otpJson = await otpRes.json()
        expect(otpJson).toStrictEqual({
          allowFallbackToEmailMfa: false,
          countryCode: '+1',
          phoneNumber: '********1234',
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
        process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
      },
    )
  },
)

describe(
  'post /sms-mfa',
  () => {
    test(
      'should post sms mfa config',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        await app.request(
          routeConfig.EmbeddedRoute.SmsMfa.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${sessionId}`)
        expect(mfaCode?.length).toBe(6)

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.SmsMfa.replace(
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
        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error if mfa code is invalid',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        await app.request(
          routeConfig.EmbeddedRoute.SmsMfa.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.SmsMfa.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST', body: JSON.stringify({ mfaCode: '123456' }),
          },
          mock(db),
        )

        expect(otpRes.status).toBe(401)
        expect(await otpRes.text()).toBe(messageConfig.RequestError.WrongMfaCode)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error if session id is invalid',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.SmsMfa.replace(
            ':sessionId',
            'invalid-session-id',
          ),
          {
            method: 'POST', body: JSON.stringify({ mfaCode: '123456' }),
          },
          mock(db),
        )

        expect(otpRes.status).toBe(404)
        expect(await otpRes.text()).toBe(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )
  },
)

describe(
  'post /sms-mfa-code',
  () => {
    test(
      'should post sms mfa code',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        const { sessionId } = await sendVerifiedSignInRequest(
          db,
          {},
        )

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.SmsMfaCode.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'POST' },
          mock(db),
        )

        expect(otpRes.status).toBe(200)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${sessionId}`) ?? ''
        expect(mfaCode.length).toBe(6)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error if session id is invalid',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        const otpRes = await app.request(
          routeConfig.EmbeddedRoute.SmsMfaCode.replace(
            ':sessionId',
            'invalid-session-id',
          ),
          { method: 'POST' },
          mock(db),
        )

        expect(otpRes.status).toBe(404)
        expect(await otpRes.text()).toBe(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )
  },
)
