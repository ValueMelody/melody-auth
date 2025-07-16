import {
  afterEach, beforeEach, describe, expect, Mock, test,
  vi,
} from 'vitest'
import { Database } from 'better-sqlite3'
import app from 'index'
import {
  fetchMock,
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  adapterConfig, localeConfig, messageConfig, routeConfig,
} from 'configs'
import {
  prepareFollowUpBody, insertUsers,
} from 'tests/identity'
import {
  enrollEmailMfa, enrollOtpMfa,
  enrollSmsMfa,
} from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

describe(
  'post /send-email-mfa',
  () => {
    test(
      'should send email mfa code',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: body.code,
              locale: 'en',
            }),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${body.code}`)
        expect(mfaCode?.length).toBe(6)

        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const emailBody = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(emailBody).toContain(mfaCode)
        expect(emailBody).toContain(localeConfig.emailMfaEmail.title.en)

        global.fetch = fetchMock
      },
    )

    test(
      'could default to supported locale',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: body.code,
              locale: '',
            }),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${body.code}`)
        expect(mfaCode?.length).toBe(6)

        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const emailBody = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(emailBody).toContain(mfaCode)
        expect(emailBody).toContain(localeConfig.emailMfaEmail.title.en)

        global.fetch = fetchMock
      },
    )

    test(
      'could protect against threshold',
      async () => {
        process.env.EMAIL_MFA_EMAIL_THRESHOLD = 2 as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const body = await prepareFollowUpBody(db)

        const sendRequest = async () => await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: body.code,
              locale: 'en',
            }),
          },
          mock(db),
        )

        const res = await sendRequest()
        expect(res.status).toBe(200)

        const res1 = await sendRequest()
        expect(res1.status).toBe(200)

        const res2 = await sendRequest()
        expect(res2.status).toBe(400)
        expect(await res2.text()).toBe(messageConfig.RequestError.EmailMfaLocked)

        process.env.EMAIL_MFA_EMAIL_THRESHOLD = 0 as unknown as string

        const res3 = await sendRequest()
        expect(res3.status).toBe(200)

        process.env.EMAIL_MFA_EMAIL_THRESHOLD = 10 as unknown as string
      },
    )

    test(
      'should throw error if auth code is wrong',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: 'abc',
              locale: 'en',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)
      },
    )
  },
)

describe(
  'post /process-email-mfa',
  () => {
    test(
      'could use original code',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)

        const requestBody = await prepareFollowUpBody(db)
        await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`)
        expect(mfaCode?.length).toBe(6)
        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(body).toContain(mfaCode)
        expect(body).toContain(localeConfig.emailMfaEmail.title.en)

        global.fetch = fetchMock

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: requestBody.code,
              locale: requestBody.locale,
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`),
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
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${json.code}`)).toBe('1')
      },
    )

    test(
      'should throw error if not enrolled with email mfa and fallback is not allowed',
      async () => {
        process.env.ALLOW_EMAIL_MFA_AS_BACKUP = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)

        const requestBody = await prepareFollowUpBody(db)
        const res = await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`)
        expect(mfaCode).toBeFalsy()

        const postRes = await app.request(
          routeConfig.IdentityRoute.ProcessEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: requestBody.code,
              locale: requestBody.locale,
              mfaCode: 'abc',
            }),
          },
          mock(db),
        )
        expect(postRes.status).toBe(401)

        process.env.ALLOW_EMAIL_MFA_AS_BACKUP = true as unknown as string
      },
    )

    test(
      'could use as otp mfa fallback',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)

        const requestBody = await prepareFollowUpBody(db)
        await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`)
        expect(mfaCode?.length).toBe(6)
        expect(mockFetch).toBeCalledTimes(1)

        global.fetch = fetchMock

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: requestBody.code,
              locale: requestBody.locale,
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`),
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
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${json.code}`)).toBe('1')
      },
    )

    test(
      'could use as sms mfa fallback',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )
        await enrollSmsMfa(db)

        const requestBody = await prepareFollowUpBody(db)
        await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`)
        expect(mfaCode?.length).toBe(6)
        expect(mockFetch).toBeCalledTimes(1)

        global.fetch = fetchMock

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: requestBody.code,
              locale: requestBody.locale,
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`),
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
      },
    )

    test(
      'could use as fallback for both sms and otp at same time',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )
        db.prepare('update "user" set "mfaTypes" = ? where id = 1').run('sms,otp')

        const requestBody = await prepareFollowUpBody(db)
        await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`)
        expect(mfaCode?.length).toBe(6)
        expect(mockFetch).toBeCalledTimes(1)

        global.fetch = fetchMock

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: requestBody.code,
              locale: requestBody.locale,
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`),
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
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${json.code}`)).toBe('1')
      },
    )

    test(
      'could use as fallback for both sms and otp setup at same time',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )

        db.prepare('update "user" set "mfaTypes" = ? where id = 1').run('sms,otp')

        const requestBody = await prepareFollowUpBody(db)
        await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`)
        expect(mfaCode?.length).toBe(6)
        expect(mockFetch).toBeCalledTimes(1)

        global.fetch = fetchMock

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: requestBody.code,
              locale: requestBody.locale,
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`),
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
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${json.code}`)).toBe('1')
      },
    )

    test(
      'should throw error if auth code is wrong',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const requestBody = await prepareFollowUpBody(db)

        await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`)
        expect(mfaCode?.length).toBe(6)
        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(body).toContain(localeConfig.emailMfaEmail.title.en)
        expect(body).toContain(mfaCode)

        global.fetch = fetchMock

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: 'abc',
              locale: requestBody.locale,
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`),
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)
      },
    )

    test(
      'pass through if failed send email',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: false })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)

        const requestBody = await prepareFollowUpBody(db)
        await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`)
        expect(mfaCode?.length).toBeFalsy()
        global.fetch = fetchMock
      },
    )

    test(
      'should throw error for wrong code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)

        const requestBody = await prepareFollowUpBody(db)
        await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: requestBody.code,
              locale: requestBody.locale,
              mfaCode: 'abcdefgh',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongMfaCode)
      },
    )

    test(
      'should set remember device cookie when rememberDevice is true',
      async () => {
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string
        
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)

        const requestBody = await prepareFollowUpBody(db)
        await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`)
        expect(mfaCode?.length).toBe(6)

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: requestBody.code,
              locale: requestBody.locale,
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`),
              rememberDevice: true,
            }),
          },
          mock(db),
        )
        
        expect(res.status).toBe(200)
        const json = await res.json() as { code: string }
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })


        const setCookieHeader = res.headers.get('Set-Cookie')
        expect(setCookieHeader).toContain('EMRD-1=')
        expect(setCookieHeader).toContain('HttpOnly')
        expect(setCookieHeader).toContain('Secure')
        expect(setCookieHeader).toContain('SameSite=Strict')

        const cookieMatch = setCookieHeader?.match(/EMRD-1=([^;]+)/)
        const cookieValue = cookieMatch?.[1]
        expect(cookieValue).toBeDefined()
        expect(cookieValue?.split('-')).toHaveLength(2)
        expect(cookieValue?.split('-')[0]).toHaveLength(24)
        expect(cookieValue?.split('-')[1]).toHaveLength(128)

        const [deviceId, storedCookieValue] = cookieValue!.split('-')
        const kvKey = `${adapterConfig.BaseKVKey.EmailMfaRememberDevice}-1-${deviceId}`
        const storedValue = await mockedKV.get(kvKey)
        expect(storedValue).toBe(storedCookieValue)

        global.fetch = fetchMock

        

        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
      },
    )

    test(
      'should not set remember device cookie when rememberDevice is false',
      async () => {
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string
        
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)

        const requestBody = await prepareFollowUpBody(db)
        await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`)
        expect(mfaCode?.length).toBe(6)

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: requestBody.code,
              locale: requestBody.locale,
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`),
              rememberDevice: false,
            }),
          },
          mock(db),
        )
        
        expect(res.status).toBe(200)
        const json = await res.json() as { code: string }
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        const setCookieHeader = res.headers.get('Set-Cookie')
        expect(setCookieHeader).toBeNull()

        global.fetch = fetchMock
        
        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
      },
    )

    test(
      'should not set remember device cookie when ENABLE_MFA_REMEMBER_DEVICE is false',
      async () => {
        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
        
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)

        const requestBody = await prepareFollowUpBody(db)
        await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`)
        expect(mfaCode?.length).toBe(6)

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: requestBody.code,
              locale: requestBody.locale,
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`),
              rememberDevice: true,
            }),
          },
          mock(db),
        )
        
        expect(res.status).toBe(200)
        const json = await res.json() as { code: string }
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        const setCookieHeader = res.headers.get('Set-Cookie')
        expect(setCookieHeader).toBeNull()

        global.fetch = fetchMock
      },
    )

    test(
      'should bypass email mfa on subsequent login when device is remembered',
      async () => {
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)

        const requestBody = await prepareFollowUpBody(db)
        await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`)
        expect(mfaCode?.length).toBe(6)

        const mfaRes = await app.request(
          routeConfig.IdentityRoute.ProcessEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: requestBody.code,
              locale: requestBody.locale,
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`),
              rememberDevice: true,
            }),
          },
          mock(db),
        )
        
        expect(mfaRes.status).toBe(200)
        const mfaJson = await mfaRes.json() as { code: string }

        const setCookieHeader = mfaRes.headers.get('Set-Cookie')
        expect(setCookieHeader).toContain('EMRD-1=')
        
        const cookieMatch = setCookieHeader?.match(/EMRD-1=([^;]+)/)
        const cookieValue = cookieMatch?.[1]
        expect(cookieValue).toBeDefined()

        const tokenRes = await app.request(
          routeConfig.OauthRoute.Token,
          {
            method: 'POST',
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: mfaJson.code,
              code_verifier: 'abc',
            }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        expect(tokenRes.status).toBe(200)

        global.fetch = fetchMock

        const appRecord = db.prepare('SELECT * FROM app WHERE id = 1').get() as any
        
        const secondLoginRes = await app.request(
          routeConfig.IdentityRoute.AuthorizePassword,
          {
            method: 'POST',
            body: JSON.stringify({
              clientId: appRecord.clientId,
              redirectUri: 'http://localhost:3000/en/dashboard',
              responseType: 'code',
              state: '123',
              codeChallenge: 'ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0',
              codeChallengeMethod: 's256',
              scope: 'profile openid offline_access',
              locale: 'en',
              email: 'test@email.com',
              password: 'Password1!',
            }),
            headers: {
              'Cookie': `EMRD-1=${cookieValue}`,
            },
          },
          mock(db),
        )

        expect(secondLoginRes.status).toBe(200)
        const secondLoginJson = await secondLoginRes.json() as { code: string }
        expect(secondLoginJson).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        const secondTokenRes = await app.request(
          routeConfig.OauthRoute.Token,
          {
            method: 'POST',
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: secondLoginJson.code,
              code_verifier: 'abc',
            }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        
        expect(secondTokenRes.status).toBe(200)
        const secondTokenJson = await secondTokenRes.json()
        expect(secondTokenJson).toStrictEqual({
          access_token: expect.any(String),
          expires_in: 1800,
          expires_on: expect.any(Number),
          not_before: expect.any(Number),
          token_type: 'Bearer',
          scope: 'profile openid offline_access',
          refresh_token: expect.any(String),
          refresh_token_expires_in: 604800,
          refresh_token_expires_on: expect.any(Number),
          id_token: expect.any(String),
        })

        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )
  },
)
