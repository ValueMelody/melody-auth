import {
  afterEach, beforeEach, describe, expect, Mock, test, vi,
} from 'vitest'
import { Database } from 'better-sqlite3'
import app from 'index'
import {
  fetchMock,
  getSmsResponseMock,
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  adapterConfig, localeConfig, messageConfig, routeConfig,
} from 'configs'
import { userModel } from 'models'
import {
  prepareFollowUpBody, prepareFollowUpParams, insertUsers,
  getCodeFromParams,
} from 'tests/identity'
import { enrollSmsMfa } from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

describe(
  'get /process-sms-mfa',
  () => {
    test(
      'should return sms mfa info',
      async () => {
        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)
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
          phoneNumber: null,
        })

        expect(mockFetch).toBeCalledTimes(0)
        const code = getCodeFromParams(params)
        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${code}`) ?? '').length).toBeFalsy()
      },
    )

    test(
      'should reutn sms mfa info if it is required',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
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
          phoneNumber: null,
        })

        expect(mockFetch).toBeCalledTimes(0)
        const code = getCodeFromParams(params)
        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${code}`) ?? '').length).toBeFalsy()

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        global.fetch = fetchMock
      },
    )

    test(
      'should get phone number if sms phone number verified',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

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

        const code = getCodeFromParams(params)
        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${code}`) ?? ''
        expect(mfaCode.length).toBe(6)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: any }).body
        expect(callArgs[0]).toBe('https://api.twilio.com/2010-04-01/Accounts/123/Messages.json')
        expect(body.get('To')).toBe('+16471231234')
        expect(body.get('From')).toBe('+1231231234')
        expect(body.get('Body')).toBe(`${localeConfig.smsMfaMsg.body.en}: ${mfaCode}`)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'could disable fall back to email mfa',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'
        process.env.ALLOW_EMAIL_MFA_AS_BACKUP = false as unknown as string

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

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
        process.env.ALLOW_EMAIL_MFA_AS_BACKUP = true as unknown as string
      },
    )

    test(
      'should pass through if request failed',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({
            ok: false, text: () => {},
          })
        }) as Mock
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

        const code = getCodeFromParams(params)
        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${code}`) ?? ''
        expect(mfaCode.length).toBe(0)
        expect(mockFetch).toBeCalledTimes(1)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'throw error if sms config not set',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string

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
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.NoSmsSender)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'should throw error if auth code is invalid',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)
        await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ProcessSmsMfa}?locale=en&code=abc`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if sms mfa is not required',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ProcessSmsMfa}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )
  },
)

describe(
  'post /setup-sms-mfa',
  () => {
    test(
      'could setup sms',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)

        const reqBody = await prepareFollowUpBody(db)
        const res = await app.request(
          `${routeConfig.IdentityRoute.SetupSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody,
              phoneNumber: '+6471111111',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(200)
        const user = await db.prepare('select * from "user" where id = 1').get() as userModel.Record
        expect(user.smsPhoneNumber).toBe('+6471111111')
        expect(user.smsPhoneNumberVerified).toBe(0)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${reqBody.code}`) ?? ''
        expect(mfaCode.length).toBe(6)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: any }).body
        expect(callArgs[0]).toBe('https://api.twilio.com/2010-04-01/Accounts/123/Messages.json')
        expect(body.get('To')).toBe('+6471111111')
        expect(body.get('From')).toBe('+1231231234')
        expect(body.get('Body')).toBe(`${localeConfig.smsMfaMsg.body.en}: ${mfaCode}`)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'could send sms to dev number',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'
        process.env.ENVIRONMENT = 'dev'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)

        const reqBody = await prepareFollowUpBody(db)
        const res = await app.request(
          `${routeConfig.IdentityRoute.SetupSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody,
              phoneNumber: '+6471111111',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(200)
        const user = await db.prepare('select * from "user" where id = 1').get() as userModel.Record
        expect(user.smsPhoneNumber).toBe('+6471111111')
        expect(user.smsPhoneNumberVerified).toBe(0)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${reqBody.code}`) ?? ''
        expect(mfaCode.length).toBe(6)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: any }).body
        expect(callArgs[0]).toBe('https://api.twilio.com/2010-04-01/Accounts/123/Messages.json')
        expect(body.get('To')).toBe('+14161231234')
        expect(body.get('From')).toBe('+1231231234')
        expect(body.get('Body')).toBe(`${localeConfig.smsMfaMsg.body.en}: ${mfaCode}`)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        process.env.ENVIRONMENT = 'prod'
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error if user already setup sms',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)

        const reqBody = await prepareFollowUpBody(db)
        const res = await app.request(
          `${routeConfig.IdentityRoute.SetupSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody,
              phoneNumber: '+6471111111',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(200)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${reqBody.code}`) ?? ''

        const res1 = await app.request(
          routeConfig.IdentityRoute.ProcessSmsMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: reqBody.code,
              locale: 'en',
              mfaCode,
            }),
          },
          mock(db),
        )
        expect(res1.status).toBe(200)

        const reqBody1 = await prepareFollowUpBody(db)
        const res2 = await app.request(
          `${routeConfig.IdentityRoute.SetupSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody1,
              phoneNumber: '+6471111111',
            }),
          },
          mock(db),
        )
        expect(res2.status).toBe(400)
        expect(await res2.text()).toBe(messageConfig.RequestError.MfaEnrolled)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error if code is wrong',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)

        const reqBody = await prepareFollowUpBody(db)
        const res = await app.request(
          `${routeConfig.IdentityRoute.SetupSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody,
              code: 'abc',
              phoneNumber: '+6471111111',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
      },
    )
  },
)

describe(
  'post /resend-sms-mfa',
  () => {
    test(
      'could resend mfa',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

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

        const reqBody = await prepareFollowUpBody(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(reqBody),
          },
          mock(db),
        )
        expect(res.status).toBe(200)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${reqBody.code}`) ?? ''
        expect(mfaCode.length).toBe(6)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: any }).body
        expect(callArgs[0]).toBe('https://api.twilio.com/2010-04-01/Accounts/123/Messages.json')
        expect(body.get('To')).toBe('+16471231234')
        expect(body.get('From')).toBe('+1231231234')
        expect(body.get('Body')).toBe(`${localeConfig.smsMfaMsg.body.en}: ${mfaCode}`)

        const logs = await db.prepare('select * from sms_log').all()
        expect(logs.length).toBe(0)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'could default to supported locale',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

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

        const reqBody = await prepareFollowUpBody(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody,
              locale: '',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(200)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${reqBody.code}`) ?? ''
        expect(mfaCode.length).toBe(6)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: any }).body
        expect(callArgs[0]).toBe('https://api.twilio.com/2010-04-01/Accounts/123/Messages.json')
        expect(body.get('To')).toBe('+16471231234')
        expect(body.get('From')).toBe('+1231231234')
        expect(body.get('Body')).toBe(`${localeConfig.smsMfaMsg.body.en}: ${mfaCode}`)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error if sms mfa is not required',
      async () => {
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        await insertUsers(
          db,
          false,
        )

        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )

        const reqBody = await prepareFollowUpBody(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(reqBody),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.NotSupposeToSendSmsMfa)

        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error if sms mfa is not setup',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )

        const reqBody = await prepareFollowUpBody(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(reqBody),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.SmsMfaNotSetup)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'could log sms',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'
        process.env.ENABLE_SMS_LOG = true as unknown as string

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

        const reqBody = await prepareFollowUpBody(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(reqBody),
          },
          mock(db),
        )
        expect(res.status).toBe(200)
        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: any }).body

        const logs = await db.prepare('select * from sms_log').all()
        expect(logs.length).toBe(1)
        expect(logs[0]).toStrictEqual({
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          receiver: '+16471231234',
          response: 'test response',
          success: 1,
          id: 1,
          content: body.get('Body'),
        })

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        process.env.ENABLE_SMS_LOG = false as unknown as string
        global.fetch = fetchMock
      },
    )

    test(
      'could log sms if fetch failed',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'
        process.env.ENABLE_SMS_LOG = true as unknown as string

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({
            ok: false, text: () => null, status: 400,
          })
        }) as Mock
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )

        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )

        const reqBody = await prepareFollowUpBody(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(reqBody),
          },
          mock(db),
        )
        expect(res.status).toBe(200)
        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: any }).body

        const logs = await db.prepare('select * from sms_log').all()
        expect(logs.length).toBe(1)
        expect(logs[0]).toStrictEqual({
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
          receiver: '+16471231234',
          response: '',
          success: 0,
          id: 1,
          content: body.get('Body'),
        })

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        process.env.ENABLE_SMS_LOG = false as unknown as string
        global.fetch = fetchMock
      },
    )

    test(
      'could trigger threshold protection',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'
        process.env.SMS_MFA_MESSAGE_THRESHOLD = 2 as unknown as string

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

        const reqBody = await prepareFollowUpBody(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(reqBody),
          },
          mock(db),
        )
        expect(res.status).toBe(200)

        const res2 = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(reqBody),
          },
          mock(db),
        )
        expect(res2.status).toBe(200)

        const res3 = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(reqBody),
          },
          mock(db),
        )
        expect(res3.status).toBe(400)
        expect(await res3.text()).toBe(messageConfig.RequestError.SmsMfaLocked)

        process.env.SMS_MFA_MESSAGE_THRESHOLD = 0 as unknown as string

        const res4 = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(reqBody),
          },
          mock(db),
        )
        expect(res4.status).toBe(200)

        process.env.SMS_MFA_MESSAGE_THRESHOLD = 5 as unknown as string
        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error if user has not setup sms',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)
        await db.prepare('update "user" set "smsPhoneNumber" = ?').run('+16471231234')

        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if code is wrong',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)

        const reqBody = await prepareFollowUpBody(db)
        const res = await app.request(
          `${routeConfig.IdentityRoute.ResendSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody,
              code: 'abc',
              phoneNumber: '+6471111111',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
      },
    )
  },
)

describe(
  'post /process-sms-mfa',
  () => {
    test(
      'could pass sms mfa',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)
        const reqBody = await prepareFollowUpBody(db)

        await app.request(
          `${routeConfig.IdentityRoute.SetupSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody,
              phoneNumber: '+6471112222',
            }),
          },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${reqBody.code}`)
        expect(mfaCode?.length).toBe(6)
        expect(mockFetch).toBeCalledTimes(1)

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessSmsMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: reqBody.code,
              locale: 'en',
              mfaCode,
            }),
          },
          mock(db),
        )
        const json = await res.json() as { code: string }
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${json.code}`)).toBe('1')

        const user = await db.prepare('select * from "user" where id = 1').get() as userModel.Record
        expect(user.smsPhoneNumber).toBe('+6471112222')
        expect(user.smsPhoneNumberVerified).toBe(1)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error if auth code is wrong',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)
        const reqBody = await prepareFollowUpBody(db)

        await app.request(
          `${routeConfig.IdentityRoute.SetupSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody,
              phoneNumber: '+6471112222',
            }),
          },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${reqBody.code}`)
        const res = await app.request(
          routeConfig.IdentityRoute.ProcessSmsMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: 'abc',
              locale: 'en',
              mfaCode,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error for wrong code',
      async () => {
        process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)
        const reqBody = await prepareFollowUpBody(db)

        await app.request(
          `${routeConfig.IdentityRoute.SetupSmsMfa}`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...reqBody,
              phoneNumber: '+6471112222',
            }),
          },
          mock(db),
        )

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessSmsMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: reqBody.code,
              locale: 'en',
              mfaCode: 'abc',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongMfaCode)

        process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )
  },
)
