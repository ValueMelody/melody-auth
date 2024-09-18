import {
  afterEach, beforeEach, describe, expect, Mock, test,
  vi,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { sign } from 'hono/jwt'
import { Context } from 'hono'
import app from 'index'
import {
  fetchMock,
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  adapterConfig, localeConfig, routeConfig,
  typeConfig,
} from 'configs'
import {
  userModel,
} from 'models'
import { oauthDto } from 'dtos'
import {
  disableUser,
} from 'tests/util'
import { cryptoUtil } from 'utils'
import { jwtService } from 'services'
import { getApp, postAuthorizeBody } from 'tests/identity'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const BaseRoute = routeConfig.InternalRoute.Identity

describe(
  'post /authorize-google',
  () => {
    const prepareRequest = async (emailVerified: boolean) => {
      const publicKey = await mockedKV.get(adapterConfig.BaseKVKey.JwtPublicSecret)
      const jwk = await cryptoUtil.secretToJwk(publicKey ?? '')
      const c = { env: { KV: mockedKV } } as unknown as Context<typeConfig.Context>
      const credential = await jwtService.signWithKid(
        c,
        {
          iss: 'https://accounts.google.com',
          email: 'test@gmail.com',
          sub: 'gid123',
          email_verified: emailVerified,
          given_name: 'first',
          family_name: 'last',
          kid: jwk.kid,
        },
      )

      const appRecord = await getApp(db)
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

      const users = await db.prepare('select * from "user"').all() as userModel.Raw[]
      expect(users.length).toBe(1)
      expect(users[0].socialAccountId).toBe('gid123')
      expect(users[0].socialAccountType).toBe(userModel.SocialAccountType.Google)
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
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '123'
        await postGoogleRequest(true)
        global.process.env.GOOGLE_AUTH_CLIENT_ID = ''
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

        const appRecord = await getApp(db)
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
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '123'
        const c = { env: { KV: mockedKV } } as unknown as Context<typeConfig.Context>
        const credential = await jwtService.signWithKid(
          c,
          {
            iss: 'https://accounts.any.com',
            email: 'test@gmail.com',
            sub: 'gid123',
            email_verified: true,
            given_name: 'first',
            family_name: 'last',
          },
        )

        const appRecord = await getApp(db)
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
        global.process.env.GOOGLE_AUTH_CLIENT_ID = ''
      },
    )

    test(
      'should sign in with an existing google account',
      async () => {
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '123'
        await postGoogleRequest(true)
        await postGoogleRequest(true)
        global.process.env.GOOGLE_AUTH_CLIENT_ID = ''
      },
    )

    test(
      'should throw error if user is not active',
      async () => {
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '123'
        await postGoogleRequest(true)
        await disableUser(db)
        const res = await prepareRequest(true)
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.UserDisabled)
        global.process.env.GOOGLE_AUTH_CLIENT_ID = ''
      },
    )

    test(
      'should sign in with an existing google account and update verify info',
      async () => {
        global.process.env.GOOGLE_AUTH_CLIENT_ID = '123'
        await postGoogleRequest(false)
        await postGoogleRequest(true)
        await postGoogleRequest(false)
        global.process.env.GOOGLE_AUTH_CLIENT_ID = ''
      },
    )
  },
)

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
        `${BaseRoute}/authorize-facebook`,
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
        requireConsent: true,
        requireMfaEnroll: false,
        requireEmailMfa: false,
        requireOtpSetup: false,
        requireOtpMfa: false,
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
          `${BaseRoute}/authorize-facebook`,
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

describe(
  'get /authorize-github',
  () => {
    const mockGithubFetch = vi.fn(async (
      url, params,
    ) => {
      if (url === 'https://github.com/login/oauth/access_token' && params.body.includes('aaa')) {
        return Promise.resolve({
          ok: true,
          json: () => ({ access_token: 'token123' }),
        })
      } else if (url === 'https://api.github.com/user') {
        return Promise.resolve({
          ok: true,
          json: () => ({
            name: 'first last',
            id: 'github001',
            email: 'test-github@email.com',
          }),
        })
      }
      return Promise.resolve({ ok: false })
    })

    const prepareRequest = async (cred?: string) => {
      global.fetch = mockGithubFetch as Mock
      const credential = cred ?? 'aaa'

      const appRecord = await getApp(db)
      const requestBody = await postAuthorizeBody(appRecord)
      const state = JSON.stringify(new oauthDto.GetAuthorizeReqDto({
        ...requestBody,
        scopes: requestBody.scope.split(' ') ?? [],
        locale: 'en',
      }))
      const res = await app.request(
        `${BaseRoute}/authorize-github?code=${credential}&state=${encodeURIComponent(state)}`,
        {},
        mock(db),
      )
      global.fetch = fetchMock
      return res
    }

    const getGitHubRequest = async () => {
      const res = await prepareRequest()
      expect(res.status).toBe(302)

      const users = await db.prepare('select * from "user"').all() as userModel.Raw[]
      expect(users.length).toBe(1)
      expect(users[0].socialAccountId).toBe('github001')
      expect(users[0].socialAccountType).toBe(userModel.SocialAccountType.GitHub)
      expect(users[0].email).toBe('test-github@email.com')
      expect(users[0].firstName).toBe('first')
      expect(users[0].lastName).toBe('last')
      expect(users[0].emailVerified).toBe(0)

      return res
    }

    test(
      'should redirect to consent with a new GitHub account',
      async () => {
        global.process.env.GITHUB_AUTH_CLIENT_ID = '123'
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = 'abc'
        global.process.env.GITHUB_AUTH_APP_NAME = 'app'
        const res = await getGitHubRequest()
        expect(res.headers.get('Location')).toContain('/identity/v1/authorize-consent?state=123&code=')
        expect(res.headers.get('Location')).toContain('&locale=en&redirect_uri=http://localhost:3000/en/dashboard')

        global.process.env.GITHUB_AUTH_CLIENT_ID = ''
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = ''
        global.process.env.GITHUB_AUTH_APP_NAME = ''
      },
    )

    test(
      'should redirect back to app with a new GitHub account when consent not need',
      async () => {
        global.process.env.GITHUB_AUTH_CLIENT_ID = '123'
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = 'abc'
        global.process.env.GITHUB_AUTH_APP_NAME = 'app'
        global.process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        const res = await getGitHubRequest()
        expect(res.headers.get('Location')).toContain('http://localhost:3000/en/dashboard?state=123&code=')
        expect(res.headers.get('Location')).toContain('&locale=en')

        global.process.env.GITHUB_AUTH_CLIENT_ID = ''
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = ''
        global.process.env.GITHUB_AUTH_APP_NAME = ''
        global.process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
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
        global.process.env.GITHUB_AUTH_CLIENT_ID = '123'
        global.process.env.GITHUB_AUTH_APP_NAME = 'app'
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        global.process.env.GITHUB_AUTH_CLIENT_ID = ''
        global.process.env.GITHUB_AUTH_APP_NAME = ''
      },
    )

    test(
      'should be blocked if no id provided in config',
      async () => {
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = 'abc'
        global.process.env.GITHUB_AUTH_APP_NAME = 'app'
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = ''
        global.process.env.GITHUB_AUTH_APP_NAME = ''
      },
    )

    test(
      'should be blocked if no app name provided in config',
      async () => {
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = 'abc'
        global.process.env.GITHUB_AUTH_CLIENT_ID = '123'
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = ''
        global.process.env.GITHUB_AUTH_APP_NAME = ''
      },
    )

    test(
      'could throw error if wrong credential provided',
      async () => {
        global.process.env.GITHUB_AUTH_CLIENT_ID = '123'
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = 'abc'
        global.process.env.GITHUB_AUTH_APP_NAME = 'app'

        const credential = 'aab'
        const res = await prepareRequest(credential)
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(localeConfig.Error.NoUser)
        global.process.env.GITHUB_AUTH_CLIENT_ID = ''
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = ''
        global.process.env.GITHUB_AUTH_APP_NAME = ''
      },
    )

    test(
      'should sign in with an existing github account',
      async () => {
        global.process.env.GITHUB_AUTH_CLIENT_ID = '123'
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = 'abc'
        global.process.env.GITHUB_AUTH_APP_NAME = 'app'
        const res = await getGitHubRequest()
        expect(res.headers.get('Location')).toContain('/identity/v1/authorize-consent?state=123&code=')
        expect(res.headers.get('Location')).toContain('&locale=en&redirect_uri=http://localhost:3000/en/dashboard')

        const res1 = await getGitHubRequest()
        expect(res.headers.get('Location')).toContain('/identity/v1/authorize-consent?state=123&code=')
        expect(res1.headers.get('Location')).toContain('&locale=en&redirect_uri=http://localhost:3000/en/dashboard')

        global.process.env.GITHUB_AUTH_CLIENT_ID = ''
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = ''
        global.process.env.GITHUB_AUTH_APP_NAME = ''
      },
    )

    test(
      'should throw error if user is not active',
      async () => {
        global.process.env.GITHUB_AUTH_CLIENT_ID = '123'
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = 'abc'
        global.process.env.GITHUB_AUTH_APP_NAME = 'app'
        await getGitHubRequest()
        await disableUser(db)
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.UserDisabled)
        global.process.env.GITHUB_AUTH_CLIENT_ID = ''
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = ''
        global.process.env.GITHUB_AUTH_APP_NAME = ''
      },
    )
  },
)
