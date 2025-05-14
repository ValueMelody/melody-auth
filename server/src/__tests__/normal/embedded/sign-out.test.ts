import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { sendTokenExchangeRequest } from './token-exchange.test'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  messageConfig, routeConfig,
} from 'configs'
import { getApp } from 'tests/identity'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

describe(
  '/token-exchange',
  () => {
    test(
      'should exchange auth code for access token, refresh token, id token',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        const appRecord = await getApp(db)
        const { res } = await sendTokenExchangeRequest(
          db,
          {},
        )
        expect(res.status).toBe(200)
        const resBody = await res.json() as { refresh_token: string }

        const signOutRes = await app.request(
          routeConfig.EmbeddedRoute.SignOut,
          {
            method: 'POST',
            body: JSON.stringify({
              refreshToken: resBody.refresh_token,
              clientId: appRecord.clientId,
            }),
          },
          mock(db),
        )

        expect(signOutRes.status).toBe(200)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
      },
    )

    test(
      'should throw error if wrong client id provided',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        const { res } = await sendTokenExchangeRequest(
          db,
          {},
        )
        expect(res.status).toBe(200)
        const resBody = await res.json() as { refresh_token: string }

        const signOutRes = await app.request(
          routeConfig.EmbeddedRoute.SignOut,
          {
            method: 'POST',
            body: JSON.stringify({
              refreshToken: resBody.refresh_token,
              clientId: 'abc',
            }),
          },
          mock(db),
        )

        expect(signOutRes.status).toBe(400)
        expect(await signOutRes.text()).toBe(messageConfig.RequestError.WrongRefreshToken)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
      },
    )

    test(
      'should throw error if wrong refresh token provided',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        const appRecord = await getApp(db)
        const { res } = await sendTokenExchangeRequest(
          db,
          {},
        )
        expect(res.status).toBe(200)

        const signOutRes = await app.request(
          routeConfig.EmbeddedRoute.SignOut,
          {
            method: 'POST',
            body: JSON.stringify({
              refreshToken: 'abc',
              clientId: appRecord.clientId,
            }),
          },
          mock(db),
        )

        expect(signOutRes.status).toBe(400)
        expect(await signOutRes.text()).toBe(messageConfig.RequestError.WrongRefreshToken)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
      },
    )
  },
)
