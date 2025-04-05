import {
  afterEach, beforeEach, describe, expect, Mock, test,
  vi,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { Context } from 'hono'
import app from 'index'
import {
  fetchMock,
  migrate,
  mock,
  mockedKV,
} from 'tests/mock'
import {
  messageConfig, routeConfig, variableConfig, adapterConfig, typeConfig,
} from 'configs'
import { userModel } from 'models'
import {
  identityDto, oauthDto,
} from 'dtos'
import { disableUser } from 'tests/util'
import {
  getApp, postAuthorizeBody,
} from 'tests/identity'
import { GetAuthorizeOidcConfigsRes } from 'handlers/identity/social'
import { cryptoUtil } from 'utils'
import { jwtService } from 'services'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

describe(
  'get /authorize-oidc-configs',
  () => {
    test(
      'could get provider configs',
      async () => {
        process.env.OIDC_AUTH_PROVIDERS = ['Auth0'] as unknown as string
        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeOidcConfigs}`,
          {},
          mock(db),
        )
        const json = await res.json() as GetAuthorizeOidcConfigsRes
        expect(json).toStrictEqual({
          configs: [{
            name: 'Auth0',
            config: variableConfig.OIDCProviderConfigs.Auth0,
          }],
          codeVerifier: expect.any(String),
        })

        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OidcCodeVerifier}-${json.codeVerifier}`)).toBe('1')
        process.env.OIDC_AUTH_PROVIDERS = undefined as unknown as string
      },
    )

    test(
      'should throw error if no provider configs',
      async () => {
        const res = await app.request(`${routeConfig.IdentityRoute.AuthorizeOidcConfigs}`)
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.OidcProviderNotEnabled)
      },
    )
  },
)

describe(
  'get /authorize-oidc',
  () => {
    const prepareRequest = async ({
      cred,
      setCodeVerifierAsUndefined = false,
      clearCodeVerifier = false,
    }: {
      cred?: string;
      setCodeVerifierAsUndefined?: boolean;
      clearCodeVerifier?: boolean;
    } = {}) => {
      const publicKey = await mockedKV.get(adapterConfig.BaseKVKey.JwtPublicSecret)
      const jwk = await cryptoUtil.secretToJwk(publicKey ?? '')
      const c = { env: { KV: mockedKV } } as unknown as Context<typeConfig.Context>
      const idToken = await jwtService.signWithKid(
        c,
        {
          sub: '1234567890',
          kid: jwk.kid,
        },
      )

      const mockOidcFetch = vi.fn(async (
        url, params,
      ) => {
        if (url === variableConfig.OIDCProviderConfigs.Auth0.tokenEndpoint && params.body.includes('code=aaa')) {
          return Promise.resolve({
            ok: true,
            json: () => ({ id_token: idToken }),
          })
        } else if (url === variableConfig.OIDCProviderConfigs.Auth0.jwksEndpoint) {
          return Promise.resolve({
            ok: true,
            json: () => ({ keys: [jwk] }),
          })
        }
        return Promise.resolve({ ok: false })
      })

      global.fetch = mockOidcFetch as Mock
      const credential = cred ?? 'aaa'

      const appRecord = await getApp(db)
      const requestBody = await postAuthorizeBody(appRecord)

      if (!clearCodeVerifier) {
        await mockedKV.put(
          `${adapterConfig.BaseKVKey.OidcCodeVerifier}-abcd`,
          '1',
        )
      }

      const state = JSON.stringify(new identityDto.PostAuthorizeSocialSignInDto({
        ...requestBody,
        codeVerifier: setCodeVerifierAsUndefined ? undefined : 'abcd',
        credential: '',
        scopes: requestBody.scope.split(' ') ?? [],
        locale: 'en',
      }))
      const res = await app.request(
        `${routeConfig.IdentityRoute.AuthorizeOidc}/Auth0?code=${credential}&state=${encodeURIComponent(state)}`,
        {},
        mock(db),
      )
      global.fetch = fetchMock
      return res
    }

    const getOidcRequest = async (provider: string) => {
      const res = await prepareRequest()
      expect(res.status).toBe(302)

      const users = await db.prepare('select * from "user"').all() as userModel.Raw[]
      expect(users.length).toBe(1)
      expect(users[0].socialAccountId).toBe('1234567890')
      expect(users[0].socialAccountType).toBe(provider)
      expect(users[0].email).toBe(null)
      expect(users[0].firstName).toBe(null)
      expect(users[0].lastName).toBe(null)
      expect(users[0].emailVerified).toBe(0)

      return res
    }

    test(
      'should redirect to consent with a new OIDC account',
      async () => {
        global.process.env.OIDC_AUTH_PROVIDERS = ['Auth0'] as unknown as string
        const res = await getOidcRequest('Auth0')
        expect(res.headers.get('Location')).toContain(`${routeConfig.IdentityRoute.ProcessView}?state=123&code=`)
        expect(res.headers.get('Location')).toContain('&step=consent')
        expect(res.headers.get('Location')).toContain('&locale=en&redirect_uri=http://localhost:3000/en/dashboard')

        global.process.env.OIDC_AUTH_PROVIDERS = undefined as unknown as string
      },
    )

    test(
      'should throw error if no code provided',
      async () => {
        global.process.env.OIDC_AUTH_PROVIDERS = ['Auth0'] as unknown as string

        const appRecord = await getApp(db)
        const requestBody = await postAuthorizeBody(appRecord)
        const state = JSON.stringify(new oauthDto.GetAuthorizeDto({
          ...requestBody,
          scopes: requestBody.scope.split(' ') ?? [],
          locale: 'en',
        }))
        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeOidc}/Auth0?state=${encodeURIComponent(state)}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidOidcAuthorizeRequest)

        global.process.env.OIDC_AUTH_PROVIDERS = undefined as unknown as string
      },
    )

    test(
      'should throw error if no state provided',
      async () => {
        global.process.env.OIDC_AUTH_PROVIDERS = ['Auth0'] as unknown as string

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizeOidc}/Auth0?code=aaa`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidOidcAuthorizeRequest)

        global.process.env.OIDC_AUTH_PROVIDERS = undefined as unknown as string
      },
    )

    test(
      'should redirect back to app with a new OIDC account when consent not need',
      async () => {
        global.process.env.OIDC_AUTH_PROVIDERS = ['Auth0'] as unknown as string
        global.process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        const res = await getOidcRequest('Auth0')
        expect(res.headers.get('Location')).toContain('http://localhost:3000/en/dashboard?state=123&code=')
        expect(res.headers.get('Location')).toContain('&locale=en')

        global.process.env.OIDC_AUTH_PROVIDERS = undefined as unknown as string
        global.process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should be blocked if not enable in config',
      async () => {
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.OidcProviderNotEnabled)
      },
    )

    test(
      'should be blocked if no secret provided in config',
      async () => {
        global.process.env.OIDC_AUTH_PROVIDERS = ['azure'] as unknown as string
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidOidcAuthorizeRequest)
        global.process.env.OIDC_AUTH_PROVIDERS = undefined as unknown as string
      },
    )

    test(
      'could throw error if wrong credential provided',
      async () => {
        global.process.env.OIDC_AUTH_PROVIDERS = ['Auth0'] as unknown as string

        const credential = 'aab'
        const res = await prepareRequest({ cred: credential })
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoOidcUser)

        global.process.env.OIDC_AUTH_PROVIDERS = undefined as unknown as string
      },
    )

    test(
      'could throw error if no code_verifier exists in kv',
      async () => {
        global.process.env.OIDC_AUTH_PROVIDERS = ['Auth0'] as unknown as string

        const res = await prepareRequest({ clearCodeVerifier: true })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidOidcAuthorizeRequest)

        global.process.env.OIDC_AUTH_PROVIDERS = undefined as unknown as string
      },
    )

    test(
      'could throw error if no code_verifier provided',
      async () => {
        global.process.env.OIDC_AUTH_PROVIDERS = ['Auth0'] as unknown as string

        const res = await prepareRequest({ setCodeVerifierAsUndefined: true })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidOidcAuthorizeRequest)

        global.process.env.OIDC_AUTH_PROVIDERS = undefined as unknown as string
      },
    )

    test(
      'should sign in with an existing oidc account',
      async () => {
        global.process.env.OIDC_AUTH_PROVIDERS = ['Auth0'] as unknown as string
        const res = await getOidcRequest('Auth0')
        expect(res.headers.get('Location')).toContain(`${routeConfig.IdentityRoute.ProcessView}?state=123&code=`)
        expect(res.headers.get('Location')).toContain('&step=consent')
        expect(res.headers.get('Location')).toContain('&locale=en&redirect_uri=http://localhost:3000/en/dashboard')

        const res1 = await getOidcRequest('Auth0')
        expect(res1.headers.get('Location')).toContain(`${routeConfig.IdentityRoute.ProcessView}?state=123&code=`)
        expect(res1.headers.get('Location')).toContain('&step=consent')
        expect(res1.headers.get('Location')).toContain('&locale=en&redirect_uri=http://localhost:3000/en/dashboard')

        global.process.env.OIDC_AUTH_PROVIDERS = undefined as unknown as string
      },
    )

    test(
      'should throw error if user is not active',
      async () => {
        global.process.env.OIDC_AUTH_PROVIDERS = ['Auth0'] as unknown as string
        await getOidcRequest('Auth0')
        await disableUser(db)
        const res = await prepareRequest()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.UserDisabled)
        global.process.env.OIDC_AUTH_PROVIDERS = undefined as unknown as string
      },
    )
  },
)
