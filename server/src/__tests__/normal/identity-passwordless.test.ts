import {
  afterEach, beforeEach, describe, expect, Mock, test,
  vi,
} from 'vitest'
import { Database } from 'better-sqlite3'
import {
  migrate,
  mockedKV,
  mock,
  fetchMock,
} from 'tests/mock'
import {
  adapterConfig, messageConfig, routeConfig,
} from 'configs'
import { disableUser } from 'tests/util'
import {
  insertUsers, getApp, postAuthorizeBody,
} from 'tests/identity'
import app from 'index'
import { userModel } from 'models'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

export const prepareFollowUpBody = async (db: Database) => {
  const appRecord = await getApp(db)
  const body = {
    ...(await postAuthorizeBody(appRecord)),
    email: 'test@email.com',
  }

  const res = await app.request(
    routeConfig.IdentityRoute.AuthorizePasswordless,
    {
      method: 'POST', body: JSON.stringify(body),
    },
    mock(db),
  )

  const json = await res.json() as { code: string }
  return {
    code: json.code,
    locale: 'en',
  }
}

describe(
  'post /authorize-passwordless',
  () => {
    test(
      'should redirect to passwordless verify page',
      async () => {
        process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string

        const appRecord = await getApp(db)
        await insertUsers(db)

        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizePasswordless,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )

        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.PasswordlessVerify,
        })
        const { code } = json as { code: string }
        const codeStore = JSON.parse(await mockedKV.get(`AC-${code}`) ?? '')
        expect(codeStore.appId).toBe(1)
        expect(codeStore.user.authId).toBe('1-1-1-1')
        expect(codeStore.appName).toBe(appRecord.name)
        expect(codeStore.request.clientId).toBe(appRecord.clientId)

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should create a new user if user does not exist',
      async () => {
        process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string

        const appRecord = await getApp(db)

        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizePasswordless,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )

        const user = await db.prepare('SELECT * FROM "user" WHERE email = ?').get('test@email.com') as userModel.Raw
        expect(user).toBeDefined()
        expect(user?.email).toBe('test@email.com')
        expect(user?.password).toBeNull()

        const json = await res.json()
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
          nextPage: routeConfig.View.PasswordlessVerify,
        })
        const { code } = json as { code: string }
        const codeStore = JSON.parse(await mockedKV.get(`AC-${code}`) ?? '')
        expect(codeStore.appId).toBe(1)
        expect(codeStore.user.authId).toBeTypeOf('string')
        expect(codeStore.appName).toBe(appRecord.name)
        expect(codeStore.request.clientId).toBe(appRecord.clientId)

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should create a new user for an org',
      async () => {
        process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string

        const appRecord = await getApp(db)

        await db.prepare('INSERT INTO "org" (name, slug, "allowPublicRegistration", "onlyUseForBrandingOverride") VALUES (?, ?, ?, ?)').run(
          'test',
          'test',
          1,
          0,
        )

        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
          org: 'test',
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizePasswordless,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(200)

        const user = await db.prepare('SELECT * FROM "user" WHERE email = ?').get('test@email.com') as userModel.Raw
        expect(user).toBeDefined()
        expect(user?.email).toBe('test@email.com')
        expect(user?.password).toBeNull()
        expect(user?.orgSlug).toBe('test')

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should throw error if scope is not provided',
      async () => {
        process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string

        const appRecord = await getApp(db)
        await insertUsers(db)

        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
          scope: '',
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizePasswordless,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )

        expect(res.status).toBe(400)
        const json = await res.json() as { constraints: { arrayMinSize: string } }[]
        expect(json[0].constraints).toStrictEqual({ arrayMinSize: 'scopes must contain at least 1 elements' })

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should throw error if user is disabled',
      async () => {
        process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string

        const appRecord = await getApp(db)
        await insertUsers(db)
        await disableUser(db)

        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizePasswordless,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )

        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.UserDisabled)

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should throw error if feature is disabled',
      async () => {
        const appRecord = await getApp(db)
        await insertUsers(db)

        const body = {
          ...(await postAuthorizeBody(appRecord)),
          email: 'test@email.com',
        }

        const res = await app.request(
          routeConfig.IdentityRoute.AuthorizePasswordless,
          {
            method: 'POST', body: JSON.stringify(body),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )
  },
)

describe(
  'post /send-passwordless-code',
  () => {
    test(
      'should send passwordless code',
      async () => {
        process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string

        await insertUsers(
          db,
          false,
        )

        const body = await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.SendPasswordlessCode,
          {
            method: 'POST',
            body: JSON.stringify({
              code: body.code,
              locale: 'en',
            }),
          },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({ success: true })

        expect((await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordlessCode}-${body.code}`) ?? '').length).toBe(6)

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should throw error if auth code is wrong',
      async () => {
        process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string
        await insertUsers(
          db,
          false,
        )

        await prepareFollowUpBody(db)

        const res = await app.request(
          routeConfig.IdentityRoute.SendPasswordlessCode,
          {
            method: 'POST',
            body: JSON.stringify({
              code: 'abc',
              locale: 'en',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should throw error if email mfa is locked',
      async () => {
        process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string
        process.env.EMAIL_MFA_EMAIL_THRESHOLD = 1 as unknown as string

        await insertUsers(
          db,
          false,
        )

        const body = await prepareFollowUpBody(db)

        await mockedKV.put(
          `${adapterConfig.BaseKVKey.EmailMfaEmailAttempts}-1`,
          '1',
        )

        const res = await app.request(
          routeConfig.IdentityRoute.SendPasswordlessCode,
          {
            method: 'POST',
            body: JSON.stringify({
              code: body.code,
              locale: 'en',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.EmailMfaLocked)

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
        process.env.EMAIL_MFA_EMAIL_THRESHOLD = 10 as unknown as string
      },
    )

    test(
      'should throw error if feature is disabled',
      async () => {
        process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string
        await insertUsers(
          db,
          false,
        )

        const body = await prepareFollowUpBody(db)

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string

        const res = await app.request(
          routeConfig.IdentityRoute.SendPasswordlessCode,
          {
            method: 'POST',
            body: JSON.stringify({
              code: body.code,
              locale: 'en',
            }),
          },
          mock(db),
        )

        expect(res.status).toBe(400)
      },
    )
  },
)

describe(
  'post /process-passwordless-code',
  () => {
    test(
      'could use original code',
      async () => {
        process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = [] as unknown as string

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })

        global.fetch = mockFetch as Mock

        await insertUsers(
          db,
          false,
        )

        const requestBody = await prepareFollowUpBody(db)
        await app.request(
          routeConfig.IdentityRoute.SendPasswordlessCode,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )

        const mfaCode = await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordlessCode}-${requestBody.code}`)
        expect(mfaCode?.length).toBe(6)
        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(body).toContain(mfaCode)

        global.fetch = fetchMock

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessPasswordlessCode,
          {
            method: 'POST',
            body: JSON.stringify({
              code: requestBody.code,
              locale: requestBody.locale,
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordlessCode}-${requestBody.code}`),
            }),
          },
          mock(db),
        )
        const json = await res.json() as { code: string }
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordlessCode}-${json.code}`)).toBe('1')

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
        process.env.ENFORCE_ONE_MFA_ENROLLMENT = ['otp', 'email'] as unknown as string
      },
    )

    test(
      'should throw error if feature not enabled',
      async () => {
        await insertUsers(
          db,
          false,
        )

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string

        const requestBody = await prepareFollowUpBody(db)

        await app.request(
          routeConfig.IdentityRoute.SendPasswordlessCode,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessPasswordlessCode,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'should throw error if auth code is wrong',
      async () => {
        process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string

        await insertUsers(
          db,
          false,
        )

        const requestBody = await prepareFollowUpBody(db)

        await app.request(
          routeConfig.IdentityRoute.SendPasswordlessCode,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessPasswordlessCode,
          {
            method: 'POST',
            body: JSON.stringify({
              code: 'abc',
              locale: requestBody.locale,
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.PasswordlessCode}-${requestBody.code}`),
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
      },
    )

    test(
      'should throw error if mfa code is wrong',
      async () => {
        process.env.ENABLE_PASSWORDLESS_SIGN_IN = true as unknown as string

        await insertUsers(
          db,
          false,
        )

        const requestBody = await prepareFollowUpBody(db)

        await app.request(
          routeConfig.IdentityRoute.SendPasswordlessCode,
          {
            method: 'POST',
            body: JSON.stringify({ ...requestBody }),
          },
          mock(db),
        )

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessPasswordlessCode,
          {
            method: 'POST',
            body: JSON.stringify({
              code: requestBody.code,
              locale: requestBody.locale,
              mfaCode: 'abcdefgh',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongCode)

        process.env.ENABLE_PASSWORDLESS_SIGN_IN = false as unknown as string
      },
    )
  },
)
