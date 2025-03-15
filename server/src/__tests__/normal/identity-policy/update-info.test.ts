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
  prepareFollowUpBody,
  insertUsers,
} from 'tests/identity'
import { userModel } from 'models'
import { Policy } from 'dtos/oauth'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const sendCorrectUpdateInfoReq = async ({ code }: {
  code?: string;
} = {}) => {
  await insertUsers(
    db,
    false,
  )
  const body = await prepareFollowUpBody(db)

  const res = await app.request(
    routeConfig.IdentityRoute.UpdateInfo,
    {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        code: code ?? body.code,
        firstName: 'John',
        lastName: 'Doe',
      }),
    },
    mock(db),
  )

  return { res }
}

describe(
  'post /update-info',
  () => {
    test(
      'should update info',
      async () => {
        const { res } = await sendCorrectUpdateInfoReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const user = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        expect(user.firstName).toBe('John')
        expect(user.lastName).toBe('Doe')
      },
    )

    test(
      'should throw 400 if use wrong auth code',
      async () => {
        const { res } = await sendCorrectUpdateInfoReq({ code: 'abc' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)
      },
    )

    test(
      'should throw 401 if feature not enabled',
      async () => {
        global.process.env.ENABLE_NAMES = false as unknown as string

        const { res } = await sendCorrectUpdateInfoReq()
        expect(res.status).toBe(400)

        global.process.env.ENABLE_NAMES = true as unknown as string
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        global.process.env.BLOCKED_POLICIES = [Policy.UpdateInfo] as unknown as string

        const { res } = await sendCorrectUpdateInfoReq()
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
      },
    )
  },
)
