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
import { userModel } from 'models'
import {
  prepareFollowUpBody, insertUsers,
} from 'tests/identity'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const sendCorrectGetEnrollRequest = async ({ code }: {
  code?: string;
} = {}) => {
  await insertUsers(
    db,
    false,
  )
  const body = await prepareFollowUpBody(db)

  const res = await app.request(
    `${routeConfig.IdentityRoute.ProcessMfaEnroll}?code=${code ?? body.code}`,
    { method: 'GET' },
    mock(db),
  )
  return { res }
}

const sendCorrectPostEnrollRequest = async ({
  type,
  code,
}: {
  type: userModel.MfaType;
  code?: string;
}) => {
  const body = await prepareFollowUpBody(db)

  const res = await app.request(
    routeConfig.IdentityRoute.ProcessMfaEnroll,
    {
      method: 'POST',
      body: JSON.stringify({
        ...body,
        code: code ?? body.code,
        type,
      }),
    },
    mock(db),
  )

  return { res }
}

describe(
  'get /process-mfa-enroll',
  () => {
    test(
      'should get available MFA enrollment options',
      async () => {
        const { res } = await sendCorrectGetEnrollRequest()
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json).toStrictEqual({ mfaTypes: ['otp', 'email'] })
      },
    )

    test(
      'should get type based on env',
      async () => {
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['otp', 'email', 'sms'] as unknown as string
        const { res } = await sendCorrectGetEnrollRequest()

        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json).toStrictEqual({ mfaTypes: ['otp', 'email', 'sms'] })

        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['otp', 'email'] as unknown as string
      },
    )

    test(
      'should throw error if auth code is wrong',
      async () => {
        const { res } = await sendCorrectGetEnrollRequest({ code: 'abc' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)
      },
    )

    test(
      'should throw error if user already enrolled',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await sendCorrectPostEnrollRequest({ type: userModel.MfaType.Email })

        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ProcessMfaEnroll}?code=${body.code}`,
          { method: 'GET' },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.MfaEnrolled)
      },
    )

    test(
      'should throw error if feature is not enabled',
      async () => {
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        const { res } = await sendCorrectGetEnrollRequest()
        expect(res.status).toBe(400)

        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['otp', 'email'] as unknown as string
      },
    )
  },
)

describe(
  'post /process-mfa-enroll',
  () => {
    test(
      'should enroll email mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const { res } = await sendCorrectPostEnrollRequest({ type: userModel.MfaType.Email })
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.EmailMfa,
        })

        const user = await db.prepare('SELECT * from "user" WHERE id = 1').get() as userModel.Raw
        expect(user.mfaTypes).toBe(userModel.MfaType.Email)
      },
    )

    test(
      'should throw error if auth code is wrong',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const { res } = await sendCorrectPostEnrollRequest({
          type: userModel.MfaType.Email, code: 'abc',
        })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)
      },
    )

    test(
      'should throw error if user already enrolled',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await sendCorrectPostEnrollRequest({ type: userModel.MfaType.Email })

        const { res } = await sendCorrectPostEnrollRequest({ type: userModel.MfaType.Email })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.MfaEnrolled)
      },
    )

    test(
      'should enroll otp mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const { res } = await sendCorrectPostEnrollRequest({ type: userModel.MfaType.Otp })
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.OtpSetup,
        })

        const user = await db.prepare('SELECT * from "user" WHERE id = 1').get() as userModel.Raw
        expect(user.mfaTypes).toBe(userModel.MfaType.Otp)
      },
    )

    test(
      'should enroll sms mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const { res } = await sendCorrectPostEnrollRequest({ type: userModel.MfaType.Sms })
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.SmsMfa,
        })

        const user = await db.prepare('SELECT * from "user" WHERE id = 1').get() as userModel.Raw
        expect(user.mfaTypes).toBe(userModel.MfaType.Sms)
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        await insertUsers(
          db,
          false,
        )
        const { res } = await sendCorrectPostEnrollRequest({ type: userModel.MfaType.Email })
        expect(res.status).toBe(400)

        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['otp', 'email'] as unknown as string
      },
    )
  },
)
