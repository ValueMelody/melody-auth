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
import { dbTime } from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

const sendSignUpRequest = async (
  db: Database,
  {
    email,
    password,
    firstName,
    lastName,
  }: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
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
    routeConfig.EmbeddedRoute.SignUp.replace(
      ':sessionId',
      sessionId,
    ),
    {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
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
  'get /app-consent',
  () => {
    test(
      'should get app consent',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        const {
          res, sessionId,
        } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
          },
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          nextStep: routeConfig.View.Consent,
          success: false,
        })

        const consentRes = await app.request(
          routeConfig.EmbeddedRoute.AppConsent.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(consentRes.status).toBe(200)
        expect(await consentRes.json()).toStrictEqual({
          appName: 'Admin Panel (SPA)',
          scopes: [
            {
              createdAt: dbTime,
              deletedAt: null,
              id: 2,
              locales: [
                {
                  createdAt: dbTime,
                  deletedAt: null,
                  id: 1,
                  locale: 'en',
                  scopeId: 2,
                  updatedAt: dbTime,
                  value: 'Access your basic profile information',
                },
                {
                  createdAt: dbTime,
                  deletedAt: null,
                  id: 2,
                  locale: 'fr',
                  scopeId: 2,
                  updatedAt: dbTime,
                  value: 'Accéder à vos informations de profil de base',
                },
              ],
              name: 'profile',
              note: '',
              type: 'spa',
              updatedAt: dbTime,
            },
            {
              createdAt: dbTime,
              deletedAt: null,
              id: 1,
              locales: [],
              name: 'openid',
              note: '',
              type: 'spa',
              updatedAt: dbTime,
            },
            {
              createdAt: dbTime,
              deletedAt: null,
              id: 3,
              locales: [],
              name: 'offline_access',
              note: '',
              type: 'spa',
              updatedAt: dbTime,
            },
          ],
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
      },
    )

    test(
      'should throw error when sessionId is not found',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        const consentRes = await app.request(
          routeConfig.EmbeddedRoute.AppConsent.replace(
            ':sessionId',
            'abc',
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(consentRes.status).toBe(404)
        expect(await consentRes.text()).toStrictEqual(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
      },
    )
  },
)

describe(
  'post /app-consent',
  () => {
    test(
      'should post app consent',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        const {
          res, sessionId,
        } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
          },
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          nextStep: routeConfig.View.Consent,
          success: false,
        })

        const consentRes = await app.request(
          routeConfig.EmbeddedRoute.AppConsent.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'POST' },
          mock(db),
        )
        expect(consentRes.status).toBe(200)
        expect(await consentRes.json()).toStrictEqual({
          sessionId,
          success: true,
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
      },
    )

    test(
      'should throw error when sessionId is not found',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        const consentRes = await app.request(
          routeConfig.EmbeddedRoute.AppConsent.replace(
            ':sessionId',
            'abc',
          ),
          { method: 'POST' },
          mock(db),
        )
        expect(consentRes.status).toBe(404)
        expect(await consentRes.text()).toStrictEqual(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
      },
    )
  },
)
