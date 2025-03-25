import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import {
  migrate,
  mockedKV,
} from 'tests/mock'
import {
  adapterConfig, messageConfig, routeConfig,
} from 'configs'
import { disableUser } from 'tests/util'
import {
  insertUsers, postSignInRequest, getApp,
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
  'post /authorize-password',
  () => {
    test(
      'should get auth code after sign in',
      async () => {
        const appRecord = await getApp(db)
        await insertUsers(db)
        const res = await postSignInRequest(
          db,
          appRecord,
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.MfaEnroll,
        })
        const { code } = json as { code: string }
        const codeStore = JSON.parse(await mockedKV.get(`AC-${code}`) ?? '')
        expect(codeStore.appId).toBe(1)
        expect(codeStore.user.authId).toBe('1-1-1-1')
        expect(codeStore.appName).toBe(appRecord.name)
        expect(codeStore.request.clientId).toBe(appRecord.clientId)
      },
    )

    test(
      'redirect to passkey enroll if required',
      async () => {
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = true as unknown as string

        const appRecord = await getApp(db)
        await insertUsers(db)
        const res = await postSignInRequest(
          db,
          appRecord,
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.PasskeyEnroll,
        })

        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ALLOW_PASSKEY_ENROLLMENT = false as unknown as string
      },
    )

    test(
      'redirect to otp mfa if required',
      async () => {
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        const appRecord = await getApp(db)
        await insertUsers(db)

        db.prepare('update "user" set "otpVerified" = 1 where id = 1').run()

        const res = await postSignInRequest(
          db,
          appRecord,
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.OtpMfa,
        })

        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'request with no scopes',
      async () => {
        const appRecord = await getApp(db)
        await insertUsers(db)
        const res = await postSignInRequest(
          db,
          appRecord,
          { scopes: '' },
        )
        expect(res.status).toBe(400)
        const json = await res.json() as {
          constraints: {
            arrayMinSize: string;
          };
        }[]
        expect(json[0].constraints).toStrictEqual({ arrayMinSize: 'scopes must contain at least 1 elements' })
      },
    )

    test(
      'should be blocked if not allowed by config',
      async () => {
        global.process.env.ENABLE_PASSWORD_SIGN_IN = false as unknown as string
        const appRecord = await getApp(db)
        await insertUsers(db)
        const res = await postSignInRequest(
          db,
          appRecord,
        )
        expect(res.status).toBe(400)
        global.process.env.ENABLE_PASSWORD_SIGN_IN = true as unknown as string
      },
    )

    test(
      'should be blocked if passwordless sign in is enabled',
      async () => {
        global.process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string
        const appRecord = await getApp(db)
        await insertUsers(db)
        const res = await postSignInRequest(
          db,
          appRecord,
        )
        expect(res.status).toBe(400)
        global.process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should throw error if user not found',
      async () => {
        const appRecord = await getApp(db)
        await insertUsers(db)
        const res = await postSignInRequest(
          db,
          appRecord,
          { email: 'test1@email.com' },
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(messageConfig.RequestError.NoUser)
      },
    )

    test(
      'should throw error if user disabled',
      async () => {
        const appRecord = await getApp(db)
        await insertUsers(db)
        await disableUser(db)
        const res = await postSignInRequest(
          db,
          appRecord,
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.UserDisabled)
      },
    )

    test(
      'could lock access',
      async () => {
        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 1 as unknown as string
        const appRecord = await getApp(db)
        await insertUsers(db)
        const res = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(res.status).toBe(404)
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com`)).toBe('1')

        const res2 = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(res2.status).toBe(400)

        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 0 as unknown as string
        const res3 = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(res3.status).toBe(404)

        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 1 as unknown as string
      },
    )

    test(
      'could disable account lock',
      async () => {
        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 0 as unknown as string
        const appRecord = await getApp(db)
        await insertUsers(db)
        const res = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(res.status).toBe(404)
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com`)).toBeFalsy()

        const res2 = await postSignInRequest(
          db,
          appRecord,
          { password: 'Password2!' },
        )
        expect(res2.status).toBe(404)
        global.process.env.ACCOUNT_LOCKOUT_THRESHOLD = 0 as unknown as string
      },
    )
  },
)
