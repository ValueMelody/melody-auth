import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { authenticator } from 'otplib'
import { sendInitiateRequest } from './initiate.test'
import app from 'index'
import {
  fetchMock,
  getSmsResponseMock,
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  adapterConfig, messageConfig, routeConfig,
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

export const sendTokenExchangeRequest = async (
  db: Database,
  { sessionId }: {
    sessionId?: string;
  },
) => {
  const appRecord = await getApp(db)

  const initiateRes = await sendInitiateRequest(
    db,
    appRecord,
  )

  const { sessionId: correctSessionId } = await initiateRes.json() as { sessionId: string }

  await insertUsers(db)

  await app.request(
    routeConfig.EmbeddedRoute.SignIn.replace(
      ':sessionId',
      sessionId ?? correctSessionId,
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

  const res = await app.request(
    routeConfig.EmbeddedRoute.TokenExchange,
    {
      method: 'POST',
      body: JSON.stringify({
        codeVerifier: 'abc',
        sessionId: sessionId ?? correctSessionId,
      }),
    },
    mock(db),
  )

  return {
    res,
    sessionId: sessionId ?? correctSessionId,
  }
}

const setupTwoUsers = async (db: Database) => {
  await insertUsers(
    db,
    false,
  )
  await db.prepare(`
    INSERT INTO "user"
    ("authId", locale, email, "socialAccountId", "socialAccountType", password, "firstName", "lastName")
    values ('1-1-1-2', 'en', 'victim@email.com', null, null, ?, null, null)
  `).run('$2a$10$3HtEAf8YcN94V4GOR6ZBNu9tmoIflmEOqb9hUf0iqS4OjYVKe.9/C')
}

const initiateEmbeddedSession = async (db: Database) => {
  const appRecord = await getApp(db)
  const initiateRes = await sendInitiateRequest(
    db,
    appRecord,
  )
  const { sessionId } = await initiateRes.json() as { sessionId: string }
  const sessionKey = adapterConfig.getKVKey(
    adapterConfig.BaseKVKey.EmbeddedSession,
    sessionId,
  )
  const initialSession = await mockedKV.get(sessionKey)
  expect(initialSession).toBeTruthy()
  return {
    sessionId,
    sessionKey,
    initialSession: initialSession!,
  }
}

const signInEmbeddedSession = async (
  db: Database,
  sessionId: string,
  email: string,
  headers?: Record<string, string>,
) => app.request(
  routeConfig.EmbeddedRoute.SignIn.replace(
    ':sessionId',
    sessionId,
  ),
  {
    method: 'POST',
    body: JSON.stringify({
      email,
      password: 'Password1!',
    }),
    ...(headers ? { headers } : {}),
  },
  mock(db),
)

const exchangeEmbeddedSession = async (
  db: Database,
  sessionId: string,
) => app.request(
  routeConfig.EmbeddedRoute.TokenExchange,
  {
    method: 'POST',
    body: JSON.stringify({
      codeVerifier: 'abc',
      sessionId,
    }),
  },
  mock(db),
)

describe(
  '/token-exchange',
  () => {
    test(
      'should exchange auth code for access token, refresh token, id token',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        const {
          res, sessionId,
        } = await sendTokenExchangeRequest(
          db,
          {},
        )

        expect(res.status).toBe(200)

        expect(await res.json()).toStrictEqual({
          access_token: expect.any(String),
          expires_in: 1800,
          expires_on: expect.any(Number),
          refresh_token: expect.any(String),
          id_token: expect.any(String),
          not_before: expect.any(Number),
          refresh_token_expires_in: 604800,
          refresh_token_expires_on: expect.any(Number),
          scope: 'profile openid offline_access',
          token_type: 'Bearer',
        })

        const authCodeStore = await mockedKV.get(`${adapterConfig.BaseKVKey.AuthCode}-${sessionId}`)
        expect(authCodeStore).toBeNull()

        const sessionStore = await mockedKV.get(`${adapterConfig.BaseKVKey.EmbeddedSession}-${sessionId}`)
        expect(sessionStore).toBeNull()

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
      },
    )

    test(
      'should not allow the same session to be exchanged twice',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        const {
          res, sessionId,
        } = await sendTokenExchangeRequest(
          db,
          {},
        )

        expect(res.status).toBe(200)

        const replayRes = await app.request(
          routeConfig.EmbeddedRoute.TokenExchange,
          {
            method: 'POST',
            body: JSON.stringify({
              codeVerifier: 'abc',
              sessionId,
            }),
          },
          mock(db),
        )

        expect(replayRes.status).toBe(404)
        expect(await replayRes.text()).toStrictEqual(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
      },
    )

    test(
      'should throw error if no session found',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        const { res } = await sendTokenExchangeRequest(
          db,
          { sessionId: 'abc' },
        )

        expect(res.status).toBe(404)
        expect(await res.text()).toStrictEqual(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
      },
    )

    test(
      'should not accept attacker OTP MFA verified marker for victim on stale session overwrite',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string

        try {
          await setupTwoUsers(db)
          const attackerSecret = cryptoUtil.genOtpSecret()
          const victimSecret = cryptoUtil.genOtpSecret()
          await db.prepare('UPDATE "user" SET "otpSecret" = ?, "otpVerified" = 1 WHERE id = ?').run(
            attackerSecret,
            1,
          )
          await db.prepare('UPDATE "user" SET "otpSecret" = ?, "otpVerified" = 1 WHERE id = ?').run(
            victimSecret,
            2,
          )

          const {
            sessionId, sessionKey, initialSession,
          } = await initiateEmbeddedSession(db)

          const attackerSignInRes = await signInEmbeddedSession(
            db,
            sessionId,
            'test@email.com',
          )
          expect(attackerSignInRes.status).toBe(200)
          expect(await attackerSignInRes.json()).toStrictEqual({
            sessionId,
            nextStep: routeConfig.View.OtpMfa,
            success: false,
          })

          const attackerOtpRes = await app.request(
            routeConfig.EmbeddedRoute.OtpMfa.replace(
              ':sessionId',
              sessionId,
            ),
            {
              method: 'POST',
              body: JSON.stringify({ mfaCode: authenticator.generate(attackerSecret) }),
            },
            mock(db),
          )
          expect(attackerOtpRes.status).toBe(200)
          expect(await attackerOtpRes.json()).toStrictEqual({
            sessionId,
            success: true,
          })
          expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${sessionId}-1`)).toBe('1')

          // Simulate stale region B cache where session still has no user attached
          await mockedKV.put(
            sessionKey,
            initialSession,
          )

          const victimSignInRes = await signInEmbeddedSession(
            db,
            sessionId,
            'victim@email.com',
          )
          expect(victimSignInRes.status).toBe(200)
          expect(await victimSignInRes.json()).toStrictEqual({
            sessionId,
            nextStep: routeConfig.View.OtpMfa,
            success: false,
          })

          const tokenRes = await exchangeEmbeddedSession(
            db,
            sessionId,
          )
          expect(tokenRes.status).toBe(401)
          expect(await tokenRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)
          expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${sessionId}-2`)).toBeNull()
        } finally {
          process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
          process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['otp', 'email'] as unknown as string
          process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
          process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        }
      },
    )

    test(
      'should not accept attacker email MFA code or verified marker for victim on stale session overwrite',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string

        try {
          await setupTwoUsers(db)
          const {
            sessionId, sessionKey, initialSession,
          } = await initiateEmbeddedSession(db)

          const attackerSignInRes = await signInEmbeddedSession(
            db,
            sessionId,
            'test@email.com',
          )
          expect(attackerSignInRes.status).toBe(200)
          expect(await attackerSignInRes.json()).toStrictEqual({
            sessionId,
            nextStep: routeConfig.View.EmailMfa,
            success: false,
          })

          const sendCodeRes = await app.request(
            routeConfig.EmbeddedRoute.EmailMfaCode.replace(
              ':sessionId',
              sessionId,
            ),
            { method: 'POST' },
            mock(db),
          )
          expect(sendCodeRes.status).toBe(200)

          const attackerCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${sessionId}-1`)
          expect(attackerCode?.length).toBe(6)

          // Victim cannot verify using attacker's pending email MFA code
          await mockedKV.put(
            sessionKey,
            initialSession,
          )
          const victimWrongSignInRes = await signInEmbeddedSession(
            db,
            sessionId,
            'victim@email.com',
          )
          expect(victimWrongSignInRes.status).toBe(200)

          const victimSubmitRes = await app.request(
            routeConfig.EmbeddedRoute.EmailMfa.replace(
              ':sessionId',
              sessionId,
            ),
            {
              method: 'POST',
              body: JSON.stringify({ mfaCode: attackerCode }),
            },
            mock(db),
          )
          expect(victimSubmitRes.status).toBe(401)
          expect(await victimSubmitRes.text()).toBe(messageConfig.RequestError.WrongMfaCode)

          // Attacker verifies their own email MFA code, then victim overwrites session via stale cache
          await mockedKV.put(
            sessionKey,
            initialSession,
          )
          const attackerSecondSignInRes = await signInEmbeddedSession(
            db,
            sessionId,
            'test@email.com',
          )
          expect(attackerSecondSignInRes.status).toBe(200)

          const attackerVerifyRes = await app.request(
            routeConfig.EmbeddedRoute.EmailMfa.replace(
              ':sessionId',
              sessionId,
            ),
            {
              method: 'POST',
              body: JSON.stringify({ mfaCode: attackerCode }),
            },
            mock(db),
          )
          expect(attackerVerifyRes.status).toBe(200)
          expect(await attackerVerifyRes.json()).toStrictEqual({
            sessionId,
            success: true,
          })
          expect(await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${sessionId}-1`)).toBe('1')

          await mockedKV.put(
            sessionKey,
            initialSession,
          )
          const victimSignInRes = await signInEmbeddedSession(
            db,
            sessionId,
            'victim@email.com',
          )
          expect(victimSignInRes.status).toBe(200)
          expect(await victimSignInRes.json()).toStrictEqual({
            sessionId,
            nextStep: routeConfig.View.EmailMfa,
            success: false,
          })

          const tokenRes = await exchangeEmbeddedSession(
            db,
            sessionId,
          )
          expect(tokenRes.status).toBe(401)
          expect(await tokenRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)
          expect(await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${sessionId}-2`)).toBeNull()
        } finally {
          process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
          process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['otp', 'email'] as unknown as string
          process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
          process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
        }
      },
    )

    test(
      'should not accept attacker SMS MFA code or verified marker for victim on stale session overwrite',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'
        global.fetch = getSmsResponseMock()

        try {
          await setupTwoUsers(db)
          await db.prepare('UPDATE "user" SET "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = 1 WHERE id = ?').run(
            '+16471231234',
            1,
          )
          await db.prepare('UPDATE "user" SET "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = 1 WHERE id = ?').run(
            '+16475556666',
            2,
          )

          const {
            sessionId, sessionKey, initialSession,
          } = await initiateEmbeddedSession(db)

          const attackerSignInRes = await signInEmbeddedSession(
            db,
            sessionId,
            'test@email.com',
          )
          expect(attackerSignInRes.status).toBe(200)
          expect(await attackerSignInRes.json()).toStrictEqual({
            sessionId,
            nextStep: routeConfig.View.SmsMfa,
            success: false,
          })

          const getSmsRes = await app.request(
            routeConfig.EmbeddedRoute.SmsMfa.replace(
              ':sessionId',
              sessionId,
            ),
            { method: 'GET' },
            mock(db),
          )
          expect(getSmsRes.status).toBe(200)

          const attackerCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${sessionId}-1`)
          expect(attackerCode?.length).toBe(6)

          // Victim cannot verify using attacker's pending SMS MFA code
          await mockedKV.put(
            sessionKey,
            initialSession,
          )
          const victimWrongSignInRes = await signInEmbeddedSession(
            db,
            sessionId,
            'victim@email.com',
          )
          expect(victimWrongSignInRes.status).toBe(200)

          const victimSubmitRes = await app.request(
            routeConfig.EmbeddedRoute.SmsMfa.replace(
              ':sessionId',
              sessionId,
            ),
            {
              method: 'POST',
              body: JSON.stringify({ mfaCode: attackerCode }),
            },
            mock(db),
          )
          expect(victimSubmitRes.status).toBe(401)
          expect(await victimSubmitRes.text()).toBe(messageConfig.RequestError.WrongMfaCode)

          // Attacker verifies their own SMS MFA code, then victim overwrites session via stale cache
          await mockedKV.put(
            sessionKey,
            initialSession,
          )
          const attackerSecondSignInRes = await signInEmbeddedSession(
            db,
            sessionId,
            'test@email.com',
          )
          expect(attackerSecondSignInRes.status).toBe(200)

          const attackerVerifyRes = await app.request(
            routeConfig.EmbeddedRoute.SmsMfa.replace(
              ':sessionId',
              sessionId,
            ),
            {
              method: 'POST',
              body: JSON.stringify({ mfaCode: attackerCode }),
            },
            mock(db),
          )
          expect(attackerVerifyRes.status).toBe(200)
          expect(await attackerVerifyRes.json()).toStrictEqual({
            sessionId,
            success: true,
          })
          expect(await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${sessionId}-1`)).toBe('1')

          await mockedKV.put(
            sessionKey,
            initialSession,
          )
          const victimSignInRes = await signInEmbeddedSession(
            db,
            sessionId,
            'victim@email.com',
          )
          expect(victimSignInRes.status).toBe(200)
          expect(await victimSignInRes.json()).toStrictEqual({
            sessionId,
            nextStep: routeConfig.View.SmsMfa,
            success: false,
          })

          const tokenRes = await exchangeEmbeddedSession(
            db,
            sessionId,
          )
          expect(tokenRes.status).toBe(401)
          expect(await tokenRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)
          expect(await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${sessionId}-2`)).toBeNull()
        } finally {
          process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
          process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['otp', 'email'] as unknown as string
          process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
          process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
          process.env.TWILIO_ACCOUNT_ID = ''
          process.env.TWILIO_AUTH_TOKEN = ''
          process.env.TWILIO_SENDER_NUMBER = ''
          global.fetch = fetchMock
        }
      },
    )

    test(
      'should not accept attacker remember-device MFA bypass marker for victim on stale session overwrite',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string

        try {
          await setupTwoUsers(db)
          const attackerSecret = cryptoUtil.genOtpSecret()
          const victimSecret = cryptoUtil.genOtpSecret()
          await db.prepare('UPDATE "user" SET "otpSecret" = ?, "otpVerified" = 1 WHERE id = ?').run(
            attackerSecret,
            1,
          )
          await db.prepare('UPDATE "user" SET "otpSecret" = ?, "otpVerified" = 1 WHERE id = ?').run(
            victimSecret,
            2,
          )

          await mockedKV.put(
            adapterConfig.getKVKey(
              adapterConfig.BaseKVKey.OtpMfaRememberDevice,
              '1',
              'device1',
            ),
            'secretcookie',
          )

          const {
            sessionId, sessionKey, initialSession,
          } = await initiateEmbeddedSession(db)

          const attackerSignInRes = await signInEmbeddedSession(
            db,
            sessionId,
            'test@email.com',
            { Cookie: 'OMRD-1=device1-secretcookie' },
          )
          expect(attackerSignInRes.status).toBe(200)
          expect(await attackerSignInRes.json()).toStrictEqual({
            sessionId,
            success: true,
          })
          expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${sessionId}-1`)).toBe('1')

          await mockedKV.put(
            sessionKey,
            initialSession,
          )

          const victimSignInRes = await signInEmbeddedSession(
            db,
            sessionId,
            'victim@email.com',
          )
          expect(victimSignInRes.status).toBe(200)
          expect(await victimSignInRes.json()).toStrictEqual({
            sessionId,
            nextStep: routeConfig.View.OtpMfa,
            success: false,
          })

          const tokenRes = await exchangeEmbeddedSession(
            db,
            sessionId,
          )
          expect(tokenRes.status).toBe(401)
          expect(await tokenRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)
          expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${sessionId}-2`)).toBeNull()
        } finally {
          process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
          process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['otp', 'email'] as unknown as string
          process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
          process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
          process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
        }
      },
    )
  },
)
