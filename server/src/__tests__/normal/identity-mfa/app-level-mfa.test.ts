import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { exchangeWithAuthToken } from '../oauth.test'
import {
  migrate,
  mockedKV,
  getSmsResponseMock,
  mock,
  fetchMock,
} from 'tests/mock'
import {
  messageConfig,
  routeConfig,
} from 'configs'
import {
  insertUsers,
  prepareFollowUpParams,
} from 'tests/identity'
import app from 'index'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

describe(
  'auth-code token exchange',
  () => {
    test(
      'should override system mfa enrollment config',
      async () => {
        db.prepare('update app set "useSystemMfaConfig" = ? where id = ?').run(
          0,
          1,
        )
        await insertUsers(db)
        const tokenRes = await exchangeWithAuthToken(db)
        expect(tokenRes.status).toBe(200)
      },
    )

    test(
      'should override system email mfa enrollment config',
      async () => {
        global.process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string

        db.prepare('update app set "useSystemMfaConfig" = ? where id = ?').run(
          0,
          1,
        )
        await insertUsers(db)
        const tokenRes = await exchangeWithAuthToken(db)
        expect(tokenRes.status).toBe(200)

        global.process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'should override system otp mfa enrollment config',
      async () => {
        global.process.env.OTP_MFA_IS_REQUIRED = true as unknown as string

        db.prepare('update app set "useSystemMfaConfig" = ? where id = ?').run(
          0,
          1,
        )
        await insertUsers(db)
        const tokenRes = await exchangeWithAuthToken(db)
        expect(tokenRes.status).toBe(200)

        global.process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'should override system sms mfa enrollment config',
      async () => {
        global.process.env.SMS_MFA_IS_REQUIRED = true as unknown as string

        db.prepare('update app set "useSystemMfaConfig" = ? where id = ?').run(
          0,
          1,
        )
        await insertUsers(db)
        const tokenRes = await exchangeWithAuthToken(db)
        expect(tokenRes.status).toBe(200)

        global.process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'could enable app level email mfa',
      async () => {
        db.prepare('update app set "useSystemMfaConfig" = ?, "requireEmailMfa" = ? where id = ?').run(
          0,
          1,
          1,
        )
        await insertUsers(db)
        const tokenRes = await exchangeWithAuthToken(db)
        expect(tokenRes.status).toBe(401)
        expect(await tokenRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)
      },
    )

    test(
      'could enable app level otp mfa',
      async () => {
        db.prepare('update app set "useSystemMfaConfig" = ?, "requireOtpMfa" = ? where id = ?').run(
          0,
          1,
          1,
        )
        await insertUsers(db)
        const tokenRes = await exchangeWithAuthToken(db)
        expect(tokenRes.status).toBe(401)
        expect(await tokenRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)
      },
    )

    test(
      'could enable app level sms mfa',
      async () => {
        db.prepare('update app set "useSystemMfaConfig" = ?, "requireSmsMfa" = ? where id = ?').run(
          0,
          1,
          1,
        )
        await insertUsers(db)
        const tokenRes = await exchangeWithAuthToken(db)
        expect(tokenRes.status).toBe(401)
        expect(await tokenRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)
      },
    )

    test(
      'could disable fall back to email mfa at app level',
      async () => {
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        db.prepare('update app set "useSystemMfaConfig" = ?, "allowEmailMfaAsBackup" = ?, "requireSmsMfa" = ? where id = ?').run(
          0,
          0,
          1,
          1,
        )

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )

        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )

        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ProcessSmsMfa}${params}`,
          {},
          mock(db),
        )

        expect(res.status).toBe(200)
        expect(await res.json()).toStrictEqual({
          allowFallbackToEmailMfa: false,
          countryCode: '+1',
          phoneNumber: '********1234',
        })

        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'could enable fall back to email mfa at app level',
      async () => {
        process.env.ALLOW_EMAIL_MFA_AS_BACKUP = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        db.prepare('update app set "useSystemMfaConfig" = ?, "allowEmailMfaAsBackup" = ?, "requireSmsMfa" = ? where id = ?').run(
          0,
          1,
          1,
          1,
        )

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )

        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )

        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ProcessSmsMfa}${params}`,
          {},
          mock(db),
        )

        expect(res.status).toBe(200)
        expect(await res.json()).toStrictEqual({
          allowFallbackToEmailMfa: true,
          countryCode: '+1',
          phoneNumber: '********1234',
        })

        process.env.ALLOW_EMAIL_MFA_AS_BACKUP = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )
  },
)
