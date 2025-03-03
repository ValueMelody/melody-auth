import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { sign } from 'hono/jwt'
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
import { userModel } from 'models'
import { disableUser } from 'tests/util'
import { cryptoUtil } from 'utils'
import { jwtService } from 'services'
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
    nextPage: routeConfig.IdentityRoute.AuthorizeConsent,
  })
}

describe(
  'post /authorize-google',
  () => {
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
          routeConfig.IdentityRoute.AuthorizeGoogle,
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
          routeConfig.IdentityRoute.AuthorizeGoogle,
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