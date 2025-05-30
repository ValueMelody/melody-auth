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
import { AuthCodeBody } from 'configs/type'
import {
  getApp,
  postAuthorizeBody,
} from 'tests/identity'
import {
  userAttributeValueModel, userModel,
} from 'models'

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
  'get /authorize-account',
  () => {
    test(
      'should get empty user attributes',
      async () => {
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeAccount,
          { method: 'GET' },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({ userAttributes: [] })

        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should get user attributes',
      async () => {
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        await db.exec('insert into "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values (\'test\', 1, 1, 1, 1)')
        await db.exec('insert into "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values (\'test2\', 0, 0, 0, 0)')
        await db.exec('insert into "user_attribute" (name, locales, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values (\'test3\', \'{"en": "test3 en", "fr": "test3 fr"}\', 1, 0, 0, 0)')

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeAccount,
          { method: 'GET' },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          userAttributes: [
            {
              id: 1,
              name: 'test',
              includeInSignUpForm: true,
              requiredInSignUpForm: true,
              includeInIdTokenBody: true,
              includeInUserInfo: true,
              locales: [],
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              deletedAt: null,
            },
            {
              id: 3,
              name: 'test3',
              includeInSignUpForm: true,
              requiredInSignUpForm: false,
              includeInIdTokenBody: false,
              includeInUserInfo: false,
              locales: [
                {
                  locale: 'en',
                  value: 'test3 en',
                },
                {
                  locale: 'fr',
                  value: 'test3 fr',
                },
              ],
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              deletedAt: null,
            },
          ],
        })

        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should return empty if feature is disabled',
      async () => {
        await db.exec('insert into "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values (\'test\', 1, 1, 1, 1)')

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeAccount,
          { method: 'GET' },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({ userAttributes: [] })
      },
    )
  },
)

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
        process.env.COMPANY_EMAIL_LOGO_URL = 'https://google.com'

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await postAuthorizeAccount()

        const callArgs = mockFetch.mock.calls[0] as any[]
        const emailBody = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(emailBody).toContain('https://google.com')
        expect(emailBody).not.toContain('https://valuemelody.com/logo.svg')

        global.fetch = fetchMock
        process.env.COMPANY_EMAIL_LOGO_URL = 'https://valuemelody.com/logo.svg'
      },
    )

    test(
      'could override verification email with welcome email',
      async () => {
        process.env.REPLACE_EMAIL_VERIFICATION_WITH_WELCOME_EMAIL = true as unknown as string

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await postAuthorizeAccount()

        const callArgs = mockFetch.mock.calls[0] as any[]
        const emailBody = (callArgs[1] as unknown as { body: string }).body
        expect(emailBody).toContain(localeConfig.welcomeEmail.title.en)
        expect(emailBody).toContain(localeConfig.welcomeEmail.desc.en)

        global.fetch = fetchMock
        process.env.REPLACE_EMAIL_VERIFICATION_WITH_WELCOME_EMAIL = false as unknown as string
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

        db.exec('insert into "org" (name, slug, "companyEmailLogoUrl") values (\'test\', \'default\', \'https://test_logo.com\')')

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
        expect(emailBody).toContain('https://test_logo.com')
        expect(emailBody).not.toContain(process.env.COMPANY_LOGO_URL)
        expect(emailBody).not.toContain(process.env.COMPANY_EMAIL_LOGO_URL)

        process.env.ENABLE_ORG = false as unknown as string
      },
    )

    test(
      'should not store org slug after sign up if allowPublicRegistration is false',
      async () => {
        process.env.ENABLE_ORG = true as unknown as string

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        db.exec('insert into "org" (name, slug, "companyEmailLogoUrl", "allowPublicRegistration") values (\'test\', \'default\', \'https://test_logo.com\', 0)')

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
        expect(currentUser.orgSlug).toBe('')

        const callArgs = mockFetch.mock.calls[0] as any[]
        const emailBody = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(emailBody).not.toContain('https://test_logo.com')
        expect(emailBody).toContain(process.env.COMPANY_LOGO_URL)
        expect(emailBody).toContain(process.env.COMPANY_EMAIL_LOGO_URL)

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
        expect(await res1.text()).toBe(messageConfig.RequestError.EmailTaken)
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
      'could force otp mfa use app level config',
      async () => {
        global.process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        db.prepare('update app set "useSystemMfaConfig" = 0, "requireEmailMfa" = 0, "requireOtpMfa" = 1, "requireSmsMfa" = 0, "allowEmailMfaAsBackup" = 0').run()

        const res = await postAuthorizeAccount()
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.OtpSetup,
        })
        global.process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['otp', 'email'] as unknown as string
      },
    )

    test(
      'could disable otp mfa use app level config',
      async () => {
        global.process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        global.process.env.OTP_MFA_IS_REQUIRED = true as unknown as string

        db.prepare('update app set "useSystemMfaConfig" = 0, "requireEmailMfa" = 0, "requireOtpMfa" = 0, "requireSmsMfa" = 0, "allowEmailMfaAsBackup" = 0').run()

        const res = await postAuthorizeAccount()
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })
        global.process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        global.process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
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
      'could force email mfa use app level config',
      async () => {
        global.process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        db.prepare('update app set "useSystemMfaConfig" = 0, "requireEmailMfa" = 1, "requireOtpMfa" = 0, "requireSmsMfa" = 0, "allowEmailMfaAsBackup" = 0').run()

        const res = await postAuthorizeAccount()
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.EmailMfa,
        })
        global.process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
      },
    )

    test(
      'could disable email mfa use app level config',
      async () => {
        global.process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        global.process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string

        db.prepare('update app set "useSystemMfaConfig" = 0, "requireEmailMfa" = 0, "requireOtpMfa" = 0, "requireSmsMfa" = 0, "allowEmailMfaAsBackup" = 0').run()

        const res = await postAuthorizeAccount()
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })
        global.process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        global.process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
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
      'could force sms mfa use app level config',
      async () => {
        global.process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        db.prepare('update app set "useSystemMfaConfig" = 0, "requireEmailMfa" = 0, "requireOtpMfa" = 0, "requireSmsMfa" = 1, "allowEmailMfaAsBackup" = 0').run()

        const res = await postAuthorizeAccount()
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.SmsMfa,
        })
        global.process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
      },
    )

    test(
      'could disable sms mfa use app level config',
      async () => {
        global.process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        global.process.env.SMS_MFA_IS_REQUIRED = true as unknown as string

        db.prepare('update app set "useSystemMfaConfig" = 0, "requireEmailMfa" = 0, "requireOtpMfa" = 0, "requireSmsMfa" = 0, "allowEmailMfaAsBackup" = 0').run()

        const res = await postAuthorizeAccount()
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })
        global.process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        global.process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
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
      'should success if name provided when required',
      async () => {
        global.process.env.NAMES_IS_REQUIRED = true as unknown as string

        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
          password: 'Password1!',
          firstName: 'John',
          lastName: 'Doe',
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeAccount,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(200)

        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        expect(currentUser.firstName).toBe('John')
        expect(currentUser.lastName).toBe('Doe')

        global.process.env.NAMES_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'could sign up with names using non binary strings',
      async () => {
        global.process.env.NAMES_IS_REQUIRED = true as unknown as string

        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
          password: 'Password1!',
          firstName: '名',
          lastName: '姓',
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeAccount,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(200)

        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        expect(currentUser.firstName).toBe('名')
        expect(currentUser.lastName).toBe('姓')

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

describe(
  'post /authorize-account with user attribute',
  () => {
    test(
      'should store attribute values after sign up',
      async () => {
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        db.exec('insert into "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm") values (\'test1\', 1, 1)')
        db.exec('insert into "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm") values (\'test2\', 1, 0)')

        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
          password: 'Password1!',
          attributes: {
            1: 'test value 1',
            2: 'test value 2',
          },
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeAccount,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )

        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.MfaEnroll,
        })

        const attributeValues = await db.prepare('select * from "user_attribute_value" where "userId" = 1').all() as userAttributeValueModel.Record[]

        expect(attributeValues.length).toBe(2)
        expect(attributeValues[0]).toStrictEqual({
          id: 1,
          userId: 1,
          userAttributeId: 1,
          value: 'test value 1',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
        })
        expect(attributeValues[1]).toStrictEqual({
          id: 2,
          userId: 1,
          userAttributeId: 2,
          value: 'test value 2',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
        })

        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'could skip unrequired attribute values',
      async () => {
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        db.exec('insert into "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm") values (\'test1\', 1, 1)')
        db.exec('insert into "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm") values (\'test2\', 1, 0)')

        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
          password: 'Password1!',
          attributes: { 1: 'test value 1' },
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeAccount,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )

        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.MfaEnroll,
        })

        const attributeValues = await db.prepare('select * from "user_attribute_value" where "userId" = 1').all() as userAttributeValueModel.Record[]

        expect(attributeValues.length).toBe(1)
        expect(attributeValues[0]).toStrictEqual({
          id: 1,
          userId: 1,
          userAttributeId: 1,
          value: 'test value 1',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
        })

        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'could throw error if missing required attribute values',
      async () => {
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        db.exec('insert into "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm") values (\'test1\', 1, 1)')
        db.exec('insert into "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm") values (\'test2\', 1, 0)')

        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
          password: 'Password1!',
          attributes: { 2: 'test value 1' },
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeAccount,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )

        expect(res.status).toBe(400)
        expect(await res.text()).toContain('Attribute is required: test1')

        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should skip if feature not enabled',
      async () => {
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        db.exec('insert into "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm") values (\'test1\', 1, 1)')
        db.exec('insert into "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm") values (\'test2\', 1, 0)')

        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
          password: 'Password1!',
          attributes: {
            1: 'test value 1',
            2: 'test value 2',
          },
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeAccount,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )

        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.MfaEnroll,
        })

        const attributeValues = await db.prepare('select * from "user_attribute_value" where "userId" = 1').all() as userAttributeValueModel.Record[]

        expect(attributeValues.length).toBe(0)

        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )
  },
)
