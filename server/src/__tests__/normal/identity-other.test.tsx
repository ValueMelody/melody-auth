import {
  afterEach, beforeEach, describe, expect, Mock, test,
  vi,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { JSDOM } from 'jsdom'
import app from 'index'
import {
  emailLogRecord,
  emailResponseMock,
  fetchMock,
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  adapterConfig, routeConfig, localeConfig,
} from 'configs'
import {
  insertUsers, getAuthorizeParams, postSignInRequest, getApp, postAuthorizeBody,
} from 'tests/identity'
import { userModel } from 'models'
import { disableUser } from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const prepareUserAccount = async () => {
  const appRecord = await getApp(db)
  const body = {
    ...(await postAuthorizeBody(appRecord)),
    email: 'test@email.com',
    password: 'Password1!',
  }

  const res = await app.request(
    routeConfig.IdentityRoute.AuthorizeAccount,
    {
      method: 'POST', body: JSON.stringify(body),
    },
    mock(db),
  )
  expect(res.status).toBe(200)
}

describe(
  'get /verify-email',
  () => {
    test(
      'should show verify email page',
      async () => {
        await prepareUserAccount()
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        expect(currentUser.emailVerified).toBe(0)
        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`) ?? '').length).toBe(8)

        const res = await app.request(
          `${routeConfig.IdentityRoute.VerifyEmail}?id=${currentUser.authId}&locale=en`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByName('code').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)
        expect(document.getElementsByTagName('select').length).toBe(1)
      },
    )

    test(
      'could disable locale selector',
      async () => {
        global.process.env.ENABLE_LOCALE_SELECTOR = false as unknown as string
        await prepareUserAccount()

        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw

        const res = await app.request(
          `${routeConfig.IdentityRoute.VerifyEmail}?id=${currentUser.authId}&locale=en`,
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
      'should be blocked if not enable in config',
      async () => {
        global.process.env.ENABLE_EMAIL_VERIFICATION = false as unknown as string
        await prepareUserAccount()

        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        expect(currentUser.emailVerified).toBe(0)
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`)).toBeFalsy()

        const res = await app.request(
          `${routeConfig.IdentityRoute.VerifyEmail}?id=${currentUser.authId}&locale=en`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        global.process.env.ENABLE_EMAIL_VERIFICATION = true as unknown as string
      },
    )

    test(
      'should fail when no enough params provided',
      async () => {
        await prepareUserAccount()

        const res = await app.request(
          routeConfig.IdentityRoute.VerifyEmail,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )
  },
)

describe(
  'post /verify-email',
  () => {
    test(
      'should verify email',
      async () => {
        await prepareUserAccount()

        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`)

        const res = await app.request(
          routeConfig.IdentityRoute.VerifyEmail,
          {
            method: 'POST',
            body: JSON.stringify({
              id: currentUser.authId,
              code,
            }),
          },
          mock(db),
        )
        expect(await res.json()).toStrictEqual({ success: true })

        const updatedUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        expect(updatedUser.emailVerified).toBe(1)
      },
    )

    test(
      'should not verify if wrong code provided',
      async () => {
        await prepareUserAccount()

        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw

        const res = await app.request(
          routeConfig.IdentityRoute.VerifyEmail,
          {
            method: 'POST',
            body: JSON.stringify({
              id: currentUser.authId,
              code: 'abcdefgh',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongCode)
      },
    )

    test(
      'should not verify if user already verified',
      async () => {
        await prepareUserAccount()

        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`)

        const res = await app.request(
          routeConfig.IdentityRoute.VerifyEmail,
          {
            method: 'POST',
            body: JSON.stringify({
              id: currentUser.authId,
              code,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(200)
        const res1 = await app.request(
          routeConfig.IdentityRoute.VerifyEmail,
          {
            method: 'POST',
            body: JSON.stringify({
              id: currentUser.authId,
              code,
            }),
          },
          mock(db),
        )
        expect(res1.status).toBe(400)
        expect(await res1.text()).toBe(localeConfig.Error.WrongCode)
      },
    )

    test(
      'should not verify if user disabled',
      async () => {
        await prepareUserAccount()

        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`)

        await disableUser(db)

        const res = await app.request(
          routeConfig.IdentityRoute.VerifyEmail,
          {
            method: 'POST',
            body: JSON.stringify({
              id: currentUser.authId,
              code,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.UserDisabled)
      },
    )
  },
)

describe(
  'get /authorize-reset',
  () => {
    test(
      'should show reset page',
      async () => {
        const appRecord = await getApp(db)
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeReset}${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByName('email').length).toBe(1)
        expect(document.getElementsByName('password').length).toBe(1)
        expect(document.getElementsByName('confirmPassword').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)
        expect(document.getElementsByTagName('select').length).toBe(1)
      },
    )

    test(
      'could disable locale selector',
      async () => {
        global.process.env.ENABLE_LOCALE_SELECTOR = false as unknown as string
        const appRecord = await getApp(db)
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeReset}${params}`,
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
      'should be blocked if not enable in config',
      async () => {
        global.process.env.ENABLE_PASSWORD_RESET = false as unknown as string
        const appRecord = await getApp(db)
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeReset}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        global.process.env.ENABLE_PASSWORD_RESET = true as unknown as string
      },
    )
  },
)

const testSendResetCode = async (route: string) => {
  const body = {
    email: 'test@email.com',
    password: 'Password1!',
  }

  const res = await app.request(
    route,
    {
      method: 'POST', body: JSON.stringify(body),
    },
    mock(db),
  )
  return res
}

describe(
  'post /reset-code',
  () => {
    test(
      'should send reset code',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(db)
        const res = await testSendResetCode(routeConfig.IdentityRoute.ResetCode)
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`) ?? ''
        expect(code.length).toBe(8)

        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(body).toContain(code)

        global.fetch = fetchMock
      },
    )

    test(
      'should return true if user is inactive',
      async () => {
        await insertUsers(db)
        disableUser(db)
        const res = await testSendResetCode(routeConfig.IdentityRoute.ResetCode)
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`)).toBeFalsy()
      },
    )

    test(
      'should throw error if no email provided',
      async () => {
        await insertUsers(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ResetCode,
          {
            method: 'POST',
            body: JSON.stringify({ password: 'Password1!' }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )
  },
)

describe(
  'post /resend-reset-code',
  () => {
    test(
      'should send reset code by Sendgrid',
      async () => {
        process.env.MAILGUN_API_KEY = 'abc'
        process.env.MAILGUN_SENDER_ADDRESS = 'app@valuemelody.com'
        process.env.BREVO_API_KEY = 'abc'
        process.env.BREVO_SENDER_ADDRESS = 'app@valuemelody.com'

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(db)
        const res = await testSendResetCode(routeConfig.IdentityRoute.ResendResetCode)
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`) ?? ''
        expect(code.length).toBe(8)

        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(body).toContain(code)
        expect(body).toContain('"personalizations":[{"to":[{"email":"test@email.com"}]}]')
        global.fetch = fetchMock

        process.env.MAILGUN_API_KEY = ''
        process.env.MAILGUN_SENDER_ADDRESS = ''
        process.env.BREVO_API_KEY = ''
        process.env.BREVO_SENDER_ADDRESS = ''
      },
    )

    test(
      'should send email to dev in dev env',
      async () => {
        process.env.ENVIRONMENT = 'dev'

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(db)
        const res = await testSendResetCode(routeConfig.IdentityRoute.ResendResetCode)
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`) ?? ''
        expect(code.length).toBe(8)

        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(body).toContain(code)
        expect(body).toContain('"personalizations":[{"to":[{"email":"dev@email.com"}]}]')
        global.fetch = fetchMock

        process.env.ENVIRONMENT = 'prod'
      },
    )

    test(
      'pass through if failed send email',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: false })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(db)
        const res = await testSendResetCode(routeConfig.IdentityRoute.ResendResetCode)
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`) ?? ''
        expect(code.length).toBeFalsy()
        global.fetch = fetchMock
      },
    )

    test(
      'could send reset code by Mailgun',
      async () => {
        process.env.SENDGRID_API_KEY = ''
        process.env.SENDGRID_SENDER_ADDRESS = ''
        process.env.MAILGUN_API_KEY = 'abc'
        process.env.MAILGUN_SENDER_ADDRESS = 'app@valuemelody.com'
        process.env.BREVO_API_KEY = 'abc'
        process.env.BREVO_SENDER_ADDRESS = 'app@valuemelody.com'

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(db)
        const res = await testSendResetCode(routeConfig.IdentityRoute.ResendResetCode)
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`) ?? ''
        expect(code.length).toBe(8)

        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: FormData }).body
        expect(callArgs[0]).toBe('https://api.mailgun.net/v3/valuemelody.com/messages')
        expect(body.get('html')).toContain(code)
        expect(body.get('to')).toContain('test@email.com')

        const logs = await db.prepare('select * from email_log').all()
        expect(logs.length).toBe(0)

        global.fetch = fetchMock

        process.env.MAILGUN_API_KEY = ''
        process.env.MAILGUN_SENDER_ADDRESS = ''
        process.env.BREVO_API_KEY = ''
        process.env.BREVO_SENDER_ADDRESS = ''
        process.env.SENDGRID_API_KEY = 'abc'
        process.env.SENDGRID_SENDER_ADDRESS = 'app@valuemelody.com'
      },
    )

    test(
      'could log email by Mailgun',
      async () => {
        process.env.SENDGRID_API_KEY = ''
        process.env.SENDGRID_SENDER_ADDRESS = ''
        process.env.MAILGUN_API_KEY = 'abc'
        process.env.MAILGUN_SENDER_ADDRESS = 'app@valuemelody.com'
        process.env.BREVO_API_KEY = 'abc'
        process.env.BREVO_SENDER_ADDRESS = 'app@valuemelody.com'
        process.env.ENABLE_EMAIL_LOG = true as unknown as string

        const mockFetch = emailResponseMock
        global.fetch = mockFetch as Mock

        await insertUsers(db)
        const res = await testSendResetCode(routeConfig.IdentityRoute.ResendResetCode)
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const logs = await db.prepare('select * from email_log').all()
        expect(logs.length).toBe(1)
        expect(logs[0]).toStrictEqual(emailLogRecord)
        global.fetch = fetchMock

        process.env.MAILGUN_API_KEY = ''
        process.env.MAILGUN_SENDER_ADDRESS = ''
        process.env.SENDGRID_API_KEY = 'abc'
        process.env.SENDGRID_SENDER_ADDRESS = 'app@valuemelody.com'
        process.env.BREVO_API_KEY = ''
        process.env.BREVO_SENDER_ADDRESS = ''
        process.env.ENABLE_EMAIL_LOG = false as unknown as string
      },
    )

    test(
      'could send reset code by Brevo',
      async () => {
        process.env.SENDGRID_API_KEY = ''
        process.env.SENDGRID_SENDER_ADDRESS = ''
        process.env.BREVO_API_KEY = 'abc'
        process.env.BREVO_SENDER_ADDRESS = 'app@valuemelody.com'

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(db)
        const res = await testSendResetCode(routeConfig.IdentityRoute.ResendResetCode)
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`) ?? ''
        expect(code.length).toBe(8)

        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.brevo.com/v3/smtp/email')
        expect(body).toContain(code)
        expect(body).toContain('"to":[{"email":"test@email.com"}]')

        const logs = await db.prepare('select * from email_log').all()
        expect(logs.length).toBe(0)

        global.fetch = fetchMock

        process.env.BREVO_API_KEY = ''
        process.env.BREVO_SENDER_ADDRESS = ''
        process.env.SENDGRID_API_KEY = 'abc'
        process.env.SENDGRID_SENDER_ADDRESS = 'app@valuemelody.com'
      },
    )

    test(
      'could log email by Brevo',
      async () => {
        process.env.SENDGRID_API_KEY = ''
        process.env.SENDGRID_SENDER_ADDRESS = ''
        process.env.BREVO_API_KEY = 'abc'
        process.env.BREVO_SENDER_ADDRESS = 'app@valuemelody.com'
        process.env.ENABLE_EMAIL_LOG = true as unknown as string

        const mockFetch = emailResponseMock
        global.fetch = mockFetch as Mock

        await insertUsers(db)
        const res = await testSendResetCode(routeConfig.IdentityRoute.ResendResetCode)
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const logs = await db.prepare('select * from email_log').all()
        expect(logs.length).toBe(1)
        expect(logs[0]).toStrictEqual(emailLogRecord)
        global.fetch = fetchMock

        process.env.BREVO_API_KEY = ''
        process.env.BREVO_SENDER_ADDRESS = ''
        process.env.SENDGRID_API_KEY = 'abc'
        process.env.SENDGRID_SENDER_ADDRESS = 'app@valuemelody.com'
        process.env.ENABLE_EMAIL_LOG = false as unknown as string
      },
    )

    test(
      'could send reset code by smtp',
      async () => {
        process.env.MAILGUN_API_KEY = 'abc'
        process.env.MAILGUN_SENDER_ADDRESS = 'app@valuemelody.com'
        process.env.BREVO_API_KEY = 'abc'
        process.env.BREVO_SENDER_ADDRESS = 'app@valuemelody.com'

        const sendEmailMock = vi.fn(async () => {
          return Promise.resolve({ accepted: ['test@email.com'] })
        })

        await insertUsers(db)
        const res = await app.request(
          routeConfig.IdentityRoute.ResendResetCode,
          {
            method: 'POST',
            body: JSON.stringify({
              email: 'test@email.com',
              password: 'Password1!',
            }),
          },
          {
            ...mock(db),
            SMTP: { init: () => ({ sendMail: sendEmailMock }) },
          },
        )
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`) ?? ''
        expect(code.length).toBe(8)

        expect(sendEmailMock).toBeCalledTimes(1)
        const callArgs = sendEmailMock.mock.calls[0] as any[]
        const body = (callArgs[0] as unknown as { html: string }).html
        expect(body).toContain(code)

        process.env.MAILGUN_API_KEY = ''
        process.env.MAILGUN_SENDER_ADDRESS = ''
        process.env.BREVO_API_KEY = ''
        process.env.BREVO_SENDER_ADDRESS = ''
      },
    )

    test(
      'should stop after reach threshold',
      async () => {
        global.process.env.PASSWORD_RESET_EMAIL_THRESHOLD = 2 as unknown as string

        await insertUsers(db)

        const res = await testSendResetCode(routeConfig.IdentityRoute.ResendResetCode)
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetAttempts}-test@email.com`)).toBe('1')

        const res1 = await testSendResetCode(routeConfig.IdentityRoute.ResendResetCode)
        const json1 = await res1.json()
        expect(json1).toStrictEqual({ success: true })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetAttempts}-test@email.com`)).toBe('2')

        const res2 = await testSendResetCode(routeConfig.IdentityRoute.ResendResetCode)
        expect(res2.status).toBe(400)

        global.process.env.PASSWORD_RESET_EMAIL_THRESHOLD = 0 as unknown as string
        const res3 = await testSendResetCode(routeConfig.IdentityRoute.ResendResetCode)
        expect(res3.status).toBe(200)

        global.process.env.PASSWORD_RESET_EMAIL_THRESHOLD = 5 as unknown as string
      },
    )

    test(
      'should throw error if no email config set',
      async () => {
        global.process.env.SENDGRID_API_KEY = ''
        await insertUsers(db)
        const res = await testSendResetCode(routeConfig.IdentityRoute.ResendResetCode)
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.NoEmailSender)
        global.process.env.SENDGRID_API_KEY = 'abc'
      },
    )
  },
)

describe(
  'post /authorize-reset',
  () => {
    test(
      'should reset password',
      async () => {
        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 1 as unknown as string
        const appRecord = await getApp(db)
        await insertUsers(db)

        await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com`)).toBe('1')

        await testSendResetCode(routeConfig.IdentityRoute.ResetCode)

        const body = {
          email: 'test@email.com',
          password: 'Password2!',
          code: await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`),
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeReset,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com`)).toBeFalsy()

        const signInRes = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(await signInRes.json()).toBeTruthy()
        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 5 as unknown as string
      },
    )

    test(
      'should throw error with wrong code',
      async () => {
        await insertUsers(db)

        await testSendResetCode(routeConfig.IdentityRoute.ResetCode)

        const body = {
          email: 'test@email.com',
          password: 'Password2!',
          code: 'abcdefgh',
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeReset,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongCode)
      },
    )

    test(
      'should throw error when reset with same password',
      async () => {
        await insertUsers(db)

        await testSendResetCode(routeConfig.IdentityRoute.ResetCode)

        const body = {
          email: 'test@email.com',
          password: 'Password1!',
          code: await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`),
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeReset,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.RequireDifferentPassword)
      },
    )

    test(
      'should not reset if user is inactive',
      async () => {
        await insertUsers(db)

        await testSendResetCode(routeConfig.IdentityRoute.ResetCode)

        disableUser(db)
        const body = {
          email: 'test@email.com',
          password: 'Password2!',
          code: await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`),
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeReset,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.UserDisabled)
      },
    )

    test(
      'should not reset if it is a wrong user',
      async () => {
        await insertUsers(db)

        await testSendResetCode(routeConfig.IdentityRoute.ResetCode)

        disableUser(db)
        const body = {
          email: 'test1@email.com',
          password: 'Password2!',
          code: await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`),
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeReset,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(localeConfig.Error.NoUser)
      },
    )

    test(
      'could disable account unlock by reset password',
      async () => {
        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 1 as unknown as string
        global.process.env.UNLOCK_ACCOUNT_VIA_PASSWORD_RESET = false as unknown as string

        const appRecord = await getApp(db)
        await insertUsers(db)

        await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com`)).toBe('1')

        await testSendResetCode(routeConfig.IdentityRoute.ResetCode)

        const body = {
          email: 'test@email.com',
          password: 'Password2!',
          code: await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`),
        }
        await app.request(
          routeConfig.IdentityRoute.AuthorizeReset,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )

        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com`)).toBe('1')

        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 5 as unknown as string
        global.process.env.UNLOCK_ACCOUNT_VIA_PASSWORD_RESET = true as unknown as string
      },
    )
  },
)

describe(
  'get /auth-code-expired',
  () => {
    test(
      'should show auth code expired en view',
      async () => {
        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthCodeExpired}?locale=en`,
          {},
          mock(db),
        )

        const html = await res.text()
        expect(html).toContain(localeConfig.authCodeExpired.msg.en)
      },
    )
    test(
      'should show auth code expired fr view',
      async () => {
        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthCodeExpired}?locale=fr`,
          {},
          mock(db),
        )

        const html = await res.text()
        expect(html).toContain(localeConfig.authCodeExpired.msg.fr)
      },
    )
  },
)
