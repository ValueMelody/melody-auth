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
import { routeConfig } from 'configs'
import {
  getApp, insertUsers,
} from 'tests/identity'
import { userModel } from 'models'

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
    routeConfig.EmbeddedRoute.SignUp,
    {
      method: 'POST',
      body: JSON.stringify({
        sessionId,
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
  '/signup',
  () => {
    test(
      'should return next step',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        const {
          res, sessionId,
        } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
            firstName: 'John',
            lastName: 'Doe',
          },
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          success: true,
        })

        const user = await db.prepare('SELECT * FROM "user" WHERE email = ?').get('test1@email.com') as userModel.Raw
        expect(user).toBeDefined()
        expect(user.firstName).toBe('John')
        expect(user.lastName).toBe('Doe')
        expect(user.email).toBe('test1@email.com')

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
      },
    )

    test(
      'should sign up with no names',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
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
          success: true,
        })

        const user = await db.prepare('SELECT * FROM "user" WHERE email = ?').get('test1@email.com') as userModel.Raw
        expect(user).toBeDefined()
        expect(user.firstName).toBeNull()
        expect(user.lastName).toBeNull()
        expect(user.email).toBe('test1@email.com')

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
      },
    )

    test(
      'should throw error if names are required',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.NAMES_IS_REQUIRED = true as unknown as string
        const { res } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
          },
        )

        expect(res.status).toBe(400)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.NAMES_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'should indicate consent step if required',
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
            firstName: 'John',
            lastName: 'Doe',
          },
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          nextStep: routeConfig.View.Consent,
          success: false,
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
      },
    )
  },
)
