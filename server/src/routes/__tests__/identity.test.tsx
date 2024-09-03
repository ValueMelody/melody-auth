import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { JSDOM } from 'jsdom'
import { genCodeChallenge } from 'shared'
import { authenticator } from 'otplib'
import { sign } from 'hono/jwt'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  adapterConfig, localeConfig, routeConfig,
} from 'configs'
import {
  appModel, userModel,
} from 'models'
import { oauthDto } from 'dtos'
import {
  disableUser,
  enrollEmailMfa, enrollOtpMfa,
} from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  db.close()
  await mockedKV.empty()
})

const BaseRoute = routeConfig.InternalRoute.Identity

export const insertUsers = (
  db: Database, withConsent = true,
) => {
  db.exec(`
    INSERT INTO user
    (authId, locale, email, googleId, password, firstName, lastName)
    values ('1-1-1-1', 'en', 'test@email.com', null, '$2a$10$3HtEAf8YcN94V4GOR6ZBNu9tmoIflmEOqb9hUf0iqS4OjYVKe.9/C', null, null)
  `)
  if (withConsent) {
    db.exec(`
      INSERT INTO user_app_consent
      (userId, appId)
      values (1, 1)
    `)
  }
}

export const getApp = (db: Database) => {
  const appRecord = db.prepare('SELECT * FROM app where id = 1').get() as appModel.Record
  return appRecord
}

export const getAuthorizeParams = async (appRecord: appModel.Record) => {
  const codeChallenge = await genCodeChallenge('abc')
  let params = ''
  params += `?client_id=${appRecord.clientId}&redirect_uri=http://localhost:3000/en/dashboard`
  params += '&response_type=code&state=123&locale=en'
  params += '&scope=openid%20profile%20offline_access'
  params += `&code_challenge_method=S256&code_challenge=${codeChallenge}`
  return params
}

export const getSignInRequest = async (
  db: Database, url: string, appRecord: appModel.Record,
) => {
  const params = await getAuthorizeParams(appRecord)

  const res = await app.request(
    `${url}${params}`,
    {},
    mock(db),
  )
  return res
}

const postAuthorizeBody = async (appRecord: appModel.Record) => ({
  clientId: appRecord.clientId,
  redirectUri: 'http://localhost:3000/en/dashboard',
  responseType: 'code',
  state: '123',
  codeChallengeMethod: 'S256',
  codeChallenge: await genCodeChallenge('abc'),
  scope: 'profile openid offline_access',
  locale: 'en',
})

export const postSignInRequest = async (
  db: Database,
  appRecord: appModel.Record,
  option?: {
    email?: string;
    password?: string;
  },
) => {
  const url = `${BaseRoute}/authorize-password`
  const body = {
    ...(await postAuthorizeBody(appRecord)),
    email: option?.email ?? 'test@email.com',
    password: option?.password ?? 'Password1!',
  }

  const res = await app.request(
    `${url}`,
    {
      method: 'POST', body: JSON.stringify(body),
    },
    mock(db),
  )
  return res
}

const prepareFollowUpParams = async () => {
  const appRecord = getApp(db)
  const res = await postSignInRequest(
    db,
    appRecord,
  )
  const json = await res.json() as { code: string }
  return `?state=123&redirect_uri=http://localhost:3000/en/dashboard&locale=en&code=${json.code}`
}

export const prepareFollowUpBody = async (db: Database) => {
  const appRecord = getApp(db)
  const res = await postSignInRequest(
    db,
    appRecord,
  )
  const json = await res.json() as { code: string }
  return {
    state: '123',
    redirectUri: 'http://localhost:3000/en/dashboard',
    code: json.code,
    locale: 'en',
  }
}

describe(
  'get /authorize-password',
  () => {
    test(
      'should show sign in page',
      async () => {
        const appRecord = getApp(db)
        const res = await getSignInRequest(
          db,
          `${BaseRoute}/authorize-password`,
          appRecord,
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByName('email').length).toBe(1)
        expect(document.getElementsByName('password').length).toBe(1)
        expect(document.getElementById('submit-button')).toBeTruthy()
        expect(document.getElementsByTagName('form').length).toBe(1)
        expect(document.getElementsByClassName('g_id_signin').length).toBe(0)
        const links = document.getElementsByTagName('a')
        expect(links.length).toBe(3)
        expect(links[0].innerHTML).toBe(localeConfig.authorizePassword.signUp.en)
        expect(links[1].innerHTML).toBe(localeConfig.authorizePassword.passwordReset.en)
        expect(links[2].innerHTML).toBe(localeConfig.common.poweredByAuth.en)
      },
    )

    test(
      'should show google sign in',
      async () => {
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '123' as unknown as string
        const appRecord = getApp(db)
        const res = await getSignInRequest(
          db,
          `${BaseRoute}/authorize-password`,
          appRecord,
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByClassName('g_id_signin').length).toBe(1)
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '' as unknown as string
      },
    )

    test(
      'could disable sign up',
      async () => {
        global.process.env.ENABLE_SIGN_UP = false as unknown as string
        const appRecord = getApp(db)
        const res = await getSignInRequest(
          db,
          `${BaseRoute}/authorize-password`,
          appRecord,
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        const links = document.getElementsByTagName('a')
        expect(links.length).toBe(2)
        expect(links[0].innerHTML).toBe(localeConfig.authorizePassword.passwordReset.en)
        expect(links[1].innerHTML).toBe(localeConfig.common.poweredByAuth.en)
        global.process.env.ENABLE_SIGN_UP = true as unknown as string
      },
    )

    test(
      'could disable password reset',
      async () => {
        global.process.env.ENABLE_PASSWORD_RESET = false as unknown as string
        const appRecord = getApp(db)
        const res = await getSignInRequest(
          db,
          `${BaseRoute}/authorize-password`,
          appRecord,
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        const links = document.getElementsByTagName('a')
        expect(links.length).toBe(2)
        expect(links[0].innerHTML).toBe(localeConfig.authorizePassword.signUp.en)
        expect(links[1].innerHTML).toBe(localeConfig.common.poweredByAuth.en)
        global.process.env.ENABLE_PASSWORD_RESET = true as unknown as string
      },
    )

    test(
      'could disable password sign in',
      async () => {
        global.process.env.ENABLE_PASSWORD_SIGN_IN = false as unknown as string
        const appRecord = getApp(db)
        const res = await getSignInRequest(
          db,
          `${BaseRoute}/authorize-password`,
          appRecord,
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByName('email').length).toBe(0)
        expect(document.getElementsByName('password').length).toBe(0)
        expect(document.getElementById('submit-button')).toBeFalsy()
        global.process.env.ENABLE_PASSWORD_SIGN_IN = true as unknown as string
      },
    )

    test(
      'should render locale selector',
      async () => {
        const appRecord = getApp(db)
        const res = await getSignInRequest(
          db,
          `${BaseRoute}/authorize-password`,
          appRecord,
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(1)
        const options = document.getElementsByTagName('option')
        expect(options.length).toBe(2)
        expect(options[0].innerHTML).toBe('EN')
        expect(options[1].innerHTML).toBe('FR')
      },
    )

    test(
      'could render french',
      async () => {
        global.process.env.SUPPORTED_LOCALES = ['fr'] as unknown as string
        const appRecord = getApp(db)
        const res = await getSignInRequest(
          db,
          `${BaseRoute}/authorize-password`,
          appRecord,
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        const labels = document.getElementsByTagName('label')
        expect(labels[0].innerHTML).toBe(`${localeConfig.authorizePassword.email.fr}<span class="text-red ml-2">*</span>`)
        expect(labels[1].innerHTML).toBe(`${localeConfig.authorizePassword.password.fr}<span class="text-red ml-2">*</span>`)
        global.process.env.SUPPORTED_LOCALES = ['fr'] as unknown as string
      },
    )

    test(
      'could disable locale selector',
      async () => {
        global.process.env.ENABLE_LOCALE_SELECTOR = false as unknown as string
        const appRecord = getApp(db)
        const res = await getSignInRequest(
          db,
          `${BaseRoute}/authorize-password`,
          appRecord,
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(0)
        global.process.env.ENABLE_LOCALE_SELECTOR = true as unknown as string
      },
    )

    test(
      'should disable locale selector when there only 1 locale',
      async () => {
        global.process.env.SUPPORTED_LOCALES = ['en'] as unknown as string
        const appRecord = getApp(db)
        const res = await getSignInRequest(
          db,
          `${BaseRoute}/authorize-password`,
          appRecord,
        )
        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(0)
        global.process.env.SUPPORTED_LOCALES = ['en', 'fr'] as unknown as string
      },
    )
  },
)

describe(
  'post /authorize-password',
  () => {
    test(
      'should get auth code after sign in',
      async () => {
        const appRecord = getApp(db)
        insertUsers(db)
        const res = await postSignInRequest(
          db,
          appRecord,
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          requireConsent: false,
          requireMfaEnroll: true,
          requireEmailMfa: false,
          requireOtpSetup: false,
          requireOtpMfa: false,
        })
        const { code } = json as { code: string }
        const codeStore = JSON.parse(await mockedKV.get(`AC-${code}`) ?? '')
        expect(codeStore.appId).toBe(1)
        expect(codeStore.user.authId).toBe('1-1-1-1')
        expect(codeStore.appName).toBe(appRecord.name)
        expect(codeStore.request.clientId).toBe(appRecord.clientId)
      },
    )

    test(
      'should be blocked if not allowed by config',
      async () => {
        global.process.env.ENABLE_PASSWORD_SIGN_IN = false as unknown as string
        const appRecord = getApp(db)
        insertUsers(db)
        const res = await postSignInRequest(
          db,
          appRecord,
        )
        expect(res.status).toBe(400)
        global.process.env.ENABLE_PASSWORD_SIGN_IN = true as unknown as string
      },
    )

    test(
      'should throw error if user not found',
      async () => {
        const appRecord = getApp(db)
        insertUsers(db)
        const res = await postSignInRequest(
          db,
          appRecord,
          { email: 'test1@email.com' },
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(localeConfig.Error.NoUser)
      },
    )

    test(
      'should throw error if user disabled',
      async () => {
        const appRecord = getApp(db)
        insertUsers(db)
        disableUser(db)
        const res = await postSignInRequest(
          db,
          appRecord,
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.UserDisabled)
      },
    )

    test(
      'could lock access',
      async () => {
        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 1 as unknown as string
        const appRecord = getApp(db)
        insertUsers(db)
        const res = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(res.status).toBe(404)
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com`)).toBe('1')

        const res2 = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(res2.status).toBe(400)
        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 1 as unknown as string
      },
    )

    test(
      'could disable account lock',
      async () => {
        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 0 as unknown as string
        const appRecord = getApp(db)
        insertUsers(db)
        const res = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(res.status).toBe(404)
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com`)).toBeFalsy()

        const res2 = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(res2.status).toBe(404)
        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 0 as unknown as string
      },
    )
  },
)

describe(
  'get /authorize-account',
  () => {
    test(
      'should show sign up page',
      async () => {
        const appRecord = getApp(db)
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${BaseRoute}/authorize-account${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByName('email').length).toBe(1)
        expect(document.getElementsByName('password').length).toBe(1)
        expect(document.getElementsByName('confirmPassword').length).toBe(1)
        expect(document.getElementsByName('firstName').length).toBe(1)
        expect(document.getElementsByName('lastName').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)
        expect(document.getElementsByTagName('select').length).toBe(1)
      },
    )

    test(
      'could disable locale selector',
      async () => {
        global.process.env.ENABLE_LOCALE_SELECTOR = false as unknown as string
        const appRecord = getApp(db)
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${BaseRoute}/authorize-account${params}`,
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
      'should be suppressed if not enabled in config',
      async () => {
        global.process.env.ENABLE_SIGN_UP = false as unknown as string
        const appRecord = getApp(db)
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${BaseRoute}/authorize-account${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        global.process.env.ENABLE_SIGN_UP = true as unknown as string
      },
    )

    test(
      'could suppress names',
      async () => {
        global.process.env.ENABLE_NAMES = false as unknown as string

        const appRecord = getApp(db)
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${BaseRoute}/authorize-account${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByName('firstName').length).toBe(0)
        expect(document.getElementsByName('lastName').length).toBe(0)
        global.process.env.ENABLE_NAMES = true as unknown as string
      },
    )

    test(
      'could require names',
      async () => {
        global.process.env.NAMES_IS_REQUIRED = true as unknown as string

        const appRecord = getApp(db)
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${BaseRoute}/authorize-account${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        const firstNameLabel = document.getElementsByTagName('label')[3].innerHTML
        const lastNameLabel = document.getElementsByTagName('label')[4].innerHTML
        expect(firstNameLabel).toContain(localeConfig.authorizeAccount.firstName.en)
        expect(firstNameLabel).toContain('*')
        expect(lastNameLabel).toContain(localeConfig.authorizeAccount.lastName.en)
        expect(lastNameLabel).toContain('*')
        global.process.env.NAMES_IS_REQUIRED = false as unknown as string
      },
    )
  },
)

const postAuthorizeAccount = async () => {
  const appRecord = getApp(db)
  const body = {
    ...(await postAuthorizeBody(appRecord)),
    email: 'test@email.com',
    password: 'Password1!',
  }

  const res = await app.request(
    `${BaseRoute}/authorize-account`,
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
        const res = await postAuthorizeAccount()
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          requireConsent: true,
          requireMfaEnroll: true,
          requireEmailMfa: false,
          requireOtpSetup: false,
          requireOtpMfa: false,
        })
        const appRecord = getApp(db)
        const { code } = json as { code: string }
        const codeStore = JSON.parse(await mockedKV.get(`${adapterConfig.BaseKVKey.AuthCode}-${code}`) ?? '')
        expect(codeStore.appId).toBe(1)
        expect(codeStore.appName).toBe(appRecord.name)
        expect(codeStore.request.clientId).toBe(appRecord.clientId)
        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`) ?? '').length).toBe(8)
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
        const res = await postAuthorizeAccount()
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          requireConsent: true,
          requireMfaEnroll: false,
          requireEmailMfa: false,
          requireOtpSetup: true,
          requireOtpMfa: true,
        })
        global.process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'could force email mfa',
      async () => {
        global.process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string
        const res = await postAuthorizeAccount()
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          requireConsent: true,
          requireMfaEnroll: false,
          requireEmailMfa: true,
          requireOtpSetup: false,
          requireOtpMfa: false,
        })
        global.process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'could skip mfa',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        const res = await postAuthorizeAccount()
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          requireConsent: true,
          requireMfaEnroll: false,
          requireEmailMfa: false,
          requireOtpSetup: false,
          requireOtpMfa: false,
        })
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = true as unknown as string
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
          requireConsent: false,
          requireMfaEnroll: true,
          requireEmailMfa: false,
          requireOtpSetup: false,
          requireOtpMfa: false,
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
  },
)

describe(
  'get /authorize-reset',
  () => {
    test(
      'should show reset page',
      async () => {
        const appRecord = getApp(db)
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${BaseRoute}/authorize-reset${params}`,
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
        const appRecord = getApp(db)
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${BaseRoute}/authorize-reset${params}`,
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
        const appRecord = getApp(db)
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${BaseRoute}/authorize-reset${params}`,
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
    `${BaseRoute}${route}`,
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
        insertUsers(db)
        const res = await testSendResetCode('/reset-code')
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`) ?? '').length).toBe(8)
      },
    )

    test(
      'should return true if user is inactive',
      async () => {
        insertUsers(db)
        disableUser(db)
        const res = await testSendResetCode('/reset-code')
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`)).toBeFalsy()
      },
    )

    test(
      'should throw error if no email provided',
      async () => {
        insertUsers(db)

        const res = await app.request(
          `${BaseRoute}/reset-code`,
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
      'should send reset code',
      async () => {
        insertUsers(db)
        const res = await testSendResetCode('/resend-reset-code')
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`) ?? '').length).toBe(8)
      },
    )

    test(
      'should stop after reach threshold',
      async () => {
        global.process.env.PASSWORD_RESET_EMAIL_THRESHOLD = 2 as unknown as string

        insertUsers(db)

        const res = await testSendResetCode('/resend-reset-code')
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetAttempts}-test@email.com`)).toBe('1')

        const res1 = await testSendResetCode('/resend-reset-code')
        const json1 = await res1.json()
        expect(json1).toStrictEqual({ success: true })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetAttempts}-test@email.com`)).toBe('2')

        const res2 = await testSendResetCode('/resend-reset-code')
        expect(res2.status).toBe(400)

        global.process.env.PASSWORD_RESET_EMAIL_THRESHOLD = 5 as unknown as string
      },
    )
  },
)

describe(
  'email sender config',
  () => {
    test(
      'should throw error if no email config set',
      async () => {
        global.process.env.SENDGRID_API_KEY = '' as unknown as string
        insertUsers(db)
        const res = await testSendResetCode('/resend-reset-code')
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.NoEmailSender)
        global.process.env.SENDGRID_API_KEY = 'abc' as unknown as string
      },
    )

    test(
      'could send email if brevo config set',
      async () => {
        global.process.env.SENDGRID_API_KEY = '' as unknown as string
        global.process.env.SENDGRID_SENDER_ADDRESS = '' as unknown as string
        global.process.env.BREVO_API_KEY = 'abc' as unknown as string
        global.process.env.BREVO_SENDER_ADDRESS = 'app@valuemelody.com' as unknown as string
        insertUsers(db)
        const res = await testSendResetCode('/resend-reset-code')
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`) ?? '').length).toBe(8)
        global.process.env.SENDGRID_API_KEY = 'abc' as unknown as string
        global.process.env.SENDGRID_SENDER_ADDRESS = 'app@valuemelody.com' as unknown as string
        global.process.env.BREVO_API_KEY = '' as unknown as string
        global.process.env.BREVO_SENDER_ADDRESS = '' as unknown as string
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
        const appRecord = getApp(db)
        insertUsers(db)

        await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com`)).toBe('1')

        await testSendResetCode('/reset-code')

        const body = {
          email: 'test@email.com',
          password: 'Password2!',
          code: await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`),
        }

        const res = await app.request(
          `${BaseRoute}/authorize-reset`,
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
        insertUsers(db)

        await testSendResetCode('/reset-code')

        const body = {
          email: 'test@email.com',
          password: 'Password2!',
          code: 'abcdefgh',
        }

        const res = await app.request(
          `${BaseRoute}/authorize-reset`,
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
        insertUsers(db)

        await testSendResetCode('/reset-code')

        const body = {
          email: 'test@email.com',
          password: 'Password1!',
          code: await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`),
        }

        const res = await app.request(
          `${BaseRoute}/authorize-reset`,
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
        insertUsers(db)

        await testSendResetCode('/reset-code')

        disableUser(db)
        const body = {
          email: 'test@email.com',
          password: 'Password2!',
          code: await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`),
        }

        const res = await app.request(
          `${BaseRoute}/authorize-reset`,
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
        insertUsers(db)

        await testSendResetCode('/reset-code')

        disableUser(db)
        const body = {
          email: 'test1@email.com',
          password: 'Password2!',
          code: await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`),
        }

        const res = await app.request(
          `${BaseRoute}/authorize-reset`,
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

        const appRecord = getApp(db)
        insertUsers(db)

        await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com`)).toBe('1')

        await testSendResetCode('/reset-code')

        const body = {
          email: 'test@email.com',
          password: 'Password2!',
          code: await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`),
        }
        await app.request(
          `${BaseRoute}/authorize-reset`,
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
  'get /authorize-mfa-enroll',
  () => {
    test(
      'should show mfa enroll page',
      async () => {
        insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams()

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
        insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams()

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
        insertUsers(
          db,
          false,
        )
        db.prepare('update user set mfaTypes = ?').run('email')
        const params = await prepareFollowUpParams()

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
        insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams()

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
        insertUsers(
          db,
          false,
        )
        await prepareFollowUpParams()

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
        insertUsers(
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

        const user = await db.prepare('SELECT * from user WHERE id = 1').get() as userModel.Raw
        expect(user.mfaTypes).toBe(userModel.MfaType.Email)
      },
    )

    test(
      'should throw error if user already enrolled',
      async () => {
        insertUsers(
          db,
          false,
        )
        db.prepare('update user set mfaTypes = ?').run('email')
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
        insertUsers(
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

        const user = await db.prepare('SELECT * from user WHERE id = 1').get() as userModel.Raw
        expect(user.mfaTypes).toBe(userModel.MfaType.Otp)
      },
    )
  },
)

const testGetOtpMfa = async (route: string) => {
  const params = await prepareFollowUpParams()

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
        insertUsers(
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
        insertUsers(
          db,
          false,
        )
        db.prepare('update user set otpVerified = ?').run(1)
        const params = await prepareFollowUpParams()

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
        insertUsers(
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
        insertUsers(
          db,
          false,
        )
        enrollOtpMfa(db)
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

        insertUsers(
          db,
          false,
        )
        enrollOtpMfa(db)
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
        insertUsers(
          db,
          false,
        )
        enrollOtpMfa(db)
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
        insertUsers(
          db,
          false,
        )
        enrollOtpMfa(db)
        const body = await prepareFollowUpBody(db)
        const currentUser = db.prepare('select * from user where id = 1').get() as userModel.Raw
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
        await mockedKV.put(`${adapterConfig.BaseKVKey.AuthCode}-abc`, JSON.stringify({ user: { otpSecret: null } }))
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
        insertUsers(
          db,
          false,
        )
        enrollOtpMfa(db)
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
        insertUsers(
          db,
          false,
        )
        enrollOtpMfa(db)

        const params = await prepareFollowUpParams()
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
        insertUsers(
          db,
          false,
        )
        enrollEmailMfa(db)
        const params = await prepareFollowUpParams()

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
        insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams()

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
        insertUsers(
          db,
          false,
        )
        enrollEmailMfa(db)
        const params = await prepareFollowUpParams()

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
        insertUsers(
          db,
          false,
        )
        enrollEmailMfa(db)
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
      'should could use original code',
      async () => {
        insertUsers(
          db,
          false,
        )
        enrollEmailMfa(db)
        const params = await prepareFollowUpParams()

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
      'should throw error for wrong code',
      async () => {
        insertUsers(
          db,
          false,
        )
        enrollEmailMfa(db)
        const params = await prepareFollowUpParams()

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
        insertUsers(
          db,
          false,
        )
        enrollEmailMfa(db)
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

describe(
  'get /authorize-consent',
  () => {
    test(
      'should show consent page',
      async () => {
        insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams()

        const res = await app.request(
          `${BaseRoute}/authorize-consent${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        expect(html).toContain('Access your basic profile information')
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(1)
        expect(document.getElementsByTagName('button').length).toBe(2)
        expect(document.getElementsByTagName('button')[0].innerHTML).toBe(localeConfig.authorizeConsent.decline.en)
        expect(document.getElementsByTagName('button')[1].innerHTML).toBe(localeConfig.authorizeConsent.accept.en)
      },
    )

    test(
      'could disable locale selector',
      async () => {
        global.process.env.ENABLE_LOCALE_SELECTOR = false as unknown as string
        insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams()

        const res = await app.request(
          `${BaseRoute}/authorize-consent${params}`,
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
      'should show scope name if locale not provided',
      async () => {
        insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams()
        db.prepare('delete from scope_locale').run()

        const res = await app.request(
          `${BaseRoute}/authorize-consent${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        expect(html).toContain('profile')
      },
    )

    test(
      'should not throw error if scope not found',
      async () => {
        insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams()
        db.prepare('update scope set deletedAt = ?').run('2024')

        const res = await app.request(
          `${BaseRoute}/authorize-consent${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        expect(html).not.toContain('profile')
      },
    )
  },
)

describe(
  'post /authorize-consent',
  () => {
    test(
      'should consent',
      async () => {
        insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          `${BaseRoute}/authorize-consent`,
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
          requireConsent: false,
          requireMfaEnroll: true,
          requireEmailMfa: false,
          requireOtpSetup: false,
          requireOtpMfa: false,
        })
        const consent = db.prepare('SELECT * from user_app_consent WHERE userId = 1 AND appId = 1').get()
        expect(consent).toBeTruthy()
      },
    )
  },
)

const prepareUserAccount = async () => {
  const appRecord = getApp(db)
  const body = {
    ...(await postAuthorizeBody(appRecord)),
    email: 'test@email.com',
    password: 'Password1!',
  }

  await app.request(
    `${BaseRoute}/authorize-account`,
    {
      method: 'POST', body: JSON.stringify(body),
    },
    mock(db),
  )
}

describe(
  'get /verify-email',
  () => {
    test(
      'should show verify email page',
      async () => {
        await prepareUserAccount()

        const currentUser = db.prepare('select * from user where id = 1').get() as userModel.Raw
        expect(currentUser.emailVerified).toBe(0)
        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`) ?? '').length).toBe(8)

        const res = await app.request(
          `${BaseRoute}/verify-email?id=${currentUser.authId}&locale=en`,
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

        const currentUser = db.prepare('select * from user where id = 1').get() as userModel.Raw

        const res = await app.request(
          `${BaseRoute}/verify-email?id=${currentUser.authId}&locale=en`,
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

        const currentUser = db.prepare('select * from user where id = 1').get() as userModel.Raw
        expect(currentUser.emailVerified).toBe(0)
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`)).toBeFalsy()

        const res = await app.request(
          `${BaseRoute}/verify-email?id=${currentUser.authId}&locale=en`,
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
          `${BaseRoute}/verify-email`,
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

        const currentUser = db.prepare('select * from user where id = 1').get() as userModel.Raw
        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`)

        const res = await app.request(
          `${BaseRoute}/verify-email`,
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

        const updatedUser = db.prepare('select * from user where id = 1').get() as userModel.Raw
        expect(updatedUser.emailVerified).toBe(1)
      },
    )

    test(
      'should not verify if wrong code provided',
      async () => {
        await prepareUserAccount()

        const currentUser = db.prepare('select * from user where id = 1').get() as userModel.Raw

        const res = await app.request(
          `${BaseRoute}/verify-email`,
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

        const currentUser = db.prepare('select * from user where id = 1').get() as userModel.Raw
        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`)

        const res = await app.request(
          `${BaseRoute}/verify-email`,
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
          `${BaseRoute}/verify-email`,
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

        const currentUser = db.prepare('select * from user where id = 1').get() as userModel.Raw
        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`)

        disableUser(db)

        const res = await app.request(
          `${BaseRoute}/verify-email`,
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
  'post /authorize-google',
  () => {
    const prepareRequest = async (emailVerified: boolean) => {
      const privateSecret = await mockedKV.get(adapterConfig.BaseKVKey.JwtPrivateSecret) ?? ''
      const credential = await sign(
        {
          iss: 'https://accounts.google.com',
          email: 'test@gmail.com',
          sub: 'gid123',
          email_verified: emailVerified,
          given_name: 'first',
          family_name: 'last',
          kid: '123',
        },
        privateSecret,
        'RS256',
      )

      const appRecord = getApp(db)
      const res = await app.request(
        `${BaseRoute}/authorize-google`,
        {
          method: 'POST',
          body: JSON.stringify({
            ...(await postAuthorizeBody(appRecord)),
            credential,
          }),
        },
        mock(db),
      )
      return res
    }

    const postGoogleRequest = async (emailVerified: boolean) => {
      const res = await prepareRequest(emailVerified)

      const users = db.prepare('select * from user').all() as userModel.Raw[]
      expect(users.length).toBe(1)
      expect(users[0].googleId).toBe('gid123')
      expect(users[0].email).toBe('test@gmail.com')
      expect(users[0].firstName).toBe('first')
      expect(users[0].lastName).toBe('last')
      expect(users[0].emailVerified).toBe(emailVerified ? 1 : 0)
      expect(await res.json()).toStrictEqual({
        code: expect.any(String),
        redirectUri: 'http://localhost:3000/en/dashboard',
        state: '123',
        scopes: ['profile', 'openid', 'offline_access'],
        requireConsent: true,
        requireMfaEnroll: false,
        requireEmailMfa: false,
        requireOtpSetup: false,
        requireOtpMfa: false,
      })
    }

    test(
      'should sign in with a new google account',
      async () => {
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '123' as unknown as string
        await postGoogleRequest(true)
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '' as unknown as string
      },
    )

    test(
      'should be blocked if not enable in config',
      async () => {
        const privateSecret = await mockedKV.get(adapterConfig.BaseKVKey.JwtPrivateSecret) ?? ''
        const credential = await sign(
          {
            iss: 'https://accounts.google.com',
            email: 'test@gmail.com',
            sub: 'gid123',
            email_verified: true,
            given_name: 'first',
            family_name: 'last',
          },
          privateSecret,
          'RS256',
        )

        const appRecord = getApp(db)
        const res = await app.request(
          `${BaseRoute}/authorize-google`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...(await postAuthorizeBody(appRecord)),
              credential: `${credential}`,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'could throw error if wrong credential provided',
      async () => {
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '123' as unknown as string
        const privateSecret = await mockedKV.get(adapterConfig.BaseKVKey.JwtPrivateSecret) ?? ''
        const credential = await sign(
          {
            iss: 'https://accounts.any.com',
            email: 'test@gmail.com',
            sub: 'gid123',
            email_verified: true,
            given_name: 'first',
            family_name: 'last',
          },
          privateSecret,
          'RS256',
        )

        const appRecord = getApp(db)
        const res = await app.request(
          `${BaseRoute}/authorize-google`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...(await postAuthorizeBody(appRecord)),
              credential: `${credential}`,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(localeConfig.Error.NoUser)
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '' as unknown as string
      },
    )

    test(
      'should sign in with an existing google account',
      async () => {
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '123' as unknown as string
        await postGoogleRequest(true)
        await postGoogleRequest(true)
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '' as unknown as string
      },
    )

    test(
      'should throw error if user is not active',
      async () => {
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '123' as unknown as string
        await postGoogleRequest(true)
        disableUser(db)
        const res = await prepareRequest(true)
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.UserDisabled)
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '' as unknown as string
      },
    )

    test(
      'should sign in with an existing google account and update verify info',
      async () => {
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '123' as unknown as string
        await postGoogleRequest(false)
        await postGoogleRequest(true)
        await postGoogleRequest(false)
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '' as unknown as string
      },
    )
  },
)

describe(
  'post /logout',
  () => {
    const prepareLogout = async () => {
      const appRecord = getApp(db)
      insertUsers(db)
      const res = await postSignInRequest(
        db,
        appRecord,
      )

      const json = await res.json() as { code: string }

      const body = {
        grant_type: oauthDto.TokenGrantType.AuthorizationCode,
        code: json.code,
        code_verifier: 'abc',
      }
      const tokenRes = await app.request(
        `${routeConfig.InternalRoute.OAuth}/token`,
        {
          method: 'POST',
          body: new URLSearchParams(body).toString(),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
        mock(db),
      )
      const tokenJson = await tokenRes.json() as { refresh_token: string; access_token: string }

      const tokenBody = await mockedKV.get(`${adapterConfig.BaseKVKey.RefreshToken}-${tokenJson.refresh_token}`)
      expect(JSON.parse(tokenBody ?? '')).toStrictEqual({
        authId: '1-1-1-1',
        clientId: appRecord.clientId,
        scope: 'profile openid offline_access',
        roles: [],
      })

      return tokenJson
    }

    test(
      'should logout',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        const appRecord = getApp(db)
        const tokenJson = await prepareLogout()

        const logoutRes = await app.request(
          `${BaseRoute}/logout`,
          {
            method: 'POST',
            body: new URLSearchParams({
              refresh_token: tokenJson.refresh_token,
              post_logout_redirect_uri: '/',
            }).toString(),
            headers: {
              Authorization: `Bearer ${tokenJson.access_token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
          mock(db),
        )
        expect(await logoutRes.json()).toStrictEqual({
          success: true,
          redirectUri: `http://localhost:8787/oauth2/v1/logout?post_logout_redirect_uri=/&client_id=${appRecord.clientId}`,
        })

        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.RefreshToken}-${tokenJson.refresh_token}`)).toBeFalsy()

        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = true as unknown as string
      },
    )

    test(
      'could logout without post logout redirect uri',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        const appRecord = getApp(db)
        const tokenJson = await prepareLogout()

        const logoutRes = await app.request(
          `${BaseRoute}/logout`,
          {
            method: 'POST',
            body: new URLSearchParams({ refresh_token: tokenJson.refresh_token }).toString(),
            headers: {
              Authorization: `Bearer ${tokenJson.access_token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
          mock(db),
        )
        expect(await logoutRes.json()).toStrictEqual({
          success: true,
          redirectUri: `http://localhost:8787/oauth2/v1/logout?post_logout_redirect_uri=&client_id=${appRecord.clientId}`,
        })

        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.RefreshToken}-${tokenJson.refresh_token}`)).toBeFalsy()

        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = true as unknown as string
      },
    )

    test(
      'should throw error if token has wrong client',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        const appRecord = getApp(db)
        insertUsers(db)
        const res = await postSignInRequest(
          db,
          appRecord,
        )

        const json = await res.json() as { code: string }

        const body = {
          grant_type: oauthDto.TokenGrantType.AuthorizationCode,
          code: json.code,
          code_verifier: 'abc',
        }
        const tokenRes = await app.request(
          `${routeConfig.InternalRoute.OAuth}/token`,
          {
            method: 'POST',
            body: new URLSearchParams(body).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        const tokenJson = await tokenRes.json() as { refresh_token: string; access_token: string }

        const tokenKey = `${adapterConfig.BaseKVKey.RefreshToken}-${tokenJson.refresh_token}`
        await mockedKV.put(tokenKey, JSON.stringify({
          ...JSON.parse(await mockedKV.get(tokenKey) ?? ''), authId: '123',
        }))
        const logoutRes = await app.request(
          `${BaseRoute}/logout`,
          {
            method: 'POST',
            body: new URLSearchParams({
              refresh_token: tokenJson.refresh_token,
              post_logout_redirect_uri: '/',
            }).toString(),
            headers: {
              Authorization: `Bearer ${tokenJson.access_token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
          mock(db),
        )
        expect(logoutRes.status).toBe(400)
        expect(await logoutRes.text()).toBe(localeConfig.Error.WrongRefreshToken)

        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = true as unknown as string
      },
    )
  },
)
