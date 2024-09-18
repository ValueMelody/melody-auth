import {
  afterEach, beforeEach, describe, expect, Mock, test,
  vi,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { JSDOM } from 'jsdom'
import { authenticator } from 'otplib'
import app from 'index'
import {
  fetchMock,
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  adapterConfig, localeConfig, routeConfig,
} from 'configs'
import { userModel } from 'models'
import {
  prepareFollowUpBody, prepareFollowUpParams, insertUsers,
} from 'tests/identity'
import {
  enrollEmailMfa, enrollOtpMfa,
} from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const BaseRoute = routeConfig.InternalRoute.Identity

describe(
  'get /authorize-mfa-enroll',
  () => {
    test(
      'should show mfa enroll page',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${BaseRoute}/authorize-mfa-enroll${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(1)
        expect(document.getElementsByTagName('button').length).toBe(2)
        expect(document.getElementsByTagName('button')[0].innerHTML).toBe(localeConfig.authorizeMfaEnroll.email.en)
        expect(document.getElementsByTagName('button')[1].innerHTML).toBe(localeConfig.authorizeMfaEnroll.otp.en)
      },
    )

    test(
      'could disable locale selector',
      async () => {
        global.process.env.ENABLE_LOCALE_SELECTOR = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${BaseRoute}/authorize-mfa-enroll${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(0)
        global.process.env.ENABLE_LOCALE_SELECTOR = true as unknown as string
      },
    )

    test(
      'throw error if user already enrolled',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await db.prepare('update "user" set "mfaTypes" = ?').run('email')
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${BaseRoute}/authorize-mfa-enroll${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.MfaEnrolled)
      },
    )

    test(
      'should be blocked if not enabled in config',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${BaseRoute}/authorize-mfa-enroll${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = true as unknown as string
      },
    )

    test(
      'could throw error if no enough params',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpParams(db)

        const res = await app.request(
          `${BaseRoute}/authorize-mfa-enroll`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )
  },
)

describe(
  'post /authorize-mfa-enroll',
  () => {
    test(
      'should enroll email mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          `${BaseRoute}/authorize-mfa-enroll`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              type: userModel.MfaType.Email,
            }),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          requireConsent: false,
          requireMfaEnroll: false,
          requireEmailMfa: true,
          requireOtpSetup: false,
          requireOtpMfa: false,
        })

        const user = await db.prepare('SELECT * from "user" WHERE id = 1').get() as userModel.Raw
        expect(user.mfaTypes).toBe(userModel.MfaType.Email)
      },
    )

    test(
      'should throw error if user already enrolled',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await db.prepare('update "user" set "mfaTypes" = ?').run('email')
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          `${BaseRoute}/authorize-mfa-enroll`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              type: userModel.MfaType.Email,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.MfaEnrolled)
      },
    )

    test(
      'should enroll otp mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          `${BaseRoute}/authorize-mfa-enroll`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              type: userModel.MfaType.Otp,
            }),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          requireConsent: false,
          requireMfaEnroll: false,
          requireEmailMfa: false,
          requireOtpSetup: true,
          requireOtpMfa: true,
        })

        const user = await db.prepare('SELECT * from "user" WHERE id = 1').get() as userModel.Raw
        expect(user.mfaTypes).toBe(userModel.MfaType.Otp)
      },
    )
  },
)

const testGetOtpMfa = async (route: string) => {
  const params = await prepareFollowUpParams(db)

  const res = await app.request(
    `${BaseRoute}${route}${params}`,
    {},
    mock(db),
  )
  return res
}

describe(
  'get /authorize-otp-setup',
  () => {
    test(
      'should show otp mfa setup page',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const res = await testGetOtpMfa('/authorize-otp-setup')
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByName('otp').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)
        expect(document.getElementsByTagName('select').length).toBe(1)
      },
    )

    test(
      'should throw error if user already set otp',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await db.prepare('update "user" set "otpVerified" = ?').run(1)
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${BaseRoute}/authorize-otp-setup${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.OtpAlreadySet)
      },
    )

    test(
      'could disable locale selector',
      async () => {
        global.process.env.ENABLE_LOCALE_SELECTOR = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        const res = await testGetOtpMfa('/authorize-otp-setup')
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(0)
        global.process.env.ENABLE_LOCALE_SELECTOR = true as unknown as string
      },
    )
  },
)

describe(
  'get /authorize-otp-mfa',
  () => {
    test(
      'should show otp mfa page',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const res = await testGetOtpMfa('/authorize-otp-mfa')
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByName('otp').length).toBe(1)
        expect(document.getElementsByTagName('select').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)
        const buttons = document.getElementsByTagName('button')
        expect(buttons.length).toBe(2)
        expect(buttons[0].innerHTML).toBe(localeConfig.authorizeOtpMfa.switchToEmail.en)
        expect(buttons[1].innerHTML).toBe(localeConfig.authorizeOtpMfa.verify.en)
      },
    )

    test(
      'could disable locale selector',
      async () => {
        global.process.env.ENABLE_LOCALE_SELECTOR = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const res = await testGetOtpMfa('/authorize-otp-mfa')
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(0)
        global.process.env.ENABLE_LOCALE_SELECTOR = true as unknown as string
      },
    )

    test(
      'could disable fallback to email mfa',
      async () => {
        global.process.env.ALLOW_EMAIL_MFA_AS_BACKUP = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const res = await testGetOtpMfa('/authorize-otp-mfa')
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        const buttons = document.getElementsByTagName('button')
        expect(buttons.length).toBe(1)
        expect(buttons[0].innerHTML).toBe(localeConfig.authorizeOtpMfa.verify.en)
        global.process.env.ALLOW_EMAIL_MFA_AS_BACKUP = true as unknown as string
      },
    )
  },
)

describe(
  'post /authorize-otp-mfa',
  () => {
    test(
      'should pass otp mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const body = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const res = await app.request(
          `${BaseRoute}/authorize-otp-mfa`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: token,
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
          requireConsent: false,
          requireMfaEnroll: false,
          requireEmailMfa: false,
          requireOtpSetup: false,
          requireOtpMfa: false,
        })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${json.code}`)).toBe('1')
      },
    )

    test(
      'should throw error if otp secret not exists',
      async () => {
        await mockedKV.put(
          `${adapterConfig.BaseKVKey.AuthCode}-abc`,
          JSON.stringify({ user: { otpSecret: null } }),
        )
        const body = {
          state: '123',
          redirectUri: 'http://localhost:3000/en/dashboard',
          code: 'abc',
          locale: 'en',
        }
        const res = await app.request(
          `${BaseRoute}/authorize-otp-mfa`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: '123456',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'should be blocked after 5 attempts',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const body = await prepareFollowUpBody(db)

        const sendRequest = async () => {
          return app.request(
            `${BaseRoute}/authorize-otp-mfa`,
            {
              method: 'POST',
              body: JSON.stringify({
                ...body,
                mfaCode: 'abcdefgh',
              }),
            },
            mock(db),
          )
        }
        const res = await sendRequest()
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(localeConfig.Error.WrongMfaCode)

        const res1 = await sendRequest()
        expect(res1.status).toBe(401)
        expect(await res1.text()).toBe(localeConfig.Error.WrongMfaCode)

        const res2 = await sendRequest()
        expect(res2.status).toBe(401)
        expect(await res2.text()).toBe(localeConfig.Error.WrongMfaCode)

        const res3 = await sendRequest()
        expect(res3.status).toBe(401)
        expect(await res3.text()).toBe(localeConfig.Error.WrongMfaCode)

        const res4 = await sendRequest()
        expect(res4.status).toBe(401)
        expect(await res4.text()).toBe(localeConfig.Error.WrongMfaCode)

        const res5 = await sendRequest()
        expect(res5.status).toBe(400)
        expect(await res5.text()).toBe(localeConfig.Error.OtpMfaLocked)
      },
    )

    test(
      'could fallback to email mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)

        const params = await prepareFollowUpParams(db)
        await app.request(
          `${BaseRoute}/authorize-email-mfa${params}`,
          {},
          mock(db),
        )
        const code = getCodeFromParams(params)

        const res = await app.request(
          `${BaseRoute}/authorize-email-mfa`,
          {
            method: 'POST',
            body: JSON.stringify({
              state: '123',
              redirectUri: 'http://localhost:3000/en/dashboard',
              code,
              locale: 'en',
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`),
            }),
          },
          mock(db),
        )

        const json = await res.json() as { code: string }
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${json.code}`)).toBe('1')
      },
    )
  },
)

const getCodeFromParams = (params: string) => {
  const codeParam = params.substring(1).split('&')
    .find((s) => s.includes('code='))
  const code = codeParam?.split('=')[1]
  return code
}

describe(
  'get /authorize-email-mfa',
  () => {
    test(
      'should show email mfa page',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${BaseRoute}/authorize-email-mfa${params}`,
          {},
          mock(db),
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(1)
        expect(document.getElementsByName('code').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)

        const code = getCodeFromParams(params)
        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`) ?? '').length).toBe(8)
      },
    )

    test(
      'should throw error if email mfa is not required',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${BaseRoute}/authorize-email-mfa${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'could disable locale selector',
      async () => {
        global.process.env.ENABLE_LOCALE_SELECTOR = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${BaseRoute}/authorize-email-mfa${params}`,
          {},
          mock(db),
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(0)
        global.process.env.ENABLE_LOCALE_SELECTOR = true as unknown as string
      },
    )
  },
)

describe(
  'post /resend-email-mfa',
  () => {
    test(
      'should resent email mfa code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollEmailMfa(db)
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          `${BaseRoute}/resend-email-mfa`,
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

        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${body.code}`) ?? '').length).toBe(8)
      },
    )
  },
)

describe(
  'post /authorize-email-mfa',
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
        const params = await prepareFollowUpParams(db)

        await app.request(
          `${BaseRoute}/authorize-email-mfa${params}`,
          {},
          mock(db),
        )
        const code = getCodeFromParams(params)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`)
        expect(mfaCode?.length).toBe(8)
        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(body).toContain(mfaCode)

        global.fetch = fetchMock

        const res = await app.request(
          `${BaseRoute}/authorize-email-mfa`,
          {
            method: 'POST',
            body: JSON.stringify({
              state: '123',
              redirectUri: 'http://localhost:3000/en/dashboard',
              code,
              locale: 'en',
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`),
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
          requireConsent: false,
          requireMfaEnroll: false,
          requireEmailMfa: false,
          requireOtpSetup: false,
          requireOtpMfa: false,
        })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${json.code}`)).toBe('1')
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
        const params = await prepareFollowUpParams(db)

        await app.request(
          `${BaseRoute}/authorize-email-mfa${params}`,
          {},
          mock(db),
        )
        const code = getCodeFromParams(params)

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`)
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
        const params = await prepareFollowUpParams(db)

        await app.request(
          `${BaseRoute}/authorize-email-mfa${params}`,
          {},
          mock(db),
        )
        const code = getCodeFromParams(params)

        const res = await app.request(
          `${BaseRoute}/authorize-email-mfa`,
          {
            method: 'POST',
            body: JSON.stringify({
              state: '123',
              redirectUri: 'http://localhost:3000/en/dashboard',
              code,
              locale: 'en',
              mfaCode: 'abcdefgh',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(localeConfig.Error.WrongMfaCode)
      },
    )

    test(
      'should could use resend code',
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

        await app.request(
          `${BaseRoute}/resend-email-mfa`,
          {
            method: 'POST',
            body: JSON.stringify({
              code: body.code,
              locale: 'en',
            }),
          },
          mock(db),
        )

        const code = body.code
        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${body.code}`)
        expect(mfaCode?.length).toBe(8)

        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const emailBody = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(emailBody).toContain(mfaCode)
        global.fetch = fetchMock

        const res = await app.request(
          `${BaseRoute}/authorize-email-mfa`,
          {
            method: 'POST',
            body: JSON.stringify({
              state: '123',
              redirectUri: 'http://localhost:3000/en/dashboard',
              code,
              locale: 'en',
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${code}`),
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
          requireConsent: false,
          requireMfaEnroll: false,
          requireEmailMfa: false,
          requireOtpSetup: false,
          requireOtpMfa: false,
        })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${json.code}`)).toBe('1')
      },
    )
  },
)
