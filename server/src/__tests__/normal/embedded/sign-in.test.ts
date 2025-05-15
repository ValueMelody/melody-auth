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

const sendSignInRequest = async (
  db: Database,
  {
    email,
    password,
  }: {
    email?: string;
    password?: string;
  },
) => {
  const appRecord = await getApp(db)

  const initiateRes = await sendInitiateRequest(
    db,
    appRecord,
  )

  const { sessionId } = await initiateRes.json() as { sessionId: string }

  await insertUsers(db)

  const res = await app.request(
    routeConfig.EmbeddedRoute.SignIn.replace(
      ':sessionId',
      sessionId,
    ),
    {
      method: 'POST',
      body: JSON.stringify({
        email: email ?? 'test@email.com',
        password: password ?? 'Password1!',
      }),
    },
    mock(db),
  )
  return {
    res,
    sessionId,
  }
}

describe(
  '/signin',
  () => {
    test(
      'should return next step',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const {
          res, sessionId,
        } = await sendSignInRequest(
          db,
          {},
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          nextStep: routeConfig.View.MfaEnroll,
          success: false,
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should return no next step if all step completed',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        const {
          res, sessionId,
        } = await sendSignInRequest(
          db,
          {},
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          success: true,
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
      },
    )

    test(
      'should throw error if no user found',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const { res } = await sendSignInRequest(
          db,
          { email: 'test@test1.com' },
        )

        expect(res.status).toBe(404)
        expect(await res.text()).toStrictEqual(messageConfig.RequestError.NoUser)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )
  },
)
