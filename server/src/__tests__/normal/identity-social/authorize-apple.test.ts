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
  messageConfig, routeConfig,
} from 'configs'
import { userModel } from 'models'
import { oauthDto } from 'dtos'
import { disableUser } from 'tests/util'
import {
  getApp, postAuthorizeBody,
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
  'get /authorize-apple',
  () => {
    const mockAppleFetch = vi.fn(async (
      url, params,
    ) => {
      if (url === 'https://appleid.apple.com/auth/token' && params.body.get('code') === 'aaa') {
        return Promise.resolve({
          ok: true,
          json: () => ({ id_token: 'eyJhbGciOiJIUzI1NiIsImtpZCI6IjVHNUJUVlZBU1YifQ.eyJzdWIiOiJhcHBsZS0xMjMiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20ifQ.2Un74pjNwWCSvA5aROWfqjISLaLQn1-IGHH0xU2cvYY' }),
        })
      }
      return Promise.resolve({ ok: false })
    })

    const prepareRequest = async (cred?: string) => {
      global.fetch = mockAppleFetch as Mock
      const credential = cred ?? 'aaa'

      const appRecord = await getApp(db)
      const requestBody = await postAuthorizeBody(appRecord)
      const state = JSON.stringify(new oauthDto.GetAuthorizeDto({
        ...requestBody,
        scopes: requestBody.scope.split(' ') ?? [],
        locale: 'en',
      }))

      const params = new URLSearchParams()
      params.append(
        'code',
        credential,
      )
      params.append(
        'state',
        state,
      )

      const res = await app.request(
        `${routeConfig.IdentityRoute.AuthorizeApple}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params,
        },
        mock(db),
      )
      global.fetch = fetchMock
      return res
    }

    const getAppleRequest = async () => {
      const res = await prepareRequest()
      expect(res.status).toBe(302)

      const users = await db.prepare('select * from "user"').all() as userModel.Raw[]
      expect(users.length).toBe(1)
      expect(users[0].socialAccountId).toBe('apple-123')
      expect(users[0].socialAccountType).toBe(userModel.SocialAccountType.Apple)
      expect(users[0].email).toBe('test@test.com')
      expect(users[0].firstName).toBe(null)
      expect(users[0].lastName).toBe(null)
      expect(users[0].emailVerified).toBe(0)

      return res
    }

    test(
      'should redirect to consent with a new Apple account',
      async () => {
        global.process.env.APPLE_AUTH_CLIENT_ID = '123'
        global.process.env.APPLE_AUTH_CLIENT_SECRET = 'abc'
        const res = await getAppleRequest()
        expect(res.headers.get('Location')).toContain(`${routeConfig.IdentityRoute.ProcessView}?state=123&code=`)
        expect(res.headers.get('Location')).toContain('&step=consent')
        expect(res.headers.get('Location')).toContain('&locale=en&redirect_uri=http://localhost:3000/en/dashboard')

        global.process.env.APPLE_AUTH_CLIENT_ID = ''
        global.process.env.APPLE_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'should throw error if no code provided',
      async () => {
        global.process.env.APPLE_AUTH_CLIENT_ID = '123'
        global.process.env.APPLE_AUTH_CLIENT_SECRET = 'abc'

        const appRecord = await getApp(db)
        const requestBody = await postAuthorizeBody(appRecord)
        const state = JSON.stringify(new oauthDto.GetAuthorizeDto({
          ...requestBody,
          scopes: requestBody.scope.split(' ') ?? [],
          locale: 'en',
        }))

        const params = new URLSearchParams()
        params.append(
          'state',
          state,
        )

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeApple}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
          },
          mock(db),
        )

        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidAppleAuthorizeRequest)

        global.process.env.APPLE_AUTH_CLIENT_ID = ''
        global.process.env.APPLE_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'should throw error if no state provided',
      async () => {
        global.process.env.APPLE_AUTH_CLIENT_ID = '123'
        global.process.env.APPLE_AUTH_CLIENT_SECRET = 'abc'

        const params = new URLSearchParams()
        params.append(
          'code',
          'aaa',
        )

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeApple}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params,
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidAppleAuthorizeRequest)

        global.process.env.APPLE_AUTH_CLIENT_ID = ''
        global.process.env.APPLE_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'should redirect back to app with a new Apple account when consent not need',
      async () => {
        global.process.env.APPLE_AUTH_CLIENT_ID = '123'
        global.process.env.APPLE_AUTH_CLIENT_SECRET = 'abc'
        global.process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        const res = await getAppleRequest()
        expect(res.headers.get('Location')).toContain('http://localhost:3000/en/dashboard?state=123&code=')
        expect(res.headers.get('Location')).toContain('&locale=en')

        global.process.env.APPLE_AUTH_CLIENT_ID = ''
        global.process.env.APPLE_AUTH_CLIENT_SECRET = ''
        global.process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should be blocked if not enable in config',
      async () => {
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.AppleSignInNotEnabled)
      },
    )

    test(
      'should be blocked if no secret provided in config',
      async () => {
        global.process.env.APPLE_AUTH_CLIENT_ID = '123'
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.AppleSignInNotEnabled)
        global.process.env.APPLE_AUTH_CLIENT_ID = ''
      },
    )

    test(
      'should be blocked if no id provided in config',
      async () => {
        global.process.env.APPLE_AUTH_CLIENT_SECRET = 'abc'
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.AppleSignInNotEnabled)
        global.process.env.APPLE_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'could throw error if wrong credential provided',
      async () => {
        global.process.env.APPLE_AUTH_CLIENT_ID = '123'
        global.process.env.APPLE_AUTH_CLIENT_SECRET = 'abc'

        const credential = 'aab'
        const res = await prepareRequest(credential)
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoAppleUser)
        global.process.env.APPLE_AUTH_CLIENT_ID = ''
        global.process.env.APPLE_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'should sign in with an existing apple account',
      async () => {
        global.process.env.APPLE_AUTH_CLIENT_ID = '123'
        global.process.env.APPLE_AUTH_CLIENT_SECRET = 'abc'
        const res = await getAppleRequest()
        expect(res.headers.get('Location')).toContain(`${routeConfig.IdentityRoute.ProcessView}?state=123&code=`)
        expect(res.headers.get('Location')).toContain('&step=consent')
        expect(res.headers.get('Location')).toContain('&locale=en&redirect_uri=http://localhost:3000/en/dashboard')

        const res1 = await getAppleRequest()
        expect(res1.headers.get('Location')).toContain(`${routeConfig.IdentityRoute.ProcessView}?state=123&code=`)
        expect(res1.headers.get('Location')).toContain('&step=consent')
        expect(res1.headers.get('Location')).toContain('&locale=en&redirect_uri=http://localhost:3000/en/dashboard')

        global.process.env.APPLE_AUTH_CLIENT_ID = ''
        global.process.env.APPLE_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'should throw error if user is not active',
      async () => {
        global.process.env.APPLE_AUTH_CLIENT_ID = '123'
        global.process.env.APPLE_AUTH_CLIENT_SECRET = 'abc'
        await getAppleRequest()
        await disableUser(db)
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.UserDisabled)
        global.process.env.APPLE_AUTH_CLIENT_ID = ''
        global.process.env.APPLE_AUTH_CLIENT_SECRET = ''
      },
    )
  },
)
