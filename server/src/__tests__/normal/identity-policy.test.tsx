import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { JSDOM } from 'jsdom'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import { routeConfig } from 'configs'
import {
  prepareFollowUpBody, prepareFollowUpParams,
  insertUsers, postSignInRequest, getApp,
} from 'tests/identity'

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
  'post /authorize-consent',
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
          requireConsent: true,
          requireMfaEnroll: true,
          requireEmailMfa: false,
          requireSmsMfa: false,
          requireOtpSetup: false,
          requireOtpMfa: false,
          requireChangePassword: false,
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
