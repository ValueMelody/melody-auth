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
  messageConfig, routeConfig,
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

export const enrollRecoveryCode = async (db: Database) => {
  await insertUsers(
    db,
    false,
  )

  const body = await prepareFollowUpBody(db)
  const res = await app.request(
    `${routeConfig.IdentityRoute.ProcessRecoveryCodeEnroll}?code=${body.code}`,
    { method: 'GET' },
    mock(db),
  )
  return { res }
}

describe(
  'post /authorize-recovery-code-verify',
  () => {
    const recoveryCodeVerify = async (db: Database) => {
      const { res: enrollRes } = await enrollRecoveryCode(db)
      const enrollJson = await enrollRes.json() as { recoveryCode: string }

      const appRecord = await getApp(db)
      const body = {
        ...(await postAuthorizeBody(appRecord)),
        email: 'test@email.com',
        recoveryCode: enrollJson.recoveryCode,
      }

      const res = await app.request(
        routeConfig.IdentityRoute.AuthorizeRecoveryCode,
        {
          method: 'POST', body: JSON.stringify(body),
        },
        mock(db),
      )

      return res
    }

    test(
      'should verify recovery code',
      async () => {
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        const res = await recoveryCodeVerify(db)

        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'request with no scopes',
      async () => {
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string

        const appRecord = await getApp(db)

        const { res: enrollRes } = await enrollRecoveryCode(db)
        const enrollJson = await enrollRes.json() as { recoveryCode: string }

        const body = {
          ...(await postAuthorizeBody(appRecord)),
          scope: '',
          email: 'test@email.com',
          recoveryCode: enrollJson.recoveryCode,
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeRecoveryCode,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )

        expect(res.status).toBe(400)
        const json = await res.json() as {
          constraints: {
            arrayMinSize: string;
          };
        }[]
        expect(json[0].constraints).toStrictEqual({ arrayMinSize: 'scopes must contain at least 1 elements' })

        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
      },
    )

    test(
      'could generate session after recovery code verify',
      async () => {
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await recoveryCodeVerify(db)
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
        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error if recovery code not match',
      async () => {
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string

        await enrollRecoveryCode(db)

        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test1@email.com',
          recoveryCode: '123456789012345678901234',
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeRecoveryCode,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoUser)

        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
      },
    )

    test(
      'should throw error if recovery code not found',
      async () => {
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string

        await enrollRecoveryCode(db)

        await db.prepare('update "user" set "recoveryCodeHash" = null where "id" = 1').run()

        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
          recoveryCode: '123456789012345678901234',
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeRecoveryCode,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoUser)

        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
      },
    )

    test(
      'should throw error if feature not allowed',
      async () => {
        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeRecoveryCode,
          {
            method: 'POST',
            body: JSON.stringify({
              email: 'test@email.com',
              recoveryCode: '123456789012345678901234',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )
  },
)
