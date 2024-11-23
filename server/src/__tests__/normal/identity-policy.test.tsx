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
      'should redirect if use wrong auth code',
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
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=en`)
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
      'should redirect if use wrong auth code',
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
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=en`)
      },
    )
  },
)
