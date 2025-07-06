import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import app from 'index'
import {
  migrate, mock, mockedKV,
} from 'tests/mock'
import {
  messageConfig, routeConfig,
} from 'configs'
import { userModel } from 'models'
import {
  prepareFollowUpBody, prepareFollowUpParams, insertUsers, getCodeFromParams,
} from 'tests/identity'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const sendCorrectGetRecoveryCodeReq = async ({ code }: { code?: string } = {}) => {
  await insertUsers(db)
  const body = await prepareFollowUpBody(db)
  const res = await app.request(
    `${routeConfig.IdentityRoute.ProcessRecoveryCodeEnroll}?code=${code ?? body.code}`,
    {},
    mock(db),
  )
  return { res }
}

describe(
  'get /authorize-recovery-code-enroll',
  () => {
    test(
      'should get recovery code',
      async () => {
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string
        const { res } = await sendCorrectGetRecoveryCodeReq()

        expect(res.status).toBe(200)
        const json = await res.json() as { recoveryCode: string }
        expect(json.recoveryCode.length).toBe(24)

        const user = await db.prepare('SELECT * from "user" WHERE "id" = 1').get() as userModel.Raw
        expect(user.recoveryCodeHash).not.toBeNull()

        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
      },
    )

    test(
      'should not get recovery code twice',
      async () => {
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string
        const { res } = await sendCorrectGetRecoveryCodeReq()

        expect(res.status).toBe(200)
        const json = await res.json() as { recoveryCode: string }
        expect(json.recoveryCode.length).toBe(24)

        const body = await prepareFollowUpBody(db)
        const res1 = await app.request(
          `${routeConfig.IdentityRoute.ProcessRecoveryCodeEnroll}?code=${body.code}`,
          {},
          mock(db),
        )

        expect(res1.status).toBe(400)
        expect(await res1.text()).toBe(messageConfig.RequestError.RecoveryCodeAlreadySet)

        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
      },
    )

    test(
      'should throw error if feature not allowed',
      async () => {
        const { res } = await sendCorrectGetRecoveryCodeReq()
        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if passwordless sign in is enabled',
      async () => {
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string

        await insertUsers(
          db,
          false,
        )

        const body = await prepareFollowUpBody(db)

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string

        const res = await app.request(
          `${routeConfig.IdentityRoute.ProcessRecoveryCodeEnroll}?code=${body.code}`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if use wrong code',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        const { res } = await sendCorrectGetRecoveryCodeReq({ code: 'abc' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )
  },
)

describe(
  'post /authorize-recovery-code-enroll',
  () => {
    test(
      'should go to dashboard',
      async () => {
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string

        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)
        const code = getCodeFromParams(params)

        await app.request(
          `${routeConfig.IdentityRoute.ProcessRecoveryCodeEnroll}${params}`,
          {},
          mock(db),
        )

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessRecoveryCodeEnroll,
          {
            method: 'POST',
            body: JSON.stringify({
              code, locale: 'en', remember: false,
            }),
          },
          mock(db),
        )
        expect(await res.json()).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
      },
    )

    test(
      'should throw error if feature not allowed',
      async () => {
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string

        await insertUsers(
          db,
          false,
        )
        const params = await prepareFollowUpParams(db)
        const code = getCodeFromParams(params)

        await app.request(
          `${routeConfig.IdentityRoute.ProcessRecoveryCodeEnroll}${params}`,
          {},
          mock(db),
        )

        process.env.ENABLE_RECOVERY_CODE = false as unknown as string

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessRecoveryCodeEnroll,
          {
            method: 'POST',
            body: JSON.stringify({
              code, locale: 'en', remember: false,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if wrong code used',
      async () => {
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessRecoveryCodeEnroll,
          {
            method: 'POST',
            body: JSON.stringify({
              code: 'abc', locale: 'en', remember: false,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)

        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
      },
    )
  },
)
