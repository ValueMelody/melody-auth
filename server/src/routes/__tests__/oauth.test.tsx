import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
  session,
} from 'tests/mock'
import {
  adapterConfig, localeConfig, routeConfig,
} from 'configs'
import {
  getApp, getAuthorizeParams, getSignInRequest, insertUsers, postSignInRequest,
  prepareFollowUpBody,
} from 'routes/__tests__/identity.test'
import { oauthDto } from 'dtos'
import { appModel } from 'models'
import {
  dbTime, disableUser, enrollEmailMfa, enrollOtpMfa,
} from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  db.close()
  await mockedKV.empty()
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
        const params = await getAuthorizeParams(appRecord)
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`/identity/v1/authorize-password${params}`)
      },
    )

    test(
      'should throw error if no enough params provided',
      async () => {
        const res = await app.request(
          `${BaseRoute}/authorize`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if wrong app used',
      async () => {
        const appRecord = db.prepare('SELECT * FROM app where id = 2').get() as appModel.Record
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${BaseRoute}/authorize${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(localeConfig.Error.WrongClientType)
      },
    )

    test(
      'should throw error if app is not found',
      async () => {
        const params = await getAuthorizeParams({ clientId: 'abc' } as appModel.Record)

        const res = await app.request(
          `${BaseRoute}/authorize${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(localeConfig.Error.NoApp)
      },
    )

    test(
      'should throw error if app is disabled',
      async () => {
        const appRecord = db.prepare('SELECT * FROM app where id = 2').get() as appModel.Record
        db.prepare('update app set isActive = ?').run(0)
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${BaseRoute}/authorize${params}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.AppDisabled)
      },
    )

    test(
      'should throw error if wrong redirect uri used',
      async () => {
        const appRecord = getApp(db)
        const params = await getAuthorizeParams(appRecord)

        const res = await app.request(
          `${BaseRoute}/authorize${params.replace(
            'http://localhost:3000/en/dashboard',
            'http://localhost:3000/en/dashboard1',
          )}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(localeConfig.Error.WrongRedirectUri)
      },
    )

    test(
      'could login through session',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        const appRecord = getApp(db)
        insertUsers(db)
        await postSignInRequest(
          db,
          appRecord,
        )

        const url = `${BaseRoute}/authorize`
        const res = await getSignInRequest(
          db,
          url,
          appRecord,
        )
        expect(res.status).toBe(302)
        const path = res.headers.get('Location')
        expect(path).toContain('http://localhost:3000/en/dashboard?code')
        const code = path!.split('?')[1].split('&')[0].split('=')[1]
        const tokenRes = await app.request(
          `${BaseRoute}/token`,
          {
            method: 'POST',
            body: new URLSearchParams({
              grant_type: oauthDto.TokenGrantType.AuthorizationCode,
              code,
              code_verifier: 'abc',
            }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        expect(tokenRes.status).toBe(200)

        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = true as unknown as string
      },
    )

    test(
      'could login through session and bypass mfa',
      async () => {
        global.process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        global.process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string
        const appRecord = getApp(db)
        insertUsers(db)
        await postSignInRequest(
          db,
          appRecord,
        )

        const body = await prepareFollowUpBody(db)
        mockedKV.put(`${adapterConfig.BaseKVKey.OtpMfaCode}-${body.code}`, 'aaaaaaaa')
        await app.request(
          `${routeConfig.InternalRoute.Identity}/authorize-otp-mfa`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: 'aaaaaaaa',
            }),
          },
          mock(db),
        )

        mockedKV.put(`${adapterConfig.BaseKVKey.EmailMfaCode}-${body.code}`, 'bbbbbbbb')
        await app.request(
          `${routeConfig.InternalRoute.Identity}/authorize-email-mfa`,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: 'bbbbbbbb',
            }),
          },
          mock(db),
        )

        const url = `${BaseRoute}/authorize`
        const res = await getSignInRequest(
          db,
          url,
          appRecord,
        )
        expect(res.status).toBe(302)
        const path = res.headers.get('Location')
        expect(path).toContain('http://localhost:3000/en/dashboard?code')
        const code = path!.split('?')[1].split('&')[0].split('=')[1]
        const tokenRes = await app.request(
          `${BaseRoute}/token`,
          {
            method: 'POST',
            body: new URLSearchParams({
              grant_type: oauthDto.TokenGrantType.AuthorizationCode,
              code,
              code_verifier: 'abc',
            }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        expect(tokenRes.status).toBe(200)
        global.process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        global.process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'could disable session',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        global.process.env.SERVER_SESSION_EXPIRES_IN = 0 as unknown as string
        const appRecord = getApp(db)
        insertUsers(db)
        await postSignInRequest(
          db,
          appRecord,
        )

        const url = `${BaseRoute}/authorize`
        const res = await getSignInRequest(
          db,
          url,
          appRecord,
        )
        const params = await getAuthorizeParams(appRecord)
        expect(res.status).toBe(302)
        expect(res.headers.get('Location')).toBe(`/identity/v1/authorize-password${params}`)
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = true as unknown as string
        global.process.env.SERVER_SESSION_EXPIRES_IN = 1800 as unknown as string
      },
    )
  },
)

const exchangeWithAuthToken = async () => {
  const appRecord = getApp(db)

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

describe(
  '/token',
  () => {
    test(
      'could get token use auth code',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        insertUsers(db)
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
      'could use plain code challenge',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        insertUsers(db)
        const appRecord = getApp(db)

        const res = await app.request(
          `${routeConfig.InternalRoute.Identity}/authorize-password`,
          {
            method: 'POST',
            body: JSON.stringify({
              clientId: appRecord.clientId,
              redirectUri: 'http://localhost:3000/en/dashboard',
              responseType: 'code',
              state: '123',
              codeChallengeMethod: 'plain',
              codeChallenge: 'aaa',
              scope: 'profile openid offline_access',
              locale: 'en',
              email: 'test@email.com',
              password: 'Password1!',
            }),
          },
          mock(db),
        )
        const json = await res.json() as { code: string }

        const body = {
          grant_type: oauthDto.TokenGrantType.AuthorizationCode,
          code: json.code,
          code_verifier: 'aaa',
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
        expect(tokenRes.status).toBe(200)

        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = true as unknown as string
      },
    )

    test(
      'should throw error with wrong code or wrong code_verifier',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        insertUsers(db)
        const appRecord = getApp(db)

        const res = await postSignInRequest(
          db,
          appRecord,
        )
        const json = await res.json() as { code: string }

        const tokenRes = await app.request(
          `${BaseRoute}/token`,
          {
            method: 'POST',
            body: new URLSearchParams({
              grant_type: oauthDto.TokenGrantType.AuthorizationCode,
              code: `${json.code}1`,
              code_verifier: 'abc',
            }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        expect(tokenRes.status).toBe(400)
        expect(await tokenRes.text()).toBe(localeConfig.Error.WrongCode)

        const tokenRes1 = await app.request(
          `${BaseRoute}/token`,
          {
            method: 'POST',
            body: new URLSearchParams({
              grant_type: oauthDto.TokenGrantType.AuthorizationCode,
              code: json.code,
              code_verifier: 'ab',
            }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        expect(tokenRes1.status).toBe(400)
        expect(await tokenRes1.text()).toBe(localeConfig.Error.WrongCodeVerifier)

        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = true as unknown as string
      },
    )

    test(
      'could get token use refresh token',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        insertUsers(db)
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
      'could throw error if use wrong refresh token or grant type',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        insertUsers(db)
        const tokenRes = await exchangeWithAuthToken()
        const tokenJson = await tokenRes.json() as { refresh_token: string }

        const refreshToken = tokenJson.refresh_token

        const refreshTokenRes = await app.request(
          `${BaseRoute}/token`,
          {
            method: 'POST',
            body: new URLSearchParams({
              grant_type: oauthDto.TokenGrantType.RefreshToken,
              refresh_token: `${refreshToken}1`,
            }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        expect(refreshTokenRes.status).toBe(400)
        expect(await refreshTokenRes.text()).toBe(localeConfig.Error.WrongRefreshToken)

        const refreshTokenRes1 = await app.request(
          `${BaseRoute}/token`,
          {
            method: 'POST',
            body: new URLSearchParams({
              grant_type: 'something',
              refresh_token: `${refreshToken}1`,
            }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        expect(refreshTokenRes1.status).toBe(400)
        expect(await refreshTokenRes1.text()).toBe(localeConfig.Error.WrongGrantType)

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

    test(
      'should throw error if no scope provided',
      async () => {
        const appRecord = db.prepare('SELECT * FROM app where id = 2').get() as appModel.Record

        const basicAuth = btoa(`${appRecord.clientId}:${appRecord.secret}`)
        const res = await app.request(
          `${BaseRoute}/token`,
          {
            method: 'POST',
            body: new URLSearchParams({ grant_type: oauthDto.TokenGrantType.ClientCredentials }).toString(),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${basicAuth}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error when wrong client credentials provided',
      async () => {
        const appRecord = db.prepare('SELECT * FROM app where id = 2').get() as appModel.Record

        const basicAuth = btoa(`${appRecord.clientId}:${appRecord.secret}1`)
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
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(localeConfig.Error.WrongClientSecret)
      },
    )

    test(
      'should throw error if app not found',
      async () => {
        const basicAuth = btoa('abc:123')
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
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(localeConfig.Error.NoApp)
      },
    )

    test(
      'should throw error when wrong app disabled',
      async () => {
        const appRecord = db.prepare('SELECT * FROM app where id = 2').get() as appModel.Record
        db.prepare('update app set isActive = ?').run(0)
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
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.AppDisabled)
      },
    )

    test(
      'should throw error if not credential provided',
      async () => {
        const basicAuth = btoa(':')
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
        expect(res.status).toBe(401)
      },
    )

    test(
      'should throw error if use wrong client type',
      async () => {
        const appRecord = db.prepare('SELECT * FROM app where id = 1').get() as appModel.Record

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
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(localeConfig.Error.WrongClientType)
      },
    )
  },
)

describe(
  'auth-code token exchange',
  () => {
    test(
      'should fail if consent to app is required',
      async () => {
        insertUsers(
          db,
          false,
        )
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        const tokenRes = await exchangeWithAuthToken()
        expect(tokenRes.status).toBe(401)

        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = true as unknown as string
      },
    )

    test(
      'should fail if mfa enroll is required',
      async () => {
        insertUsers(db)
        const tokenRes = await exchangeWithAuthToken()
        expect(tokenRes.status).toBe(401)
      },
    )

    test(
      'should fail if otp mfa is required',
      async () => {
        global.process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        insertUsers(db)
        const tokenRes = await exchangeWithAuthToken()
        expect(tokenRes.status).toBe(401)

        global.process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'should fail if enrolled with otp mfa',
      async () => {
        insertUsers(db)
        enrollOtpMfa(db)
        const tokenRes = await exchangeWithAuthToken()
        expect(tokenRes.status).toBe(401)
        global.process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'should fail if email mfa is required',
      async () => {
        global.process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string
        insertUsers(db)
        const tokenRes = await exchangeWithAuthToken()
        expect(tokenRes.status).toBe(401)
        global.process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'should fail if enrolled with email mfa',
      async () => {
        insertUsers(db)
        enrollEmailMfa(db)
        const tokenRes = await exchangeWithAuthToken()
        expect(tokenRes.status).toBe(401)
        global.process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
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

    test(
      'should throw error if no enough params',
      async () => {
        const appRecord = getApp(db)
        const url = `${BaseRoute}/logout`
        session.set(
          `authInfo-${appRecord.clientId}`,
          'someInfo',
        )

        const res = await app.request(
          `${url}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )
  },
)

describe(
  'get /userinfo',
  () => {
    const prepareUserInfoRequest = async () => {
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

      return tokenJson
    }

    test(
      'should get userinfo',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string

        const tokenJson = await prepareUserInfoRequest()

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

    test(
      'should throw error if user not found',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        const tokenJson = await prepareUserInfoRequest()
        db.prepare('update user set deletedAt = ?').run('2024')

        const userInfoRes = await app.request(
          `${BaseRoute}/userinfo`,
          { headers: { Authorization: `Bearer ${tokenJson.access_token}` } },
          mock(db),
        )
        expect(userInfoRes.status).toBe(404)
        expect(await userInfoRes.text()).toBe(localeConfig.Error.NoUser)

        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = true as unknown as string
      },
    )

    test(
      'should throw error if user disabled',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = false as unknown as string
        const tokenJson = await prepareUserInfoRequest()
        disableUser(db)

        const userInfoRes = await app.request(
          `${BaseRoute}/userinfo`,
          { headers: { Authorization: `Bearer ${tokenJson.access_token}` } },
          mock(db),
        )
        expect(userInfoRes.status).toBe(400)
        expect(await userInfoRes.text()).toBe(localeConfig.Error.UserDisabled)

        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = true as unknown as string
      },
    )
  },
)
