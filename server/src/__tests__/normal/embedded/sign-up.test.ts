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

const sendSignUpRequestWithoutInsertUsers = async (
  db: Database,
  sessionId: string,
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
  return res
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
      INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo", "unique") values ('test', 1, 0, 0, 0, 0)
    `)
        db.exec(`
      INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "includeInIdTokenBody", "includeInUserInfo", "unique") values ('test1', 0, 0, 0, 0, 0)
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
              locales: [],
              includeInSignUpForm: true,
              requiredInSignUpForm: false,
              includeInIdTokenBody: false,
              includeInUserInfo: false,
              unique: false,
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

    test(
      'should successfully create user with unique attribute value',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        // Create a unique attribute
        db.exec(`
          INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "unique") values ('employee_id', 1, 1, 1)
        `)

        const {
          res, sessionId,
        } = await sendSignUpRequest(
          db,
          {
            email: 'test1@email.com',
            password: 'Password1!',
            attributes: { 1: 'EMP001' },
          },
        )

        expect(res.status).toBe(200)

        const json = await res.json()
        expect(json).toStrictEqual({
          sessionId,
          success: true,
        })

        const attributeValues = await db.prepare('select * from "user_attribute_value" where "userId" = 2').all() as userAttributeValueModel.Record[]

        expect(attributeValues.length).toBe(1)
        expect(attributeValues[0]).toStrictEqual({
          id: 1,
          userId: 2,
          userAttributeId: 1,
          value: 'EMP001',
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          deletedAt: null,
        })

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should fail to create user with duplicate unique attribute value',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        // Create a unique attribute
        db.exec(`
          INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "unique") values ('employee_id', 1, 1, 1)
        `)

        const appRecord = await getApp(db)
        const initiateRes = await sendInitiateRequest(
          db,
          appRecord,
        )
        const { sessionId } = await initiateRes.json() as { sessionId: string }
        await insertUsers(db)

        // Create first user with employee_id = 'EMP001'
        const res1 = await sendSignUpRequestWithoutInsertUsers(
          db,
          sessionId,
          {
            email: 'test1@email.com',
            password: 'Password1!',
            attributes: { 1: 'EMP001' },
          },
        )

        expect(res1.status).toBe(200)

        // Try to create second user with same employee_id = 'EMP001'
        const res2 = await sendSignUpRequestWithoutInsertUsers(
          db,
          sessionId,
          {
            email: 'test2@email.com',
            password: 'Password1!',
            attributes: { 1: 'EMP001' },
          },
        )

        expect(res2.status).toBe(400)
        expect(await res2.text()).toBe('Duplicate value "EMP001" for attribute "employee_id"')

        // Verify only one user was created (plus the one from insertUsers)
        const users = await db.prepare('select * from "user"').all()
        expect(users.length).toBe(2)

        // Verify only one attribute value exists
        const attributeValues = await db.prepare('select * from "user_attribute_value"').all() as userAttributeValueModel.Record[]
        expect(attributeValues.length).toBe(1)
        expect(attributeValues[0].value).toBe('EMP001')

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should allow multiple users with same non-unique attribute value',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        // Create a non-unique attribute
        db.exec(`
          INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "unique") values ('department', 1, 1, 0)
        `)

        const appRecord = await getApp(db)
        const initiateRes = await sendInitiateRequest(
          db,
          appRecord,
        )
        const { sessionId } = await initiateRes.json() as { sessionId: string }
        await insertUsers(db)

        // Create first user with department = 'Engineering'
        const res1 = await sendSignUpRequestWithoutInsertUsers(
          db,
          sessionId,
          {
            email: 'test1@email.com',
            password: 'Password1!',
            attributes: { 1: 'Engineering' },
          },
        )

        expect(res1.status).toBe(200)

        // Create second user with same department = 'Engineering'
        const res2 = await sendSignUpRequestWithoutInsertUsers(
          db,
          sessionId,
          {
            email: 'test2@email.com',
            password: 'Password1!',
            attributes: { 1: 'Engineering' },
          },
        )

        expect(res2.status).toBe(200)

        // Verify both users were created (plus the one from insertUsers)
        const users = await db.prepare('select * from "user"').all()
        expect(users.length).toBe(3)

        // Verify both attribute values exist with same value
        const attributeValues = await db.prepare('select * from "user_attribute_value"').all() as userAttributeValueModel.Record[]
        expect(attributeValues.length).toBe(2)
        expect(attributeValues[0].value).toBe('Engineering')
        expect(attributeValues[1].value).toBe('Engineering')

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should handle mixed unique and non-unique attributes correctly',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        // Create a unique attribute and a non-unique attribute
        db.exec(`
          INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "unique") values ('employee_id', 1, 1, 1)
        `)
        db.exec(`
          INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "unique") values ('department', 1, 1, 0)
        `)

        const appRecord = await getApp(db)
        const initiateRes = await sendInitiateRequest(
          db,
          appRecord,
        )
        const { sessionId } = await initiateRes.json() as { sessionId: string }
        await insertUsers(db)

        // Create first user
        const res1 = await sendSignUpRequestWithoutInsertUsers(
          db,
          sessionId,
          {
            email: 'test1@email.com',
            password: 'Password1!',
            attributes: {
              1: 'EMP001',
              2: 'Engineering',
            },
          },
        )

        expect(res1.status).toBe(200)

        // Create second user with different employee_id but same department
        const res2 = await sendSignUpRequestWithoutInsertUsers(
          db,
          sessionId,
          {
            email: 'test2@email.com',
            password: 'Password1!',
            attributes: {
              1: 'EMP002',
              2: 'Engineering',
            },
          },
        )

        expect(res2.status).toBe(200)

        // Try to create third user with duplicate employee_id
        const res3 = await sendSignUpRequestWithoutInsertUsers(
          db,
          sessionId,
          {
            email: 'test3@email.com',
            password: 'Password1!',
            attributes: {
              1: 'EMP001',
              2: 'Sales',
            },
          },
        )

        expect(res3.status).toBe(400)
        expect(await res3.text()).toBe('Duplicate value "EMP001" for attribute "employee_id"')

        // Verify only two users were created (plus the one from insertUsers)
        const users = await db.prepare('select * from "user"').all()
        expect(users.length).toBe(3)

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )

    test(
      'should allow same user to keep their unique attribute value',
      async () => {
        process.env.EMBEDDED_AUTH_ORIGINS = ['http://localhost:3000'] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = true as unknown as string

        // Create a unique attribute
        db.exec(`
          INSERT INTO "user_attribute" (name, "includeInSignUpForm", "requiredInSignUpForm", "unique") values ('employee_id', 1, 1, 1)
        `)

        const appRecord = await getApp(db)
        const initiateRes = await sendInitiateRequest(
          db,
          appRecord,
        )
        const { sessionId } = await initiateRes.json() as { sessionId: string }
        await insertUsers(db)

        // Create first user with employee_id = 'EMP001'
        const res1 = await sendSignUpRequestWithoutInsertUsers(
          db,
          sessionId,
          {
            email: 'test1@email.com',
            password: 'Password1!',
            attributes: { 1: 'EMP001' },
          },
        )

        expect(res1.status).toBe(200)

        // Create second user with different employee_id = 'EMP002'
        const res2 = await sendSignUpRequestWithoutInsertUsers(
          db,
          sessionId,
          {
            email: 'test2@email.com',
            password: 'Password1!',
            attributes: { 1: 'EMP002' },
          },
        )

        expect(res2.status).toBe(200)

        // Verify both users were created
        const users = await db.prepare('select * from "user"').all()
        expect(users.length).toBe(3)

        // Verify both attribute values exist
        const attributeValues = await db.prepare('select * from "user_attribute_value"').all() as userAttributeValueModel.Record[]
        expect(attributeValues.length).toBe(2)
        expect(attributeValues[0].value).toBe('EMP001')
        expect(attributeValues[1].value).toBe('EMP002')

        process.env.EMBEDDED_AUTH_ORIGINS = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['email', 'otp'] as unknown as string
        process.env.ENABLE_USER_ATTRIBUTE = false as unknown as string
      },
    )
  },
)
