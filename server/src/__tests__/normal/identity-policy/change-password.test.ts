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
  prepareFollowUpBody, insertUsers, postSignInRequest, getApp,
} from 'tests/identity'
import { Policy } from 'dtos/oauth'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const sendCorrectChangePasswordReq = async ({ code }: {
  code?: string;
} = {}) => {
  await insertUsers(
    db,
    false,
  )

  const body = await prepareFollowUpBody(db)
  const res = await app.request(
    routeConfig.IdentityRoute.ChangePassword,
    {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        code: code ?? body.code,
        password: 'Password2!',
      }),
    },
    mock(db),
  )
  return { res }
}

describe(
  'post /change-password',
  () => {
    test(
      'should change password',
      async () => {
        const { res } = await sendCorrectChangePasswordReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const appRecord = await getApp(db)
        const reLoginRes = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        const loginResJson = await reLoginRes.json() as { code: string }
        expect(loginResJson).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.Consent,
        })
      },
    )

    test(
      'should throw 400 if use wrong auth code',
      async () => {
        const { res } = await sendCorrectChangePasswordReq({ code: 'abc' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        global.process.env.ENABLE_PASSWORD_RESET = false as unknown as string
        const { res } = await sendCorrectChangePasswordReq()
        expect(res.status).toBe(400)

        global.process.env.ENABLE_PASSWORD_RESET = true as unknown as string
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        global.process.env.BLOCKED_POLICIES = [Policy.ChangePassword] as unknown as string
        const { res } = await sendCorrectChangePasswordReq()
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
      },
    )
  },
)
