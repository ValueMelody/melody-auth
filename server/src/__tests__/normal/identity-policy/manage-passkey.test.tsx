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
  adapterConfig, localeConfig, routeConfig,
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

const sendCorrectGetManagePasskeyReq = async ({ code }: { code?: string } = {}) => {
  await insertUsers(
    db,
    false,
  )

  const body = await prepareFollowUpBody(db)
  const res = await app.request(
    `${routeConfig.IdentityRoute.ManagePasskey}?code=${code ?? body.code}`,
    { method: 'GET' },
    mock(db),
  )

  return { res }
}

const sendCorrectEnrollPasskeyReq = async ({ code }: { code?: string } = {}) => {
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
    routeConfig.IdentityRoute.ManagePasskey,
    {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        code: code ?? body.code,
        enrollInfo: passkeyEnrollMock,
      }),
    },
    mock(db),
  )

  return { res }
}

const sendCorrectDeletePasskeyReq = async ({ code }: { code?: string } = {}) => {
  await sendCorrectEnrollPasskeyReq()

  const body = await prepareFollowUpBody(db)
  const res = await app.request(
    routeConfig.IdentityRoute.ManagePasskey,
    {
      method: 'DELETE',
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
  'get /manage-passkey',
  () => {
    test(
      'should get empty passkey info and enrollment options',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        const { res } = await sendCorrectGetManagePasskeyReq()
        const json = await res.json()
        expect(json).toStrictEqual({
          passkey: null,
          enrollOptions: {
            challenge: expect.any(String),
            rpId: 'localhost',
            userDisplayName: ' ',
            userEmail: 'test@email.com',
            userId: 1,
          },
        })

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should get passkey info and enrollment options',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        await sendCorrectEnrollPasskeyReq()
        const body = await prepareFollowUpBody(db)
        const res = await app.request(
          `${routeConfig.IdentityRoute.ManagePasskey}?code=${body.code}`,
          { method: 'GET' },
          mock(db),
        )

        const json = await res.json()
        expect(json).toStrictEqual({
          enrollOptions: {
            challenge: expect.any(String),
            rpId: 'localhost',
            userDisplayName: ' ',
            userEmail: 'test@email.com',
            userId: 1,
          },
          passkey: {
            counter: 0,
            createdAt: dbTime,
            deletedAt: null,
            updatedAt: dbTime,
            id: 1,
            userId: 1,
            publicKey: expect.any(String),
            credentialId: passkeyEnrollMock.id,
          },
        })

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if use wrong auth code',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        const { res } = await sendCorrectGetManagePasskeyReq({ code: 'abc' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        const { res } = await sendCorrectGetManagePasskeyReq()
        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ManagePasskey] as unknown as string

        const { res } = await sendCorrectGetManagePasskeyReq()
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )
  },
)

describe(
  'post /manage-passkey',
  () => {
    test(
      'should enroll passkey',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        const { res } = await sendCorrectEnrollPasskeyReq()
        const json = await res.json()
        expect(json).toStrictEqual({
          success: true,
          passkey: {
            credentialId: passkeyEnrollMock.id,
            counter: 0,
          },
        })

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if use wrong auth code',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        const { res } = await sendCorrectEnrollPasskeyReq({ code: 'abc' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        const { res } = await sendCorrectEnrollPasskeyReq()
        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ManagePasskey] as unknown as string

        const { res } = await sendCorrectEnrollPasskeyReq()
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )
  },
)

describe(
  'delete /manage-passkey',
  () => {
    test(
      'should remove passkey',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        const { res } = await sendCorrectDeletePasskeyReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if use wrong auth code',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        const { res } = await sendCorrectDeletePasskeyReq({ code: 'abc' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongAuthCode)

        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        const { res } = await sendCorrectDeletePasskeyReq()

        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if policy is blocked',
      async () => {
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string
        global.process.env.BLOCKED_POLICIES = [Policy.ManagePasskey] as unknown as string

        const { res } = await sendCorrectDeletePasskeyReq()
        expect(res.status).toBe(400)

        global.process.env.BLOCKED_POLICIES = [] as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )
  },
)
