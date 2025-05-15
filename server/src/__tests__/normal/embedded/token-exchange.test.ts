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

export const sendTokenExchangeRequest = async (
  db: Database,
  { sessionId }: {
    sessionId?: string;
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
    routeConfig.EmbeddedRoute.SignIn.replace(
      ':sessionId',
      sessionId ?? correctSessionId,
    ),
    {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@email.com',
        password: 'Password1!',
      }),
    },
    mock(db),
  )

  const res = await app.request(
    routeConfig.EmbeddedRoute.TokenExchange,
    {
      method: 'POST',
      body: JSON.stringify({
        codeVerifier: 'abc',
        sessionId: sessionId ?? correctSessionId,
      }),
    },
    mock(db),
  )

  return { res }
}

describe(
  '/token-exchange',
  () => {
    test(
      'should exchange auth code for access token, refresh token, id token',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        const { res } = await sendTokenExchangeRequest(
          db,
          {},
        )

        expect(res.status).toBe(200)

        expect(await res.json()).toStrictEqual({
          access_token: expect.any(String),
          expires_in: 1800,
          expires_on: expect.any(Number),
          refresh_token: expect.any(String),
          id_token: expect.any(String),
          not_before: expect.any(Number),
          refresh_token_expires_in: 604800,
          refresh_token_expires_on: expect.any(Number),
          scope: 'profile openid offline_access',
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

        const { res } = await sendTokenExchangeRequest(
          db,
          { sessionId: 'abc' },
        )

        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
      },
    )
  },
)
