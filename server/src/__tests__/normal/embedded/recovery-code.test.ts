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
    recoveryCode,
  }: {
    email?: string;
    recoveryCode?: string;
  },
) => {
  const appRecord = await getApp(db)

  const initiateRes = await sendInitiateRequest(
    db,
    appRecord,
  )

  const { sessionId } = await initiateRes.json() as { sessionId: string }

  await insertUsers(db)

  await app.request(
    routeConfig.EmbeddedRoute.SignIn.replace(
      ':sessionId',
      sessionId,
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

  const recoveryCodeEnrollRes = await app.request(
    routeConfig.EmbeddedRoute.RecoveryCodeEnroll.replace(
      ':sessionId',
      sessionId,
    ),
    { method: 'GET' },
    mock(db),
  )
  const recoveryCodeEnrollJson = await recoveryCodeEnrollRes.json() as { recoveryCode: string }

  const res = await app.request(
    routeConfig.EmbeddedRoute.RecoveryCode.replace(
      ':sessionId',
      sessionId,
    ),
    {
      method: 'POST',
      body: JSON.stringify({
        email: email ?? 'test@email.com',
        recoveryCode: recoveryCode ?? recoveryCodeEnrollJson.recoveryCode,
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
  '/recovery-code',
  () => {
    test(
      'should sign in with recovery code',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string

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
        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
      },
    )

    test(
      'should throw error if no user found',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_RECOVERY_CODE = true as unknown as string

        const { res } = await sendSignInRequest(
          db,
          { recoveryCode: '1234567890' },
        )

        expect(res.status).toBe(404)
        expect(await res.text()).toStrictEqual(messageConfig.RequestError.NoUser)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_RECOVERY_CODE = false as unknown as string
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const appRecord = await getApp(db)

        const initiateRes = await sendInitiateRequest(
          db,
          appRecord,
        )

        const { sessionId } = await initiateRes.json() as { sessionId: string }

        await insertUsers(db)

        await app.request(
          routeConfig.EmbeddedRoute.SignIn.replace(
            ':sessionId',
            sessionId,
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

        process.env.ENABLE_RECOVERY_CODE = true as unknown as string

        const recoveryCodeEnrollRes = await app.request(
          routeConfig.EmbeddedRoute.RecoveryCodeEnroll.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        const recoveryCodeEnrollJson = await recoveryCodeEnrollRes.json() as { recoveryCode: string }

        process.env.ENABLE_RECOVERY_CODE = false as unknown as string

        const res = await app.request(
          routeConfig.EmbeddedRoute.RecoveryCode.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({
              email: 'test@email.com',
              recoveryCode: recoveryCodeEnrollJson.recoveryCode,
            }),
          },
          mock(db),
        )

        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(messageConfig.ConfigError.RecoveryCodeNotEnabled)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )
  },
)
