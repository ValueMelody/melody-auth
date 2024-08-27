import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import app from 'index'
import {
  migrate, mock,
  session,
} from 'tests/mock'
import { routeConfig } from 'configs'
import {
  getApp, getAuthorizeParams, getSignInRequest, insertUsers, postSignInRequest,
} from 'routes/__tests__/identity.test'
import { oauthDto } from 'dtos'
import { appModel } from 'models'
import { dbTime } from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(() => {
  db.close()
})

const BaseRoute = routeConfig.InternalRoute.OAuth

describe(
  '/authorize',
  () => {
    test(
      'should redirect to sign in',
      async () => {
        const appRecord = getApp(db)
        const url = `${BaseRoute}/authorize`
        const res = await getSignInRequest(
          db,
          url,
          appRecord,
        )
        const params = getAuthorizeParams(appRecord)
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`/identity/v1/authorize-password${params}`)
      },
    )
  },
)

describe(
  '/token',
  () => {
    const exchangeWithAuthToken = async () => {
      const appRecord = getApp(db)
      insertUsers(db)

      const res = await postSignInRequest(
        db,
        appRecord,
      )
      const json = await res.json() as { code: string }

      const body = {
        grant_type: oauthDto.TokenGrantType.AuthorizationCode,
        code: json.code,
        code_verifier: 'abc',
      }
      const tokenRes = await app.request(
        `${BaseRoute}/token`,
        {
          method: 'POST',
          body: new URLSearchParams(body).toString(),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
        mock(db),
      )
      return tokenRes
    }

    test(
      'could get token use auth code',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        const tokenRes = await exchangeWithAuthToken()
        const tokenJson = await tokenRes.json()

        expect(tokenJson).toStrictEqual({
          access_token: expect.any(String),
          expires_in: 1800,
          expires_on: expect.any(Number),
          not_before: expect.any(Number),
          token_type: 'Bearer',
          scope: 'profile openid offline_access',
          refresh_token: expect.any(String),
          refresh_token_expires_in: 604800,
          refresh_token_expires_on: expect.any(Number),
          id_token: expect.any(String),
        })

        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = true as unknown as string
      },
    )

    test(
      'could get token use refresh token',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        const tokenRes = await exchangeWithAuthToken()
        const tokenJson = await tokenRes.json() as { refresh_token: string }

        const refreshToken = tokenJson.refresh_token

        const body = {
          grant_type: oauthDto.TokenGrantType.RefreshToken,
          refresh_token: refreshToken,
        }

        const refreshTokenRes = await app.request(
          `${BaseRoute}/token`,
          {
            method: 'POST',
            body: new URLSearchParams(body).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        expect(await refreshTokenRes.json()).toStrictEqual({
          access_token: expect.any(String),
          expires_in: 1800,
          expires_on: expect.any(Number),
          token_type: 'Bearer',
        })

        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = true as unknown as string
      },
    )

    test(
      'could get token use client credentials',
      async () => {
        const appRecord = db.prepare('SELECT * FROM app where id = 2').get() as appModel.Record

        const basicAuth = btoa(`${appRecord.clientId}:${appRecord.secret}`)
        const res = await app.request(
          `${BaseRoute}/token`,
          {
            method: 'POST',
            body: new URLSearchParams({
              grant_type: oauthDto.TokenGrantType.ClientCredentials,
              scope: 'root',
            }).toString(),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${basicAuth}`,
            },
          },
          mock(db),
        )
        expect(await res.json()).toStrictEqual({
          access_token: expect.any(String),
          expires_in: 3600,
          expires_on: expect.any(Number),
          token_type: 'Bearer',
          scope: 'root',
        })
      },
    )
  },
)

describe(
  '/logout',
  () => {
    test(
      'should logout and clear session',
      async () => {
        const appRecord = getApp(db)
        const url = `${BaseRoute}/logout`
        const params = `?client_id=${appRecord.clientId}&post_logout_redirect_uri=http://localhost:3000/en/dashboard`
        session.set(
          `authInfo-${appRecord.clientId}`,
          'someInfo',
        )

        const res = await app.request(
          `${url}${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe('http://localhost:3000/en/dashboard')
        expect(session.get(`authInfo-${appRecord.clientId}`)).toBe(null)
      },
    )
  },
)

describe(
  'get /userinfo',
  () => {
    test(
      'should get userinfo',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        const appRecord = getApp(db)
        insertUsers(db)
        const res = await postSignInRequest(
          db,
          appRecord,
        )

        const json = await res.json() as { code: string }

        const body = {
          grant_type: oauthDto.TokenGrantType.AuthorizationCode,
          code: json.code,
          code_verifier: 'abc',
        }
        const tokenRes = await app.request(
          `${routeConfig.InternalRoute.OAuth}/token`,
          {
            method: 'POST',
            body: new URLSearchParams(body).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        const tokenJson = await tokenRes.json() as { refresh_token: string; access_token: string }

        const userInfoRes = await app.request(
          `${BaseRoute}/userinfo`,
          { headers: { Authorization: `Bearer ${tokenJson.access_token}` } },
          mock(db),
        )
        expect(await userInfoRes.json()).toStrictEqual({
          authId: '1-1-1-1',
          email: 'test@email.com',
          locale: 'en',
          createdAt: dbTime,
          updatedAt: dbTime,
          emailVerified: false,
          roles: [],
          firstName: null,
          lastName: null,
        })

        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = true as unknown as string
      },
    )
  },
)
