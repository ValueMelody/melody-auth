import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
  passkeyEnrollMock,
  passkeyVerifyMock,
} from 'tests/mock'
import {
  adapterConfig, messageConfig, routeConfig,
} from 'configs'
import {
  postAuthorizeBody,
  getApp,
  insertUsers,
  prepareFollowUpBody,
  getSignInRequest,
} from 'tests/identity'
import { oauthDto } from 'dtos'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

export const enrollPasskey = async (db: Database) => {
  await insertUsers(
    db,
    false,
  )

  await mockedKV.put(
    `${adapterConfig.BaseKVKey.PasskeyEnrollChallenge}-1`,
    'Gu09HnxTsc01smwaCtC6yHE0MEg_d-qKUSpKi5BbLgU',
  )

  const body = await prepareFollowUpBody(db)
  const res = await app.request(
    routeConfig.IdentityRoute.ProcessPasskeyEnroll,
    {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        enrollInfo: passkeyEnrollMock,
      }),
    },
    mock(db),
  )
  return res
}

describe(
  'get /authorize-passkey-verify',
  () => {
    test(
      'could get passkey verify options by email',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await enrollPasskey(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.AuthorizePasskeyVerify}?email=test@email.com`,
          {},
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          passkeyOption: {
            rpId: 'localhost',
            timeout: 60000,
            userVerification: 'preferred',
            challenge: await mockedKV.get(`${adapterConfig.BaseKVKey.PasskeyVerifyChallenge}-test@email.com`),
            allowCredentials: [{
              id: passkeyEnrollMock.rawId, type: 'public-key',
            }],
          },
        })

        const res1 = await app.request(
          `${routeConfig.IdentityRoute.AuthorizePasskeyVerify}?email=test1@email.com`,
          {},
          mock(db),
        )
        const json1 = await res1.json()
        expect(json1).toStrictEqual({ passkeyOption: null })

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if feature not allowed',
      async () => {
        const res = await app.request(`${routeConfig.IdentityRoute.AuthorizePasskeyVerify}?email=test@email.com`)
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.PasskeyEnrollmentNotEnabled)
      },
    )

    test(
      'should throw error if email is not provided',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        const res = await app.request(`${routeConfig.IdentityRoute.AuthorizePasskeyVerify}`)
        expect(res.status).toBe(400)
        const json = await res.json() as { constraints: { isEmail: string; isNotEmpty: string } }[]
        expect(json[0].constraints).toStrictEqual({
          isEmail: 'email must be an email',
          isNotEmpty: 'email should not be empty',
        })
        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )
  },
)

describe(
  'post /authorize-passkey-verify',
  () => {
    const passkeyVerify = async (db: Database) => {
      await enrollPasskey(db)

      await mockedKV.put(
        `${adapterConfig.BaseKVKey.PasskeyVerifyChallenge}-test@email.com`,
        'hJ95J5Tc52hkJlWaWdBXqPUhnLGkGR3Nqkn2VwPjAXc',
      )

      const appRecord = await getApp(db)
      const body = {
        ...(await postAuthorizeBody(appRecord)),
        email: 'test@email.com',
        passkeyInfo: passkeyVerifyMock,
      }

      const res = await app.request(
        routeConfig.IdentityRoute.AuthorizePasskeyVerify,
        {
          method: 'POST', body: JSON.stringify(body),
        },
        mock(db),
      )

      return res
    }

    test(
      'should verify passkey',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        const res = await passkeyVerify(db)

        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'could generate session after passkey verify',
      async () => {
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await passkeyVerify(db)
        const appRecord = await getApp(db)

        const url = routeConfig.OauthRoute.Authorize
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
          routeConfig.OauthRoute.Token,
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
        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error if wrong challenge provided',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await enrollPasskey(db)

        await mockedKV.put(
          `${adapterConfig.BaseKVKey.PasskeyVerifyChallenge}-test@email.com`,
          'abc',
        )

        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
          passkeyInfo: passkeyVerifyMock,
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizePasskeyVerify,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidPasskeyVerifyRequest)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if passkey not match',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await enrollPasskey(db)

        await mockedKV.put(
          `${adapterConfig.BaseKVKey.PasskeyVerifyChallenge}-test@email.com`,
          'hJ95J5Tc52hkJlWaWdBXqPUhnLGkGR3Nqkn2VwPjAXc',
        )

        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test1@email.com',
          passkeyInfo: passkeyVerifyMock,
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizePasskeyVerify,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidPasskeyVerifyRequest)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if passkey not found',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await enrollPasskey(db)

        await mockedKV.put(
          `${adapterConfig.BaseKVKey.PasskeyVerifyChallenge}-test@email.com`,
          'hJ95J5Tc52hkJlWaWdBXqPUhnLGkGR3Nqkn2VwPjAXc',
        )

        await db.prepare('delete from "user_passkey" where "userId" = 1').run()

        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
          passkeyInfo: passkeyVerifyMock,
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizePasskeyVerify,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidPasskeyVerifyRequest)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if can not verify passkey',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await enrollPasskey(db)

        await mockedKV.put(
          `${adapterConfig.BaseKVKey.PasskeyVerifyChallenge}-test@email.com`,
          'hJ95J5Tc52hkJlWaWdBXqPUhnLGkGR3Nqkn2VwPjAXc',
        )

        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
          passkeyInfo: {
            ...passkeyVerifyMock,
            response: {
              ...passkeyVerifyMock.response,
              clientDataJSON: '123',
            },
          },
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizePasskeyVerify,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.InvalidPasskeyVerifyRequest)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if feature not allowed',
      async () => {
        const res = await passkeyVerify(db)
        expect(res.status).toBe(400)
      },
    )
  },
)
