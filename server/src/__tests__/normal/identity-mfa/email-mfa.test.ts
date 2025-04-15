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

    // test(
    //   'could use as fallback for both sms and otp at same time',
    //   async () => {
    //     const mockFetch = vi.fn(async () => {
    //       return Promise.resolve({ ok: true })
    //     })
    //     global.fetch = mockFetch as Mock

    //     await insertUsers(
    //       db,
    //       false,
    //     )
    //     await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
    //       '+16471231234',
    //       1,
    //     )
    //     db.prepare('update "user" set "mfaTypes" = ? where id = 1').run('sms,otp')

    //     const requestBody = await prepareFollowUpBody(db)
    //     await app.request(
    //       routeConfig.IdentityRoute.SendEmailMfa,
    //       {
    //         method: 'POST',
    //         body: JSON.stringify({ ...requestBody }),
    //       },
    //       mock(db),
    //     )

    //     const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`)
    //     expect(mfaCode?.length).toBe(6)
    //     expect(mockFetch).toBeCalledTimes(1)

    //     global.fetch = fetchMock

    //     const res = await app.request(
    //       routeConfig.IdentityRoute.ProcessEmailMfa,
    //       {
    //         method: 'POST',
    //         body: JSON.stringify({
    //           code: requestBody.code,
    //           locale: requestBody.locale,
    //           mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${requestBody.code}`),
    //         }),
    //       },
    //       mock(db),
    //     )
    //     const json = await res.json() as { code: string }
    //     expect(json).toStrictEqual({
    //       code: expect.any(String),
    //       redirectUri: 'http://localhost:3000/en/dashboard',
    //       state: '123',
    //       scopes: ['profile', 'openid', 'offline_access'],
    //     })
    //     expect(await mockedKV.get(`${adapterConfig.BaseKVKey.SmsMfaCode}-${json.code}`)).toBe('1')
    //     expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${json.code}`)).toBe('1')
    //   },
    // )

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
  },
)
