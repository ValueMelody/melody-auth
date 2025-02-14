import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { JSDOM } from 'jsdom'
import { Context } from 'hono'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
  passkeyEnrollMock,
} from 'tests/mock'
import {
  adapterConfig, localeConfig, routeConfig,
  typeConfig,
} from 'configs'
import {
  prepareFollowUpBody, prepareFollowUpParams,
  insertUsers, postSignInRequest, getApp,
  postAuthorizeBody,
} from 'tests/identity'
import { jwtService } from 'services'
import { cryptoUtil } from 'utils'
import {
  enrollEmailMfa, enrollOtpMfa, enrollSmsMfa,
} from 'tests/util'
import { enrollPasskey } from '__tests__/normal/identity-passkey.test'
import { userModel } from 'models'
import { Policy } from 'dtos/oauth'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

describe(
  'get /change-password',
  () => {
    test(
      'should show change password page',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ChangePassword}${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByName('password').length).toBe(1)
        expect(document.getElementsByName('confirmPassword').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)
        expect(document.getElementsByTagName('select').length).toBe(1)
      },
    )

    test(
      'should redirect if use wrong auth code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ChangePassword}?locale=en&code=abc`,
          {},
          mock(db),
        )
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=en`)
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        global.process.env.ENABLE_PASSWORD_RESET = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ChangePassword}?locale=en&code=abc`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.ENABLE_PASSWORD_RESET = true as unknown as string
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        global.process.env.BLOCKED_POLICIES = [Policy.ChangePassword] as unknown as string
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ChangePassword}?locale=en&code=abc`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
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
          `${routeConfig.IdentityRoute.ChangePassword}${params}`,
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
  'post /change-password',
  () => {
    test(
      'should change password',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ChangePassword,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              password: 'Password2!',
            }),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const appRecord = await getApp(db)
        const reLoginRes = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        const loginResJson = await reLoginRes.json() as { code: string }
        expect(loginResJson).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.IdentityRoute.AuthorizeConsent,
        })
      },
    )

    test(
      'should throw 400 if use wrong auth code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ChangePassword,
          {
            method: 'POST',
            body: JSON.stringify({
              locale: 'en',
              code: 'abc',
              password: 'Password2!',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        global.process.env.ENABLE_PASSWORD_RESET = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ChangePassword,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              password: 'Password2!',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.ENABLE_PASSWORD_RESET = true as unknown as string
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        global.process.env.BLOCKED_POLICIES = [Policy.ChangePassword] as unknown as string
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ChangePassword,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              password: 'Password2!',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
      },
    )
  },
)

describe(
  'get /change-email',
  () => {
    test(
      'should show change email page',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ChangeEmail}${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByName('email').length).toBe(1)
        expect(document.getElementsByName('code').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)
        expect(document.getElementsByTagName('select').length).toBe(1)
      },
    )

    test(
      'should redirect if use wrong auth code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ChangeEmail}?locale=en&code=abc`,
          {},
          mock(db),
        )
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=en`)
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        global.process.env.ENABLE_EMAIL_VERIFICATION = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ChangeEmail}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.ENABLE_EMAIL_VERIFICATION = true as unknown as string
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeEmail] as unknown as string
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ChangeEmail}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
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
          `${routeConfig.IdentityRoute.ChangeEmail}${params}`,
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
  'post /change-email-code',
  () => {
    const sendEmailCode = async (code: string) => {
      return app.request(
        routeConfig.IdentityRoute.ChangeEmailCode,
        {
          method: 'POST',
          body: JSON.stringify({
            code,
            email: 'test_new@email.com',
            locale: 'en',
          }),
        },
        mock(db),
      )
    }

    test(
      'could send code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await sendEmailCode(body.code)
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.ChangeEmailCode}-1-test_new@email.com`) ?? '').length).toBe(6)
      },
    )

    test(
      'should stop after reach threshold',
      async () => {
        global.process.env.CHANGE_EMAIL_EMAIL_THRESHOLD = 2 as unknown as string

        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await sendEmailCode(body.code)
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.ChangeEmailAttempts}-test@email.com`)).toBe('1')

        const res1 = await sendEmailCode(body.code)
        const json1 = await res1.json()
        expect(json1).toStrictEqual({ success: true })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.ChangeEmailAttempts}-test@email.com`)).toBe('2')

        const res2 = await sendEmailCode(body.code)
        expect(res2.status).toBe(400)

        global.process.env.CHANGE_EMAIL_EMAIL_THRESHOLD = 0 as unknown as string
        const res3 = await sendEmailCode(body.code)
        expect(res3.status).toBe(200)
        const json3 = await res3.json()
        expect(json3).toStrictEqual({ success: true })

        global.process.env.CHANGE_EMAIL_EMAIL_THRESHOLD = 5 as unknown as string
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        global.process.env.ENABLE_EMAIL_VERIFICATION = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await sendEmailCode(body.code)
        expect(res.status).toBe(400)

        global.process.env.ENABLE_EMAIL_VERIFICATION = true as unknown as string
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeEmail] as unknown as string
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await sendEmailCode(body.code)
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
      },
    )

    test(
      'should throw error for social account',
      async () => {
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '123'
        const publicKey = await mockedKV.get(adapterConfig.BaseKVKey.JwtPublicSecret)
        const jwk = await cryptoUtil.secretToJwk(publicKey ?? '')
        const c = { env: { KV: mockedKV } } as unknown as Context<typeConfig.Context>
        const credential = await jwtService.signWithKid(
          c,
          {
            iss: 'https://accounts.google.com',
            email: 'test@gmail.com',
            sub: 'gid123',
            email_verified: true,
            given_name: 'first',
            family_name: 'last',
            kid: jwk.kid,
          },
        )

        const appRecord = await getApp(db)
        const tokenRes = await app.request(
          routeConfig.IdentityRoute.AuthorizeGoogle,
          {
            method: 'POST',
            body: JSON.stringify({
              ...(await postAuthorizeBody(appRecord)),
              credential,
            }),
          },
          mock(db),
        )
        const tokenJson = await tokenRes.json() as { code: string }

        const res = await sendEmailCode(tokenJson.code)
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.SocialAccountNotSupported)
        global.process.env.GOOGLE_AUTH_CLIENT_ID = ''
      },
    )
  },
)

describe(
  'post /change-email',
  () => {
    test(
      'could send code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        await app.request(
          routeConfig.IdentityRoute.ChangeEmailCode,
          {
            method: 'POST',
            body: JSON.stringify({
              code: body.code,
              email: 'test_new@email.com',
              locale: 'en',
            }),
          },
          mock(db),
        )
        const verificationCode = await mockedKV.get(`${adapterConfig.BaseKVKey.ChangeEmailCode}-1-test_new@email.com`)

        const res = await app.request(
          routeConfig.IdentityRoute.ChangeEmail,
          {
            method: 'POST',
            body: JSON.stringify({
              code: body.code,
              email: 'test_new@email.com',
              locale: 'en',
              verificationCode,
            }),
          },
          mock(db),
        )

        const resJson = await res.json()
        expect(resJson).toStrictEqual({ success: true })

        const appRecord = await getApp(db)
        const reLoginRes = await postSignInRequest(
          db,
          appRecord,
          { email: 'test_new@email.com' },
        )
        const loginResJson = await reLoginRes.json() as { code: string }
        expect(loginResJson).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.IdentityRoute.AuthorizeConsent,
        })
      },
    )

    test(
      'should throw 400 if use wrong auth code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ChangeEmail,
          {
            method: 'POST',
            body: JSON.stringify({
              locale: 'en',
              code: 'abc',
              email: 'test@email.com',
              verificationCode: '123456',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        global.process.env.ENABLE_EMAIL_VERIFICATION = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ChangeEmail,
          {
            method: 'POST',
            body: JSON.stringify({
              locale: 'en',
              code: body.code,
              email: 'test@email.com',
              verificationCode: '123456',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.ENABLE_EMAIL_VERIFICATION = true as unknown as string
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        global.process.env.BLOCKED_POLICIES = [Policy.ChangeEmail] as unknown as string
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ChangeEmail,
          {
            method: 'POST',
            body: JSON.stringify({
              locale: 'en',
              code: body.code,
              email: 'test@email.com',
              verificationCode: '123456',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
      },
    )
  },
)

describe(
  'get /reset-mfa',
  () => {
    test(
      'should show reset mfa page',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ResetMfa}${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('button').length).toBe(1)
        expect(document.getElementsByTagName('select').length).toBe(1)
      },
    )

    test(
      'should redirect if use wrong auth code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ResetMfa}?locale=en&code=abc`,
          {},
          mock(db),
        )
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=en`)
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        global.process.env.BLOCKED_POLICIES = [Policy.ResetMfa] as unknown as string
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ResetMfa}?locale=en&code=abc`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
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
          `${routeConfig.IdentityRoute.ChangePassword}${params}`,
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
  'post /reset-mfa',
  () => {
    test(
      'should reset email mfa',
      async () => {
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        enrollEmailMfa(db)
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ResetMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...body }),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const appRecord = await getApp(db)
        const reLoginRes = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password1!' },
        )
        const loginResJson = await reLoginRes.json() as { code: string }
        expect(loginResJson).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.IdentityRoute.AuthorizeMfaEnroll,
        })

        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should reset sms mfa',
      async () => {
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)
        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ResetMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...body }),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const appRecord = await getApp(db)
        const reLoginRes = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password1!' },
        )
        const loginResJson = await reLoginRes.json() as { code: string }
        expect(loginResJson).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.IdentityRoute.AuthorizeMfaEnroll,
        })

        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should reset otp mfa',
      async () => {
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ResetMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...body }),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const appRecord = await getApp(db)
        const reLoginRes = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password1!' },
        )
        const loginResJson = await reLoginRes.json() as { code: string }
        expect(loginResJson).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.IdentityRoute.AuthorizeMfaEnroll,
        })

        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error if use wrong auth code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ResetMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              locale: 'en',
              code: 'abc',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        global.process.env.BLOCKED_POLICIES = [Policy.ResetMfa] as unknown as string
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ResetMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...body }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
      },
    )
  },
)

describe(
  'get /manage-passkey',
  () => {
    test(
      'should show manage passkey page',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ManagePasskey}${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementById('no-passkey')?.classList).not.toContain('hidden')
        expect(document.getElementById('passkey')?.classList).toContain('hidden')
        expect(document.getElementsByTagName('button').length).toBe(2)
        expect(document.getElementsByTagName('select').length).toBe(1)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should show manage passkey page with current passkey',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await enrollPasskey(db)

        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ManagePasskey}${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementById('no-passkey')?.classList).toContain('hidden')
        expect(document.getElementById('passkey')?.classList).not.toContain('hidden')
        expect(document.getElementsByTagName('button').length).toBe(2)
        expect(document.getElementsByTagName('select').length).toBe(1)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ManagePasskey}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ManagePasskey] as unknown as string
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ManagePasskey}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should redirect if use wrong auth code',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ManagePasskey}?locale=en&code=abc`,
          {},
          mock(db),
        )
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=en`)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'could disable locale selector',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        global.process.env.ENABLE_LOCALE_SELECTOR = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ManagePasskey}${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByTagName('select').length).toBe(0)
        global.process.env.ENABLE_LOCALE_SELECTOR = true as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )
  },
)

describe(
  'post /manage-passkey',
  () => {
    test(
      'should enroll passkey',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await insertUsers(
          db,
          false,
        )

        await mockedKV.put(
          `${adapterConfig.BaseKVKey.PasskeyEnrollChallenge}-1`,
          'Gu09HnxTsc01smwaCtC6yHE0MEg_d-qKUSpKi5BbLgU',
        )

        const body = await prepareFollowUpBody(db)
        const res = await app.request(
          routeConfig.IdentityRoute.ManagePasskey,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              enrollInfo: passkeyEnrollMock,
            }),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          success: true,
          passkey: {
            credentialId: passkeyEnrollMock.id,
            counter: 0,
          },
        })

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if use wrong auth code',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ManagePasskey,
          {
            method: 'POST',
            body: JSON.stringify({
              locale: 'en',
              code: 'abc',
              enrollInfo: passkeyEnrollMock,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        await insertUsers(
          db,
          false,
        )

        await mockedKV.put(
          `${adapterConfig.BaseKVKey.PasskeyEnrollChallenge}-1`,
          'Gu09HnxTsc01smwaCtC6yHE0MEg_d-qKUSpKi5BbLgU',
        )

        const body = await prepareFollowUpBody(db)
        const res = await app.request(
          routeConfig.IdentityRoute.ManagePasskey,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              enrollInfo: passkeyEnrollMock,
            }),
          },
          mock(db),
        )

        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ManagePasskey] as unknown as string
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ManagePasskey,
          {
            method: 'POST',
            body: JSON.stringify({ ...body }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )
  },
)

describe(
  'delete /manage-passkey',
  () => {
    test(
      'should remove passkey',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await enrollPasskey(db)

        const body = await prepareFollowUpBody(db)
        const res = await app.request(
          routeConfig.IdentityRoute.ManagePasskey,
          {
            method: 'DELETE',
            body: JSON.stringify({ ...body }),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if use wrong auth code',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        const res = await app.request(
          routeConfig.IdentityRoute.ManagePasskey,
          {
            method: 'DELETE',
            body: JSON.stringify({
              locale: 'en',
              code: 'abc',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        await enrollPasskey(db)

        const body = await prepareFollowUpBody(db)
        const res = await app.request(
          routeConfig.IdentityRoute.ManagePasskey,
          {
            method: 'DELETE',
            body: JSON.stringify({ ...body }),
          },
          mock(db),
        )

        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ManagePasskey] as unknown as string
        await enrollPasskey(db)

        const body = await prepareFollowUpBody(db)
        const res = await app.request(
          routeConfig.IdentityRoute.ManagePasskey,
          {
            method: 'DELETE',
            body: JSON.stringify({ ...body }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )
  },
)

describe(
  'get /update-info',
  () => {
    test(
      'should show update info page',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.UpdateInfo}${params}`,
          {},
          mock(db),
        )

        const html = await res.text()
        const dom = new JSDOM(html)
        const document = dom.window.document
        expect(document.getElementsByName('firstName').length).toBe(1)
        expect(document.getElementsByName('lastName').length).toBe(1)
        expect(document.getElementsByTagName('form').length).toBe(1)
        expect(document.getElementsByTagName('select').length).toBe(1)
      },
    )

    test(
      'should redirect if use wrong auth code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.UpdateInfo}?locale=en&code=abc`,
          {},
          mock(db),
        )
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=en`)
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        global.process.env.ENABLE_NAMES = false as unknown as string
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.UpdateInfo,
          {
            method: 'POST',
            body: JSON.stringify({ ...body }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.ENABLE_NAMES = true as unknown as string
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        global.process.env.BLOCKED_POLICIES = [Policy.UpdateInfo] as unknown as string
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.UpdateInfo,
          {
            method: 'POST',
            body: JSON.stringify({ ...body }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
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
          `${routeConfig.IdentityRoute.UpdateInfo}${params}`,
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
  'post /update-info',
  () => {
    test(
      'should update info',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.UpdateInfo,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              firstName: 'John',
              lastName: 'Doe',
            }),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const user = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        expect(user.firstName).toBe('John')
        expect(user.lastName).toBe('Doe')
      },
    )

    test(
      'should throw 400 if use wrong auth code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.UpdateInfo,
          {
            method: 'POST',
            body: JSON.stringify({
              locale: 'en',
              code: 'abc',
              firstName: 'John',
              lastName: 'Doe',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)
      },
    )

    test(
      'should throw 401 if feature not enabled',
      async () => {
        global.process.env.ENABLE_NAMES = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.UpdateInfo,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              firstName: 'John',
              lastName: 'Doe',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.ENABLE_NAMES = true as unknown as string
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        global.process.env.BLOCKED_POLICIES = [Policy.UpdateInfo] as unknown as string
        await insertUsers(
          db,
          false,
        )
        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.UpdateInfo,
          {
            method: 'POST',
            body: JSON.stringify({ ...body }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
      },
    )
  },
)
