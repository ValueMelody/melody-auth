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
  adapterConfig, localeConfig, routeConfig,
} from 'configs'
import { AuthCodeBody } from 'configs/type'
import {
  getApp,
  postAuthorizeBody,
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

const postAuthorizeAccount = async () => {
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
  return res
}

describe(
  'post /authorize-account',
  () => {
    test(
      'should get auth code after sign up',
      async () => {
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        const res = await postAuthorizeAccount()
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.MfaEnroll,
        })
        const appRecord = await getApp(db)
        const { code } = json as { code: string }
        const codeStore = JSON.parse(await mockedKV.get(`${adapterConfig.BaseKVKey.AuthCode}-${code}`) ?? '') as AuthCodeBody
        expect(codeStore.appId).toBe(1)
        expect(codeStore.appName).toBe(appRecord.name)
        expect(codeStore.request.clientId).toBe(appRecord.clientId)

        const verificationCode = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`) ?? ''
        expect(verificationCode.length).toBe(6)

        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(body).toContain(verificationCode)
        expect(body).toContain(localeConfig.emailVerificationEmail.verify.en)
        expect(body).toContain(`${routeConfig.IdentityRoute.VerifyEmailView}?id=${codeStore.user.authId}&amp;locale=en`)

        global.fetch = fetchMock
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'could override verification email with branding config',
      async () => {
        process.env.COMPANY_LOGO_URL = 'https://google.com'

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await postAuthorizeAccount()

        const callArgs = mockFetch.mock.calls[0] as any[]
        const emailBody = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(emailBody).toContain('https://google.com')
        expect(emailBody).not.toContain('https://raw.githubusercontent.com/ValueMelody/melody-homepage/main/logo.jpg')

        global.fetch = fetchMock
        process.env.COMPANY_LOGO_URL = 'https://raw.githubusercontent.com/ValueMelody/melody-homepage/main/logo.jpg'
      },
    )

    test(
      'should store org slug after sign up',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        db.exec('insert into "org" (name, slug, "companyLogoUrl") values (\'test\', \'default\', \'https://test.com\')')

        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
          password: 'Password1!',
          org: 'default',
        }

        await app.request(
          routeConfig.IdentityRoute.AuthorizeAccount,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )

        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        expect(currentUser.orgSlug).toBe('default')

        const callArgs = mockFetch.mock.calls[0] as any[]
        const emailBody = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(emailBody).toContain('https://test.com')
        expect(emailBody).not.toContain(process.env.COMPANY_LOGO_URL)

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should throw error if email exists',
      async () => {
        const res = await postAuthorizeAccount()
        expect(res.status).toBe(200)
        const res1 = await postAuthorizeAccount()
        expect(res1.status).toBe(400)
        expect(await res1.text()).toBe(localeConfig.Error.EmailTaken)
      },
    )

    test(
      'could disable email verification',
      async () => {
        global.process.env.ENABLE_EMAIL_VERIFICATION = false as unknown as string
        await postAuthorizeAccount()
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`)).toBeFalsy()
        global.process.env.ENABLE_EMAIL_VERIFICATION = true as unknown as string
      },
    )

    test(
      'could force otp mfa',
      async () => {
        global.process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        global.process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        const res = await postAuthorizeAccount()
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.OtpSetup,
        })
        global.process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        global.process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'could force email mfa',
      async () => {
        global.process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string
        global.process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        const res = await postAuthorizeAccount()
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.EmailMfa,
        })
        global.process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
        global.process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'could force sms mfa',
      async () => {
        global.process.env.SMS_MFA_IS_REQUIRED = true as unknown as string
        global.process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        const res = await postAuthorizeAccount()
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.SmsMfa,
        })
        global.process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
        global.process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'could skip mfa',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        global.process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        const res = await postAuthorizeAccount()
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        global.process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'could skip consent',
      async () => {
        global.process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        const res = await postAuthorizeAccount()
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.MfaEnroll,
        })
        global.process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'could set names as required',
      async () => {
        global.process.env.NAMES_IS_REQUIRED = true as unknown as string

        const res = await postAuthorizeAccount()
        expect(res.status).toBe(400)

        global.process.env.NAMES_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'should throw error if not enable sign up',
      async () => {
        global.process.env.ENABLE_SIGN_UP = false as unknown as string

        const res = await postAuthorizeAccount()
        expect(res.status).toBe(400)

        global.process.env.ENABLE_SIGN_UP = true as unknown as string
      },
    )

    test(
      'should throw error if passwordless sign in is enabled',
      async () => {
        global.process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string

        const res = await postAuthorizeAccount()
        expect(res.status).toBe(400)

        global.process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
      },
    )
  },
)
