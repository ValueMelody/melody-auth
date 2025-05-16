import { Database } from 'better-sqlite3'
import {
  afterEach, beforeEach, describe, expect, Mock, test,
  vi,
} from 'vitest'
import {
  adapterConfig,
  routeConfig,
} from 'configs'
import app from 'index'
import { insertUsers } from 'tests/identity'
import {
  fetchMock,
  migrate, mock,
  mockedKV,
} from 'tests/mock'

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
    locale: 'en',
  }

  const res = await app.request(
    routeConfig.EmbeddedRoute.ResetPasswordCode,
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
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

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

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if no email provided',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        await insertUsers(db)

        const res = await app.request(
          routeConfig.EmbeddedRoute.ResetPasswordCode,
          {
            method: 'POST',
            body: JSON.stringify({ locale: 'en' }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
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
  },
)
