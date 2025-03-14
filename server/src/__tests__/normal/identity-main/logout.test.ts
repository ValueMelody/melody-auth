import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  adapterConfig, routeConfig,
} from 'configs'
import { oauthDto } from 'dtos'
import {
  insertUsers, postSignInRequest, getApp,
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
  'post /logout',
  () => {
    const prepareLogout = async () => {
      const appRecord = await getApp(db)
      await insertUsers(db)
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
        routeConfig.OauthRoute.Token,
        {
          method: 'POST',
          body: new URLSearchParams(body).toString(),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
        mock(db),
      )
      const tokenJson = await tokenRes.json() as { refresh_token: string; access_token: string }

      const tokenBody = await mockedKV.get(`${adapterConfig.BaseKVKey.RefreshToken}-${tokenJson.refresh_token}`)
      expect(JSON.parse(tokenBody ?? '')).toStrictEqual({
        authId: '1-1-1-1',
        clientId: appRecord.clientId,
        scope: 'profile openid offline_access',
        roles: [],
      })

      return tokenJson
    }

    test(
      'should logout',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        const appRecord = await getApp(db)
        const tokenJson = await prepareLogout()

        const logoutRes = await app.request(
          routeConfig.IdentityRoute.Logout,
          {
            method: 'POST',
            body: new URLSearchParams({
              refresh_token: tokenJson.refresh_token,
              post_logout_redirect_uri: '/',
            }).toString(),
            headers: {
              Authorization: `Bearer ${tokenJson.access_token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
          mock(db),
        )
        expect(await logoutRes.json()).toStrictEqual({
          success: true,
          redirectUri: `http://localhost:8787${routeConfig.OauthRoute.Logout}?post_logout_redirect_uri=/&client_id=${appRecord.clientId}`,
        })

        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.RefreshToken}-${tokenJson.refresh_token}`)).toBeFalsy()

        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
      },
    )

    test(
      'could logout without post logout redirect uri',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        const appRecord = await getApp(db)
        const tokenJson = await prepareLogout()

        const logoutRes = await app.request(
          routeConfig.IdentityRoute.Logout,
          {
            method: 'POST',
            body: new URLSearchParams({ refresh_token: tokenJson.refresh_token }).toString(),
            headers: {
              Authorization: `Bearer ${tokenJson.access_token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
          mock(db),
        )
        expect(await logoutRes.json()).toStrictEqual({
          success: true,
          redirectUri: `http://localhost:8787${routeConfig.OauthRoute.Logout}?post_logout_redirect_uri=&client_id=${appRecord.clientId}`,
        })

        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.RefreshToken}-${tokenJson.refresh_token}`)).toBeFalsy()

        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
      },
    )

    test(
      'should pass through even if token has wrong client',
      async () => {
        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        const appRecord = await getApp(db)
        await insertUsers(db)
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
          routeConfig.OauthRoute.Token,
          {
            method: 'POST',
            body: new URLSearchParams(body).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        const tokenJson = await tokenRes.json() as { refresh_token: string; access_token: string }

        const tokenKey = `${adapterConfig.BaseKVKey.RefreshToken}-${tokenJson.refresh_token}`
        await mockedKV.put(
          tokenKey,
          JSON.stringify({
            ...JSON.parse(await mockedKV.get(tokenKey) ?? ''), authId: '123',
          }),
        )
        const logoutRes = await app.request(
          routeConfig.IdentityRoute.Logout,
          {
            method: 'POST',
            body: new URLSearchParams({
              refresh_token: tokenJson.refresh_token,
              post_logout_redirect_uri: '/',
            }).toString(),
            headers: {
              Authorization: `Bearer ${tokenJson.access_token}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
          mock(db),
        )
        expect(logoutRes.status).toBe(200)
        expect(await logoutRes.json()).toStrictEqual({
          success: true,
          redirectUri: `http://localhost:8787${routeConfig.OauthRoute.Logout}?post_logout_redirect_uri=/&client_id=${appRecord.clientId}`,
        })

        global.process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
      },
    )
  },
)
