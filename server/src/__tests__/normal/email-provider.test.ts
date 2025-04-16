import { Database } from 'better-sqlite3'
import {
  afterEach, beforeEach, describe, expect, Mock, test,
  vi,
} from 'vitest'
import {
  adapterConfig,
  messageConfig,
  routeConfig,
} from 'configs'
import app from 'index'
import { insertUsers } from 'tests/identity'
import {
  emailLogRecord,
  emailResponseMock,
  fetchMock,
  migrate, mock,
  mockedKV,
} from 'tests/mock'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const sendCorrectResetPasswordCodeReq = async () => {
  const body = {
    email: 'test@email.com',
    password: 'Password1!',
  }

  const res = await app.request(
    routeConfig.IdentityRoute.ResetPasswordCode,
    {
      method: 'POST', body: JSON.stringify(body),
    },
    mock(db),
  )

  const code = await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`) ?? ''

  return {
    res, code,
  }
}

describe(
  'post /reset-password-code',
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
        const {
          res, code,
        } = await sendCorrectResetPasswordCodeReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect(code.length).toBe(6)
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
        const {
          res, code,
        } = await sendCorrectResetPasswordCodeReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect(code.length).toBe(6)

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
        const {
          res, code,
        } = await sendCorrectResetPasswordCodeReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

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
        const {
          res, code,
        } = await sendCorrectResetPasswordCodeReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect(code.length).toBe(6)

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
        const { res } = await sendCorrectResetPasswordCodeReq()
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
        const {
          res, code,
        } = await sendCorrectResetPasswordCodeReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect(code.length).toBe(6)

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
        const { res } = await sendCorrectResetPasswordCodeReq()
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
      'could send reset code by Resend',
      async () => {
        process.env.SENDGRID_API_KEY = ''
        process.env.SENDGRID_SENDER_ADDRESS = ''
        process.env.MAILGUN_API_KEY = ''
        process.env.MAILGUN_SENDER_ADDRESS = ''
        process.env.BREVO_API_KEY = ''
        process.env.BREVO_SENDER_ADDRESS = ''
        process.env.RESEND_API_KEY = 're_2232323'
        process.env.RESEND_SENDER_ADDRESS = 'app@valuemelody.com'

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(db)
        const {
          res, code,
        } = await sendCorrectResetPasswordCodeReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect(code.length).toBe(6)

        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.resend.com/emails')
        expect(body).toContain(code)
        expect(body).toContain('"to":["test@email.com"]')

        const logs = await db.prepare('select * from email_log').all()
        expect(logs.length).toBe(0)

        global.fetch = fetchMock

        process.env.MAILGUN_API_KEY = ''
        process.env.MAILGUN_SENDER_ADDRESS = ''
        process.env.BREVO_API_KEY = ''
        process.env.BREVO_SENDER_ADDRESS = ''
        process.env.RESEND_API_KEY = ''
        process.env.RESEND_SENDER_ADDRESS = ''
        process.env.SENDGRID_API_KEY = 'abc'
        process.env.SENDGRID_SENDER_ADDRESS = 'app@valuemelody.com'
      },
    )

    test(
      'could log email by Resend',
      async () => {
        process.env.SENDGRID_API_KEY = ''
        process.env.SENDGRID_SENDER_ADDRESS = ''
        process.env.BREVO_API_KEY = ''
        process.env.BREVO_SENDER_ADDRESS = ''
        process.env.RESEND_API_KEY = 're_2232323'
        process.env.RESEND_SENDER_ADDRESS = 'app@valuemelody.com'
        process.env.ENABLE_EMAIL_LOG = true as unknown as string

        const mockFetch = emailResponseMock
        global.fetch = mockFetch as Mock

        await insertUsers(db)
        const { res } = await sendCorrectResetPasswordCodeReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const logs = await db.prepare('select * from email_log').all()
        expect(logs.length).toBe(1)
        expect(logs[0]).toStrictEqual(emailLogRecord)
        global.fetch = fetchMock

        process.env.BREVO_API_KEY = ''
        process.env.BREVO_SENDER_ADDRESS = ''
        process.env.RESEND_API_KEY = ''
        process.env.RESEND_SENDER_ADDRESS = ''
        process.env.SENDGRID_API_KEY = 'abc'
        process.env.SENDGRID_SENDER_ADDRESS = 'app@valuemelody.com'
        process.env.ENABLE_EMAIL_LOG = false as unknown as string
      },
    )

    test(
      'could send reset code by Postmark',
      async () => {
        process.env.SENDGRID_API_KEY = ''
        process.env.SENDGRID_SENDER_ADDRESS = ''
        process.env.POSTMARK_API_KEY = 'abc'
        process.env.POSTMARK_SENDER_ADDRESS = 'app@valuemelody.com'

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(db)
        const {
          res, code,
        } = await sendCorrectResetPasswordCodeReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect(code.length).toBe(6)

        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.postmarkapp.com/email')
        expect(body).toContain(code)
        expect(body).toContain('"To":"test@email.com"')

        const logs = await db.prepare('select * from email_log').all()
        expect(logs.length).toBe(0)

        global.fetch = fetchMock

        process.env.SENDGRID_API_KEY = 'abc'
        process.env.SENDGRID_SENDER_ADDRESS = 'app@valuemelody.com'
        process.env.POSTMARK_API_KEY = ''
        process.env.POSTMARK_SENDER_ADDRESS = ''
      },
    )

    test(
      'could log email by Postmark',
      async () => {
        process.env.SENDGRID_API_KEY = ''
        process.env.SENDGRID_SENDER_ADDRESS = ''
        process.env.POSTMARK_API_KEY = 'abc'
        process.env.POSTMARK_SENDER_ADDRESS = 'app@valuemelody.com'
        process.env.ENABLE_EMAIL_LOG = true as unknown as string

        const mockFetch = emailResponseMock
        global.fetch = mockFetch as Mock

        await insertUsers(db)
        const { res } = await sendCorrectResetPasswordCodeReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const logs = await db.prepare('select * from email_log').all()
        expect(logs.length).toBe(1)
        expect(logs[0]).toStrictEqual(emailLogRecord)
        global.fetch = fetchMock

        process.env.POSTMARK_API_KEY = ''
        process.env.POSTMARK_SENDER_ADDRESS = ''
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
          routeConfig.IdentityRoute.ResetPasswordCode,
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
        expect(code.length).toBe(6)

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

        const { res } = await sendCorrectResetPasswordCodeReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetAttempts}-test@email.com`)).toBe('1')

        const { res: res1 } = await sendCorrectResetPasswordCodeReq()
        const json1 = await res1.json()
        expect(json1).toStrictEqual({ success: true })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetAttempts}-test@email.com`)).toBe('2')

        const { res: res2 } = await sendCorrectResetPasswordCodeReq()
        expect(res2.status).toBe(400)

        global.process.env.PASSWORD_RESET_EMAIL_THRESHOLD = 0 as unknown as string
        const { res: res3 } = await sendCorrectResetPasswordCodeReq()
        expect(res3.status).toBe(200)

        global.process.env.PASSWORD_RESET_EMAIL_THRESHOLD = 5 as unknown as string
      },
    )

    test(
      'should throw error if no email config set',
      async () => {
        global.process.env.SENDGRID_API_KEY = ''
        await insertUsers(db)
        const { res } = await sendCorrectResetPasswordCodeReq()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.NoEmailSender)
        global.process.env.SENDGRID_API_KEY = 'abc'
      },
    )
  },
)
