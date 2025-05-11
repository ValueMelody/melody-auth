import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { genCodeChallenge } from '@melody-auth/shared'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  adapterConfig, messageConfig, routeConfig,
} from 'configs'
import { getApp } from 'tests/identity'
import { appModel } from 'models'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

export const postInitiateBody = async (
  appRecord: appModel.Record, {
    orgSlug,
    redirectUri,
  }: {
  orgSlug?: string;
  redirectUri?: string;
},
) => ({
  clientId: appRecord.clientId,
  redirectUri: redirectUri ?? 'http://localhost:3000',
  codeChallengeMethod: 'S256',
  codeChallenge: await genCodeChallenge('abc'),
  scopes: ['profile', 'openid', 'offline_access'],
  locale: 'en',
  org: orgSlug ?? undefined,
})

const sendInitiateRequest = async (
  db: Database,
  appRecord: appModel.Record,
  {
    orgSlug,
    redirectUri,
  }: {
    orgSlug?: string;
    redirectUri?: string;
  } = {},
) => {
  const body = await postInitiateBody(
    appRecord,
    {
      orgSlug,
      redirectUri,
    },
  )

  const res = await app.request(
    routeConfig.EmbeddedRoute.Initiate,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    mock(db),
  )
  return res
}

describe(
  '/initiate',
  () => {
    test(
      'should return session id',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const appRecord = await getApp(db)
        const res = await sendInitiateRequest(
          db,
          appRecord,
        )

        expect(res.status).toBe(200)

        const { sessionId } = await res.json() as { sessionId: string }
        expect(sessionId).toStrictEqual(expect.any(String))

        const sessionBody = await mockedKV.get(adapterConfig.getKVKey(
          adapterConfig.BaseKVKey.EmbeddedSession,
          sessionId,
        ))
        expect(JSON.parse(sessionBody!)).toStrictEqual({
          appId: appRecord.id,
          appName: appRecord.name,
          request: {
            clientId: appRecord.clientId,
            redirectUri: 'http://localhost:3000',
            scopes: ['profile', 'openid', 'offline_access'],
            locale: 'en',
            codeChallengeMethod: 's256',
            codeChallenge: await genCodeChallenge('abc'),
          },
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'could generate session with org id',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const appRecord = await getApp(db)

        const res = await sendInitiateRequest(
          db,
          appRecord,
          { orgSlug: 'default' },
        )

        expect(res.status).toBe(200)

        const { sessionId } = await res.json() as { sessionId: string }
        expect(sessionId).toStrictEqual(expect.any(String))

        const sessionBody = await mockedKV.get(adapterConfig.getKVKey(
          adapterConfig.BaseKVKey.EmbeddedSession,
          sessionId,
        ))
        expect(JSON.parse(sessionBody!)).toStrictEqual({
          appId: appRecord.id,
          appName: appRecord.name,
          request: {
            clientId: appRecord.clientId,
            redirectUri: 'http://localhost:3000',
            scopes: ['profile', 'openid', 'offline_access'],
            locale: 'en',
            codeChallengeMethod: 's256',
            codeChallenge: await genCodeChallenge('abc'),
            org: 'default',
          },
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if no enough params provided',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const res = await app.request(
          routeConfig.EmbeddedRoute.Initiate,
          {
            method: 'POST',
            body: JSON.stringify({
              clientId: 'abc',
              redirectUri: 'http://localhost:3000',
              scopes: ['profile', 'openid', 'offline_access'],
              codeChallengeMethod: 'S256',
              codeChallenge: await genCodeChallenge('abc'),
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if wrong app used',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const appRecord = await db.prepare('SELECT * FROM app where id = 2').get() as appModel.Record

        const res = await sendInitiateRequest(
          db,
          appRecord,
          { orgSlug: 'default' },
        )

        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.NotSpaTypeApp)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if app is not found',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const appRecord = await getApp(db)

        const res = await sendInitiateRequest(
          db,
          {
            ...appRecord,
            clientId: 'abc',
          },
          { orgSlug: 'default' },
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoSpaAppFound)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if app is disabled',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const appRecord = await db.prepare('SELECT * FROM app where id = 2').get() as appModel.Record
        await db.prepare('update app set "isActive" = ?').run(0)
        const res = await sendInitiateRequest(
          db,
          appRecord,
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.SpaAppDisabled)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )

    test(
      'should throw error if wrong redirect uri used',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        const appRecord = await getApp(db)

        const res = await sendInitiateRequest(
          db,
          appRecord,
          { redirectUri: 'http://localhost:3001' },
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongRedirectUri)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )
  },
)
