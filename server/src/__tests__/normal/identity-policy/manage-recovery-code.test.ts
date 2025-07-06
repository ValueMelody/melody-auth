import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
  passkeyEnrollMock,
} from 'tests/mock'
import {
  adapterConfig, messageConfig, routeConfig,
} from 'configs'
import {
  prepareFollowUpBody,
  insertUsers,
} from 'tests/identity'
import { Policy } from 'dtos/oauth'
import { dbTime } from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const sendCorrectRegenerateRecoveryCodeReq = async ({ code }: { code?: string } = {}) => {
  await insertUsers(
    db,
    false,
  )

  const body = await prepareFollowUpBody(db)
  const res = await app.request(
    routeConfig.IdentityRoute.ManageRecoveryCode,
    {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        code: code ?? body.code,
      }),
    },
    mock(db),
  )

  return { res }
}

describe(
  'post /manage-recovery-code',
  () => {
    test(
      'should regenerate recovery code',
      async () => {
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string

        const { res } = await sendCorrectRegenerateRecoveryCodeReq()
        const json = await res.json() as {
          success: boolean;
          recoveryCode: string;
        }
        expect(json.success).toBe(true)
        expect(json.recoveryCode.length).toBe(24)

        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
      },
    )

    test(
      'should throw error if use wrong auth code',
      async () => {
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string

        const { res } = await sendCorrectRegenerateRecoveryCodeReq({ code: 'abc' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)

        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        const { res } = await sendCorrectRegenerateRecoveryCodeReq()
        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ManageRecoveryCode] as unknown as string

        const { res } = await sendCorrectRegenerateRecoveryCodeReq()
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
      },
    )
  },
)