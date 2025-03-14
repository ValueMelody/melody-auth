import { Database } from 'better-sqlite3'
import {
  afterEach, beforeEach, describe, expect, Mock, test,
  vi,
} from 'vitest'
import {
  adapterConfig,
  localeConfig,
  routeConfig,
} from 'configs'
import app from 'index'
import {
  insertUsers,
  postSignInRequest,
  getApp,
} from 'tests/identity'
import {
  fetchMock,
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import { disableUser } from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const sendCorrectResetPasswordCodeReq = async () => {
  const body = {
    email: 'test@email.com',
    password: 'Password1!',
  }

  const res = await app.request(
    routeConfig.IdentityRoute.ResetPasswordCode,
    {
      method: 'POST', body: JSON.stringify(body),
    },
    mock(db),
  )
  return { res }
}

export const sendCorrectResetPasswordReq = async ({
  password,
  code,
  email,
}: {
  password?: string;
  code?: string;
  email?: string;
} = {}) => {
  const body = {
    email: email ?? 'test@email.com',
    password: password ?? 'Password2!',
    code: code ?? await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`),
  }

  const res = await app.request(
    routeConfig.IdentityRoute.ResetPassword,
    {
      method: 'POST', body: JSON.stringify(body),
    },
    mock(db),
  )

  return { res }
}

describe(
  'post /reset-password-code',
  () => {
    test(
      'should send reset code',
      async () => {
        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        await insertUsers(db)
        const { res } = await sendCorrectResetPasswordCodeReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`) ?? ''
        expect(code.length).toBe(6)

        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(body).toContain(code)

        global.fetch = fetchMock
      },
    )

    test(
      'should return true if user is inactive',
      async () => {
        await insertUsers(db)
        disableUser(db)
        const { res } = await sendCorrectResetPasswordCodeReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordResetCode}-1`)).toBeFalsy()
      },
    )

    test(
      'should throw error if no email provided',
      async () => {
        await insertUsers(db)

        const res = await app.request(
          routeConfig.IdentityRoute.ResetPasswordCode,
          {
            method: 'POST',
            body: JSON.stringify({ password: 'Password1!' }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if feature is disabled',
      async () => {
        global.process.env.ENABLE_PASSWORD_RESET = false as unknown as string
        await insertUsers(db)
        const { res } = await sendCorrectResetPasswordCodeReq()
        expect(res.status).toBe(400)
        global.process.env.ENABLE_PASSWORD_RESET = true as unknown as string
      },
    )

    test(
      'should throw error if passwordless sign in is enabled',
      async () => {
        global.process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string
        await insertUsers(db)
        const { res } = await sendCorrectResetPasswordCodeReq()
        expect(res.status).toBe(400)
        global.process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
      },
    )
  },
)

describe(
  'post /authorize-reset',
  () => {
    test(
      'should reset password and unlock account',
      async () => {
        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 1 as unknown as string
        const appRecord = await getApp(db)
        await insertUsers(db)

        await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com`)).toBe('1')

        await sendCorrectResetPasswordCodeReq()

        const { res } = await sendCorrectResetPasswordReq()
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com`)).toBeFalsy()

        const signInRes = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(await signInRes.json()).toBeTruthy()
        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 5 as unknown as string
      },
    )

    test(
      'should throw error with wrong code',
      async () => {
        await insertUsers(db)

        await sendCorrectResetPasswordCodeReq()
        const { res } = await sendCorrectResetPasswordReq({ code: 'abcdef' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.WrongCode)
      },
    )

    test(
      'should throw error when reset with same password',
      async () => {
        await insertUsers(db)

        await sendCorrectResetPasswordCodeReq()

        const { res } = await sendCorrectResetPasswordReq({ password: 'Password1!' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.RequireDifferentPassword)
      },
    )

    test(
      'should not reset if user is inactive',
      async () => {
        await insertUsers(db)

        await sendCorrectResetPasswordCodeReq()

        disableUser(db)

        const { res } = await sendCorrectResetPasswordReq()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.UserDisabled)
      },
    )

    test(
      'should not reset if use a wrong email',
      async () => {
        await insertUsers(db)

        await sendCorrectResetPasswordCodeReq()

        const { res } = await sendCorrectResetPasswordReq({ email: 'test1@email.com' })
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(localeConfig.Error.NoUser)
      },
    )

    test(
      'could disable account unlock by reset password',
      async () => {
        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 1 as unknown as string
        global.process.env.UNLOCK_ACCOUNT_VIA_PASSWORD_RESET = false as unknown as string

        const appRecord = await getApp(db)
        await insertUsers(db)

        await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com`)).toBe('1')

        await sendCorrectResetPasswordCodeReq()
        await sendCorrectResetPasswordReq()

        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com`)).toBe('1')

        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 5 as unknown as string
        global.process.env.UNLOCK_ACCOUNT_VIA_PASSWORD_RESET = true as unknown as string
      },
    )

    test(
      'should throw error if feature is disabled',
      async () => {
        await insertUsers(db)

        await sendCorrectResetPasswordCodeReq()

        global.process.env.ENABLE_PASSWORD_RESET = false as unknown as string

        const { res } = await sendCorrectResetPasswordReq()

        expect(res.status).toBe(400)
        global.process.env.ENABLE_PASSWORD_RESET = true as unknown as string
      },
    )
  },
)
