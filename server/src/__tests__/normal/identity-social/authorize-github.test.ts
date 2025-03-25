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
      const state = JSON.stringify(new oauthDto.GetAuthorizeDto({
        ...requestBody,
        scopes: requestBody.scope.split(' ') ?? [],
        locale: 'en',
      }))
      const res = await app.request(
        `${routeConfig.IdentityRoute.AuthorizeGitHub}?code=${credential}&state=${encodeURIComponent(state)}`,
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
        expect(res.headers.get('Location')).toContain(`${routeConfig.IdentityRoute.ProcessView}?state=123&code=`)
        expect(res.headers.get('Location')).toContain('&step=consent')
        expect(res.headers.get('Location')).toContain('&locale=en&redirect_uri=http://localhost:3000/en/dashboard')

        global.process.env.GITHUB_AUTH_CLIENT_ID = ''
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = ''
        global.process.env.GITHUB_AUTH_APP_NAME = ''
      },
    )

    test(
      'should throw error if no code provided',
      async () => {
        global.process.env.GITHUB_AUTH_CLIENT_ID = '123'
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = 'abc'
        global.process.env.GITHUB_AUTH_APP_NAME = 'app'

        const appRecord = await getApp(db)
        const requestBody = await postAuthorizeBody(appRecord)
        const state = JSON.stringify(new oauthDto.GetAuthorizeDto({
          ...requestBody,
          scopes: requestBody.scope.split(' ') ?? [],
          locale: 'en',
        }))
        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeGitHub}?state=${encodeURIComponent(state)}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidGithubAuthorizeRequest)

        global.process.env.GITHUB_AUTH_CLIENT_ID = ''
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = ''
        global.process.env.GITHUB_AUTH_APP_NAME = ''
      },
    )

    test(
      'should throw error if no state provided',
      async () => {
        global.process.env.GITHUB_AUTH_CLIENT_ID = '123'
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = 'abc'
        global.process.env.GITHUB_AUTH_APP_NAME = 'app'

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeGitHub}?code=aaa`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidGithubAuthorizeRequest)

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
        expect(await res.text()).toBe(messageConfig.RequestError.NoUser)
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
        expect(res.headers.get('Location')).toContain(`${routeConfig.IdentityRoute.ProcessView}?state=123&code=`)
        expect(res.headers.get('Location')).toContain('&step=consent')
        expect(res.headers.get('Location')).toContain('&locale=en&redirect_uri=http://localhost:3000/en/dashboard')

        const res1 = await getGitHubRequest()
        expect(res1.headers.get('Location')).toContain(`${routeConfig.IdentityRoute.ProcessView}?state=123&code=`)
        expect(res1.headers.get('Location')).toContain('&step=consent')
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
        expect(await res.text()).toBe(messageConfig.RequestError.UserDisabled)
        global.process.env.GITHUB_AUTH_CLIENT_ID = ''
        global.process.env.GITHUB_AUTH_CLIENT_SECRET = ''
        global.process.env.GITHUB_AUTH_APP_NAME = ''
      },
    )
  },
)
