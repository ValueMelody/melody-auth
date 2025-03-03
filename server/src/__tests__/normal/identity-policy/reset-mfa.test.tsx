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
  localeConfig, routeConfig,
} from 'configs'
import {
  prepareFollowUpBody, insertUsers, postSignInRequest, getApp,
} from 'tests/identity'
import {
  enrollEmailMfa, enrollOtpMfa, enrollSmsMfa,
} from 'tests/util'
import { Policy } from 'dtos/oauth'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const sendCorrectResetMfaReq = async ({ code }: { code?: string } = {}) => {
  const body = await prepareFollowUpBody(db)

  const res = await app.request(
    routeConfig.IdentityRoute.ResetMfa,
    {
      method: 'POST',
      body: JSON.stringify({
        ...body, code: code ?? body.code,
      }),
    },
    mock(db),
  )

  return { res }
}

describe(
  'post /reset-mfa',
  () => {
    test(
      'should reset email mfa',
      async () => {
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        enrollEmailMfa(db)
        const { res } = await sendCorrectResetMfaReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const appRecord = await getApp(db)
        const reLoginRes = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password1!' },
        )
        const loginResJson = await reLoginRes.json() as { code: string }
        expect(loginResJson).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.IdentityRoute.ProcessMfaEnroll,
        })

        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should reset sms mfa',
      async () => {
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollSmsMfa(db)
        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )
        const { res } = await sendCorrectResetMfaReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const appRecord = await getApp(db)
        const reLoginRes = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password1!' },
        )
        const loginResJson = await reLoginRes.json() as { code: string }
        expect(loginResJson).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.IdentityRoute.ProcessMfaEnroll,
        })

        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should reset otp mfa',
      async () => {
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const { res } = await sendCorrectResetMfaReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const appRecord = await getApp(db)
        const reLoginRes = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password1!' },
        )
        const loginResJson = await reLoginRes.json() as { code: string }
        expect(loginResJson).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.IdentityRoute.ProcessMfaEnroll,
        })

        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should throw error if use wrong auth code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const { res } = await sendCorrectResetMfaReq({ code: 'abc' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        global.process.env.BLOCKED_POLICIES = [Policy.ResetMfa] as unknown as string
        await insertUsers(
          db,
          false,
        )
        enrollEmailMfa(db)

        const { res } = await sendCorrectResetMfaReq()
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
      },
    )
  },
)
