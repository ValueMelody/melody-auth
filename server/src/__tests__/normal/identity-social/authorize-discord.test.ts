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
  'get /authorize-discord',
  () => {
    const mockDiscordFetch = vi.fn(async (
      url, params,
    ) => {
      if (url === 'https://discord.com/api/v10/oauth2/token' && params.body.get('code') === 'aaa') {
        return Promise.resolve({
          ok: true,
          json: () => ({ access_token: 'token123' }),
        })
      } else if (url === 'https://discord.com/api/v10/users/@me') {
        return Promise.resolve({
          ok: true,
          json: () => ({
            username: 'first last',
            id: 'discord001',
          }),
        })
      }
      return Promise.resolve({ ok: false })
    })

    const prepareRequest = async (cred?: string) => {
      global.fetch = mockDiscordFetch as Mock
      const credential = cred ?? 'aaa'

      const appRecord = await getApp(db)
      const requestBody = await postAuthorizeBody(appRecord)
      const state = JSON.stringify(new oauthDto.GetAuthorizeDto({
        ...requestBody,
        scopes: requestBody.scope.split(' ') ?? [],
        locale: 'en',
      }))
      const res = await app.request(
        `${routeConfig.IdentityRoute.AuthorizeDiscord}?code=${credential}&state=${encodeURIComponent(state)}`,
        {},
        mock(db),
      )
      global.fetch = fetchMock
      return res
    }

    const getDiscordRequest = async () => {
      const res = await prepareRequest()
      expect(res.status).toBe(302)

      const users = await db.prepare('select * from "user"').all() as userModel.Raw[]
      expect(users.length).toBe(1)
      expect(users[0].socialAccountId).toBe('discord001')
      expect(users[0].socialAccountType).toBe(userModel.SocialAccountType.Discord)
      expect(users[0].email).toBe(null)
      expect(users[0].firstName).toBe('first')
      expect(users[0].lastName).toBe('last')
      expect(users[0].emailVerified).toBe(0)

      return res
    }

    test(
      'should redirect to consent with a new Discord account',
      async () => {
        global.process.env.DISCORD_AUTH_CLIENT_ID = '123'
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = 'abc'
        const res = await getDiscordRequest()
        expect(res.headers.get('Location')).toContain(`${routeConfig.IdentityRoute.ProcessView}?state=123&code=`)
        expect(res.headers.get('Location')).toContain('&step=consent')
        expect(res.headers.get('Location')).toContain('&locale=en&redirect_uri=http://localhost:3000/en/dashboard')

        global.process.env.DISCORD_AUTH_CLIENT_ID = ''
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'could load user email if exists',
      async () => {
        global.process.env.DISCORD_AUTH_CLIENT_ID = '123'
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = 'abc'

        const mockDiscordFetchWithEmail = vi.fn(async (
          url, params,
        ) => {
          if (url === 'https://discord.com/api/v10/oauth2/token' && params.body.get('code') === 'aaa') {
            return Promise.resolve({
              ok: true,
              json: () => ({ access_token: 'token123' }),
            })
          } else if (url === 'https://discord.com/api/v10/users/@me') {
            return Promise.resolve({
              ok: true,
              json: () => ({
                username: 'first last',
                id: 'discord001',
                email: 'test@test.com',
                verified: true,
              }),
            })
          }
          return Promise.resolve({ ok: false })
        })

        global.fetch = mockDiscordFetchWithEmail as Mock

        const appRecord = await getApp(db)
        const requestBody = await postAuthorizeBody(appRecord)
        const state = JSON.stringify(new oauthDto.GetAuthorizeDto({
          ...requestBody,
          scopes: requestBody.scope.split(' ') ?? [],
          locale: 'en',
        }))
        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeDiscord}?code=aaa&state=${encodeURIComponent(state)}`,
          {},
          mock(db),
        )
        global.fetch = fetchMock

        expect(res.status).toBe(302)

        const users = await db.prepare('select * from "user"').all() as userModel.Raw[]
        expect(users.length).toBe(1)
        expect(users[0].socialAccountId).toBe('discord001')
        expect(users[0].socialAccountType).toBe(userModel.SocialAccountType.Discord)
        expect(users[0].email).toBe('test@test.com')
        expect(users[0].firstName).toBe('first')
        expect(users[0].lastName).toBe('last')
        expect(users[0].emailVerified).toBe(1)

        expect(res.headers.get('Location')).toContain(`${routeConfig.IdentityRoute.ProcessView}?state=123&code=`)
        expect(res.headers.get('Location')).toContain('&step=consent')
        expect(res.headers.get('Location')).toContain('&locale=en&redirect_uri=http://localhost:3000/en/dashboard')

        global.process.env.DISCORD_AUTH_CLIENT_ID = ''
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'should throw error if no code provided',
      async () => {
        global.process.env.DISCORD_AUTH_CLIENT_ID = '123'
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = 'abc'

        const appRecord = await getApp(db)
        const requestBody = await postAuthorizeBody(appRecord)
        const state = JSON.stringify(new oauthDto.GetAuthorizeDto({
          ...requestBody,
          scopes: requestBody.scope.split(' ') ?? [],
          locale: 'en',
        }))
        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeDiscord}?state=${encodeURIComponent(state)}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidDiscordAuthorizeRequest)

        global.process.env.DISCORD_AUTH_CLIENT_ID = ''
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'should throw error if no state provided',
      async () => {
        global.process.env.DISCORD_AUTH_CLIENT_ID = '123'
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = 'abc'

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeDiscord}?code=aaa`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidDiscordAuthorizeRequest)

        global.process.env.DISCORD_AUTH_CLIENT_ID = ''
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'should redirect back to app with a new Discord account when consent not need',
      async () => {
        global.process.env.DISCORD_AUTH_CLIENT_ID = '123'
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = 'abc'
        global.process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        const res = await getDiscordRequest()
        expect(res.headers.get('Location')).toContain('http://localhost:3000/en/dashboard?state=123&code=')
        expect(res.headers.get('Location')).toContain('&locale=en')

        global.process.env.DISCORD_AUTH_CLIENT_ID = ''
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = ''
        global.process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should be blocked if not enable in config',
      async () => {
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.DiscordSignInNotEnabled)
      },
    )

    test(
      'should be blocked if no secret provided in config',
      async () => {
        global.process.env.DISCORD_AUTH_CLIENT_ID = '123'
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.DiscordSignInNotEnabled)
        global.process.env.DISCORD_AUTH_CLIENT_ID = ''
      },
    )

    test(
      'should be blocked if no id provided in config',
      async () => {
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = 'abc'
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.DiscordSignInNotEnabled)
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'could throw error if wrong credential provided',
      async () => {
        global.process.env.DISCORD_AUTH_CLIENT_ID = '123'
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = 'abc'

        const credential = 'aab'
        const res = await prepareRequest(credential)
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoDiscordUser)
        global.process.env.DISCORD_AUTH_CLIENT_ID = ''
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'should sign in with an existing discord account',
      async () => {
        global.process.env.DISCORD_AUTH_CLIENT_ID = '123'
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = 'abc'
        const res = await getDiscordRequest()
        expect(res.headers.get('Location')).toContain(`${routeConfig.IdentityRoute.ProcessView}?state=123&code=`)
        expect(res.headers.get('Location')).toContain('&step=consent')
        expect(res.headers.get('Location')).toContain('&locale=en&redirect_uri=http://localhost:3000/en/dashboard')

        const res1 = await getDiscordRequest()
        expect(res1.headers.get('Location')).toContain(`${routeConfig.IdentityRoute.ProcessView}?state=123&code=`)
        expect(res1.headers.get('Location')).toContain('&step=consent')
        expect(res1.headers.get('Location')).toContain('&locale=en&redirect_uri=http://localhost:3000/en/dashboard')

        global.process.env.DISCORD_AUTH_CLIENT_ID = ''
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = ''
      },
    )

    test(
      'should throw error if user is not active',
      async () => {
        global.process.env.DISCORD_AUTH_CLIENT_ID = '123'
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = 'abc'
        await getDiscordRequest()
        await disableUser(db)
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.UserDisabled)
        global.process.env.DISCORD_AUTH_CLIENT_ID = ''
        global.process.env.DISCORD_AUTH_CLIENT_SECRET = ''
      },
    )
  },
)
