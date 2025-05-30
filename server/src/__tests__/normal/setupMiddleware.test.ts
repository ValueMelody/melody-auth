import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { postInitiateBody } from './embedded/initiate.test'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  messageConfig, routeConfig,
} from 'configs'
import {
  getApp,
  postAuthorizeBody,
} from 'tests/identity'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

describe(
  'validOrigin',
  () => {
    test(
      'should throw error if origin does not match',
      async () => {
        const appRecord = await getApp(db)
        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
          password: 'Password1!',
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizeAccount,
          {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { Origin: 'http://localhost:3000' },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongOrigin)
      },
    )
  },
)

describe(
  'validEmbeddedOrigin',
  () => {
    test(
      'should throw error if origin does not match',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const appRecord = await getApp(db)

        const body = await postInitiateBody(
          appRecord,
          {},
        )

        const res = await app.request(
          routeConfig.EmbeddedRoute.Initiate,
          {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { Origin: 'http://localhost:3001' },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongOrigin)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )
  },
)
