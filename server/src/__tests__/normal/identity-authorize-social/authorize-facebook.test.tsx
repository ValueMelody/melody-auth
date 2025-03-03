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
  localeConfig, routeConfig,
} from 'configs'
import { userModel } from 'models'
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
  'post /authorize-facebook',
  () => {
    const mockFbFetch = vi.fn(async (url) => {
      if (url === 'https://graph.facebook.com/oauth/access_token?client_id=123&client_secret=abc&grant_type=client_credentials') {
        return Promise.resolve({
          ok: true,
          json: () => ({ access_token: 'token123' }),
        })
      } else if (url === 'https://graph.facebook.com/debug_token?input_token=aaa&access_token=token123') {
        return Promise.resolve({
          ok: true,
          json: () => ({
            data: {
              is_valid: true,
              user_id: 'fb001',
            },
          }),
        })
      } else if (url === 'https://graph.facebook.com/v20.0/fb001?access_token=token123') {
        return Promise.resolve({
          ok: true,
          json: () => ({
            name: 'first  last',
            id: 'fb001',
          }),
        })
      }
      return Promise.resolve({ ok: false })
    })

    const prepareRequest = async () => {
      global.fetch = mockFbFetch as Mock
      const credential = 'aaa'

      const appRecord = await getApp(db)
      const res = await app.request(
        routeConfig.IdentityRoute.AuthorizeFacebook,
        {
          method: 'POST',
          body: JSON.stringify({
            ...(await postAuthorizeBody(appRecord)),
            credential,
          }),
        },
        mock(db),
      )
      global.fetch = mockFbFetch as Mock
      return res
    }

    const postFacebookRequest = async () => {
      const res = await prepareRequest()

      const users = await db.prepare('select * from "user"').all() as userModel.Raw[]
      expect(users.length).toBe(1)
      expect(users[0].socialAccountId).toBe('fb001')
      expect(users[0].socialAccountType).toBe(userModel.SocialAccountType.Facebook)
      expect(users[0].email).toBe(null)
      expect(users[0].firstName).toBe('first')
      expect(users[0].lastName).toBe('last')
      expect(users[0].emailVerified).toBe(0)
      expect(await res.json()).toStrictEqual({
        code: expect.any(String),
        redirectUri: 'http://localhost:3000/en/dashboard',
        state: '123',
        scopes: ['profile', 'openid', 'offline_access'],
        nextPage: routeConfig.IdentityRoute.AuthorizeConsent,
      })
    }

    test(
      'should sign in with a new facebook account',
      async () => {
        global.process.env.FACEBOOK_AUTH_CLIENT_ID = '123'
        global.process.env.FACEBOOK_AUTH_CLIENT_SECRET = 'abc'
        await postFacebookRequest()
        global.process.env.FACEBOOK_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'should be blocked if not enable in config',
      async () => {
        const res = await prepareRequest()
        expect(res.status).toBe(400)
      },
    )

    test(
      'should be blocked if no secret provided in config',
      async () => {
        global.process.env.FACEBOOK_AUTH_CLIENT_ID = '123'
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        global.process.env.FACEBOOK_AUTH_CLIENT_ID = ''
      },
    )

    test(
      'should be blocked if no id provided in config',
      async () => {
        global.process.env.FACEBOOK_AUTH_CLIENT_SECRET = 'abv'
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        global.process.env.FACEBOOK_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'could throw error if wrong credential provided',
      async () => {
        global.process.env.FACEBOOK_AUTH_CLIENT_ID = '123'
        global.process.env.FACEBOOK_AUTH_CLIENT_SECRET = 'abc'

        global.fetch = mockFbFetch as Mock
        const credential = 'aab'

        const appRecord = await getApp(db)
        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeFacebook,
          {
            method: 'POST',
            body: JSON.stringify({
              ...(await postAuthorizeBody(appRecord)),
              credential,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(localeConfig.Error.NoUser)
        global.fetch = fetchMock
        global.process.env.FACEBOOK_AUTH_CLIENT_ID = ''
        global.process.env.FACEBOOK_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'should sign in with an existing facebook account',
      async () => {
        global.process.env.FACEBOOK_AUTH_CLIENT_ID = '123'
        global.process.env.FACEBOOK_AUTH_CLIENT_SECRET = 'abc'
        await postFacebookRequest()
        await postFacebookRequest()
        global.process.env.FACEBOOK_AUTH_CLIENT_ID = ''
        global.process.env.FACEBOOK_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'should throw error if user is not active',
      async () => {
        global.process.env.FACEBOOK_AUTH_CLIENT_ID = '123'
        global.process.env.FACEBOOK_AUTH_CLIENT_SECRET = 'abc'
        await postFacebookRequest()
        await disableUser(db)
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.UserDisabled)
        global.process.env.FACEBOOK_AUTH_CLIENT_ID = ''
        global.process.env.FACEBOOK_AUTH_CLIENT_SECRET = ''
      },
    )
  },
)
