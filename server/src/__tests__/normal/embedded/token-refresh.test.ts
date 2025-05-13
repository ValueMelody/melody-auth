import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { sendInitiateRequest } from './initiate.test'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  messageConfig, routeConfig,
} from 'configs'
import {
  getApp, insertUsers,
} from 'tests/identity'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const sendTokenRefreshRequest = async (
  db: Database,
  { refreshToken }: {
    refreshToken?: string;
  },
) => {
  const appRecord = await getApp(db)

  const initiateRes = await sendInitiateRequest(
    db,
    appRecord,
  )

  const { sessionId: correctSessionId } = await initiateRes.json() as { sessionId: string }

  await insertUsers(db)

  await app.request(
    routeConfig.EmbeddedRoute.SignIn,
    {
      method: 'POST',
      body: JSON.stringify({
        sessionId: correctSessionId,
        email: 'test@email.com',
        password: 'Password1!',
      }),
    },
    mock(db),
  )

  const tokenRes = await app.request(
    routeConfig.EmbeddedRoute.TokenExchange,
    {
      method: 'POST',
      body: JSON.stringify({
        codeVerifier: 'abc',
        sessionId: correctSessionId,
      }),
    },
    mock(db),
  )

  const tokens = await tokenRes.json() as {
    refresh_token: string;
  }

  const res = await app.request(
    routeConfig.EmbeddedRoute.TokenRefresh,
    {
      method: 'POST',
      body: JSON.stringify({
        refreshToken: refreshToken ?? tokens.refresh_token,
      }),
    },
    mock(db),
  )
  return {
    tokens, res,
  }
}

describe(
  '/token-refresh',
  () => {
    test(
      'should refresh access token',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        const { res } = await sendTokenRefreshRequest(
          db,
          {},
        )

        expect(res.status).toBe(200)

        expect(await res.json()).toStrictEqual({
          access_token: expect.any(String),
          expires_in: 1800,
          expires_on: expect.any(Number),
          token_type: 'Bearer',
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
      },
    )

    test(
      'should throw error if no session found',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        const { res } = await sendTokenRefreshRequest(
          db,
          { refreshToken: 'abc' },
        )

        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(messageConfig.RequestError.WrongRefreshToken)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
      },
    )
  },
)
