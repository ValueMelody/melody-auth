import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { postInitiateBody } from './embedded/initiate.test'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  messageConfig, routeConfig,
} from 'configs'
import {
  getApp,
  postAuthorizeBody,
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
  'validOrigin',
  () => {
    test(
      'should throw error if origin does not match',
      async () => {
        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
          password: 'Password1!',
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeAccount,
          {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { Origin: 'http://localhost:3000' },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongOrigin)
      },
    )
  },
)

describe(
  'validEmbeddedOrigin',
  () => {
    test(
      'should throw error if origin does not match',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const appRecord = await getApp(db)

        const body = await postInitiateBody(
          appRecord,
          {},
        )

        const res = await app.request(
          routeConfig.EmbeddedRoute.Initiate,
          {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { Origin: 'http://localhost:3001' },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongOrigin)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )
  },
)

const sendPreflight = async (
  route: string, origin: string,
) => app.request(
  route,
  {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'authorization,content-type',
    },
  },
  mock(db),
)

describe(
  'cors',
  () => {
    test(
      'should allow any origin on public routes',
      async () => {
        const routes = [
          routeConfig.OauthRoute.Token,
          routeConfig.OauthRoute.Userinfo,
          routeConfig.OauthRoute.Revoke,
          routeConfig.IdentityRoute.Logout,
          '/.well-known/openid-configuration',
          '/.well-known/jwks.json',
        ]
        for (const route of routes) {
          const res = await sendPreflight(
            route,
            'http://localhost:3000',
          )
          expect(res.status).toBe(204)
          expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*')
        }
      },
    )

    test(
      'should not allow cross origin on s2s and identity routes',
      async () => {
        const routes = [
          routeConfig.InternalRoute.ApiUsers,
          routeConfig.InternalRoute.ApiApps,
          '/info',
          routeConfig.IdentityRoute.AuthorizeAccount,
          routeConfig.IdentityRoute.ChangePassword,
          routeConfig.OauthRoute.Authorize,
        ]
        for (const route of routes) {
          const res = await sendPreflight(
            route,
            'http://localhost:3000',
          )
          expect(res.headers.get('Access-Control-Allow-Origin')).toBeNull()
          expect(res.headers.get('Access-Control-Allow-Headers')).toBeNull()
        }
      },
    )

    test(
      'should only allow embedded auth origins on embedded routes',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const allowed = await sendPreflight(
          routeConfig.EmbeddedRoute.Initiate,
          'http://localhost:3000',
        )
        expect(allowed.status).toBe(204)
        expect(allowed.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000')

        const blocked = await sendPreflight(
          routeConfig.EmbeddedRoute.Initiate,
          'http://localhost:3001',
        )
        expect(blocked.headers.get('Access-Control-Allow-Origin')).toBeNull()

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )
  },
)
