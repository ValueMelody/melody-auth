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
import {
  userAttributeValueModel, userModel,
} from 'models'

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
    attributes,
  }: {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    attributes?: Record<number, string>;
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
        attributes,
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
  'get sign up info',
  () => {
    test(
      'should return sign up info',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        db.exec(`
      INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values ('test', 1, 0, 0, 0)
    `)
        db.exec(`
      INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values ('test1', 0, 0, 0, 0)
    `)

        const res = await app.request(
          routeConfig.EmbeddedRoute.SignUp,
          { method: 'GET' },
          mock(db),
        )
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json).toStrictEqual({
          userAttributes: [
            {
              id: 1,
              name: 'test',
              includeInSignUpForm: true,
              requiredInSignUpForm: false,
              includeInIdTokenBody: false,
              includeInUserInfo: false,
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              deletedAt: null,
            },
          ],
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should return empty sign up info if user attribute is disabled',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string

        db.exec(`
      INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values ('test', 1, 0, 0, 0)
    `)
        db.exec(`
      INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values ('test1', 0, 0, 0, 0)
    `)

        const res = await app.request(
          routeConfig.EmbeddedRoute.SignUp,
          { method: 'GET' },
          mock(db),
        )
        expect(res.status).toBe(200)
        const json = await res.json()
        expect(json).toStrictEqual({ userAttributes: [] })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
      },
    )
  },
)

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
      'should sign up with attributes',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        db.exec(`
          INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values ('test', 1, 0, 0, 0)
        `)
        db.exec(`
          INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values ('test2', 0, 0, 0, 0)
        `)
        db.exec(`
          INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values ('test3', 1, 1, 0, 0)
        `)

        const {
          res, sessionId,
        } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
            attributes: {
              1: 'value1',
              2: 'value2',
              3: 'value3',
            },
          },
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          success: true,
        })

        const attributeValues = await db.prepare('select * from "user_attribute_value" where "userId" = 2').all() as userAttributeValueModel.Record[]

        expect(attributeValues).toStrictEqual([
          {
            id: 1,
            userId: 2,
            userAttributeId: 1,
            value: 'value1',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deletedAt: null,
          },
          {
            id: 2,
            userId: 2,
            userAttributeId: 3,
            value: 'value3',
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            deletedAt: null,
          },
        ])

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should throw error if required attributes are not provided',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        db.exec(`
          INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values ('test', 1, 0, 0, 0)
        `)
        db.exec(`
          INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values ('test2', 0, 0, 0, 0)
        `)
        db.exec(`
          INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values ('test3', 1, 1, 0, 0)
        `)

        const { res } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
            attributes: {
              1: 'value1',
              2: 'value2',
            },
          },
        )

        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(`${messageConfig.RequestError.AttributeIsRequired}: test3`)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should sign up without attributes if feature flag is disabled',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        db.exec(`
          INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values ('test', 1, 0, 0, 0)
        `)
        db.exec(`
          INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values ('test2', 0, 0, 0, 0)
        `)
        db.exec(`
          INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo") values ('test3', 1, 1, 0, 0)
        `)

        const {
          res, sessionId,
        } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
            attributes: {
              1: 'value1',
              2: 'value2',
              3: 'value3',
            },
          },
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          success: true,
        })

        const attributeValues = await db.prepare('select * from "user_attribute_value" where "userId" = 2').all() as userAttributeValueModel.Record[]

        expect(attributeValues).toStrictEqual([])

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
      },
    )

    test(
      'should throw error if sessionId is invalid',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.NAMES_IS_REQUIRED = true as unknown as string

        await insertUsers(db)

        const res = await app.request(
          routeConfig.EmbeddedRoute.SignUp.replace(
            ':sessionId',
            '123',
          ),
          {
            method: 'POST',
            body: JSON.stringify({
              email: 'test1@email.com',
              password: 'Password1!',
              firstName: 'John',
              lastName: 'Doe',
            }),
          },
          mock(db),
        )

        expect(res.status).toBe(404)
        expect(await res.text()).toStrictEqual(messageConfig.RequestError.WrongSessionId)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.NAMES_IS_REQUIRED = false as unknown as string
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
      'should throw error if sign up is disabled',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_SIGN_UP = false as unknown as string

        const { res } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
          },
        )

        expect(res.status).toBe(400)
        expect(await res.text()).toStrictEqual(messageConfig.ConfigError.SignUpNotEnabled)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_SIGN_UP = true as unknown as string
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
