import {
  afterEach, beforeEach, describe, expect, Mock, test,
  vi,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { Scope } from 'shared'
import app from 'index'
import {
  adapterConfig, localeConfig, routeConfig,
} from 'configs'
import {
  mockedKV,
  migrate, mock,
  fetchMock,
} from 'tests/mock'
import {
  userAppConsentModel, userModel,
} from 'models'
import {
  attachIndividualScopes,
  dbTime, disableUser, enrollEmailMfa, enrollOtpMfa, getS2sToken,
} from 'tests/util'

let db: Database

const insertUsers = async () => {
  await db.exec(`
    INSERT INTO "user"
    ("authId", locale, email, "googleId", password, "firstName", "lastName")
    values ('1-1-1-1', 'en', 'test@email.com', null, '$2a$10$3HtEAf8YcN94V4GOR6ZBNu9tmoIflmEOqb9hUf0iqS4OjYVKe.9/C', null, null)
  `)
  await db.exec(`
    INSERT INTO "user"
    ("authId", locale, email, "googleId", password, "firstName", "lastName")
    values ('1-1-1-2', 'fr', 'test1@email.com', null, '$2a$10$Pv1pI5pskwwUXA9hiu3k5.E0Lk6x8PxAyIAhJz3nBZTRkGZTxfPyy', null, null)
  `)
  await db.exec(`
    INSERT INTO user_app_consent
    ("userId", "appId")
    values (1, 1)
  `)
  await db.exec(`
    INSERT INTO user_role
    ("userId", "roleId")
    values (2, 1)
  `)
}

const user1 = {
  id: 1,
  authId: '1-1-1-1',
  googleId: null,
  email: 'test@email.com',
  locale: 'en',
  emailVerified: false,
  otpVerified: false,
  mfaTypes: [],
  isActive: true,
  loginCount: 0,
  firstName: null,
  lastName: null,
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

const user2 = {
  id: 2,
  authId: '1-1-1-2',
  googleId: null,
  email: 'test1@email.com',
  locale: 'fr',
  emailVerified: false,
  otpVerified: false,
  mfaTypes: [],
  isActive: true,
  loginCount: 0,
  firstName: null,
  lastName: null,
  createdAt: dbTime,
  updatedAt: dbTime,
  deletedAt: null,
}

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await mockedKV.empty()
  await db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiUsers

describe(
  'get all',
  () => {
    test(
      'should return all users',
      async () => {
        await insertUsers()

        const res = await app.request(
          BaseRoute,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { users: userModel.Record[] }
        expect(json.users).toStrictEqual([user1, user2])
      },
    )

    test(
      'could get users by pagination',
      async () => {
        await insertUsers()
        await db.exec(`
          INSERT INTO "user"
          ("authId", locale, email, "googleId", password, "firstName", "lastName")
          values ('1-1-1-3', 'en', 'test2@email.com', null, '$2a$10$Pv1pI5pskwwUXA9hiu3k5.E0Lk6x8PxAyIAhJz3nBZTRkGZTxfPyy', 'first', 'last')
        `)
        await db.exec(`
          INSERT INTO "user"
          ("authId", locale, email, "googleId", password, "firstName", "lastName")
          values ('1-1-1-4', 'en', 'test3@email.com', null, '$2a$10$Pv1pI5pskwwUXA9hiu3k5.E0Lk6x8PxAyIAhJz3nBZTRkGZTxfPyy', 'another', 'one')
        `)
        await db.exec(`
          INSERT INTO "user"
          ("authId", locale, email, "googleId", password, "firstName", "lastName")
          values ('1-1-1-5', 'en', 'test4@email.com', null, '$2a$10$Pv1pI5pskwwUXA9hiu3k5.E0Lk6x8PxAyIAhJz3nBZTRkGZTxfPyy', 'other', 'name')
        `)

        const res = await app.request(
          `${BaseRoute}?page_size=2&page_number=1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json()
        expect(json).toStrictEqual({
          users: [user1, user2],
          count: 5,
        })

        const res1 = await app.request(
          `${BaseRoute}?page_size=2&page_number=2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json1 = await res1.json()
        expect(json1).toStrictEqual({
          users: [{
            ...user1,
            id: 3,
            authId: '1-1-1-3',
            email: 'test2@email.com',
            firstName: 'first',
            lastName: 'last',
          }, {
            ...user1,
            id: 4,
            authId: '1-1-1-4',
            email: 'test3@email.com',
            firstName: 'another',
            lastName: 'one',
          }],
          count: 5,
        })

        const res2 = await app.request(
          `${BaseRoute}?page_size=2&page_number=1&search=test`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json2 = await res2.json()
        expect(json2).toStrictEqual({
          users: [user1, user2],
          count: 5,
        })

        const res3 = await app.request(
          `${BaseRoute}?page_size=2&page_number=1&search=test1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json3 = await res3.json()
        expect(json3).toStrictEqual({
          users: [user2],
          count: 1,
        })

        const res4 = await app.request(
          `${BaseRoute}?page_size=2&page_number=1&search=another`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json4 = await res4.json()
        expect(json4).toStrictEqual({
          users: [{
            ...user1,
            id: 4,
            authId: '1-1-1-4',
            email: 'test3@email.com',
            firstName: 'another',
            lastName: 'one',
          }],
          count: 1,
        })

        const res5 = await app.request(
          `${BaseRoute}?page_size=2&page_number=1&search=la`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json5 = await res5.json()
        expect(json5).toStrictEqual({
          users: [{
            ...user1,
            id: 3,
            authId: '1-1-1-3',
            email: 'test2@email.com',
            firstName: 'first',
            lastName: 'last',
          }],
          count: 1,
        })
      },
    )

    test(
      'should return all users with read_user scope',
      async () => {
        await insertUsers()
        await attachIndividualScopes(db)

        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadUser,
              )}`,
            },
          },
          mock(db),
        )
        const json = await res.json() as { users: userModel.Record[] }
        expect(json.users).toStrictEqual([user1, user2])
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        const res = await app.request(
          BaseRoute,
          {
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.WriteUser,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(401)

        const res1 = await app.request(
          BaseRoute,
          {},
          mock(db),
        )
        expect(res1.status).toBe(401)
      },
    )
  },
)

describe(
  'get by id',
  () => {
    test(
      'should return user by authId 1-1-1-1',
      async () => {
        await insertUsers()

        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        const json = await res.json() as { user: userModel.Record }
        expect(json.user).toStrictEqual({
          ...user1,
          roles: [],
        })
      },
    )

    test(
      'should return user by authId 1-1-1-2',
      async () => {
        await insertUsers()

        const res = await app.request(
          `${BaseRoute}/1-1-1-2`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { user: userModel.Record }
        expect(json.user).toStrictEqual({
          ...user2,
          roles: ['super_admin'],
        })
      },
    )

    test(
      'should return 404 when can not find user by id',
      async () => {
        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )

        expect(res.status).toBe(404)
      },
    )
  },
)

describe(
  'get locked ips',
  () => {
    test(
      'should return all locked ips',
      async () => {
        await insertUsers()
        await mockedKV.put(
          `${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com-1.1.1.1`,
          '1',
        )
        await mockedKV.put(
          `${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com-1.1.1.2`,
          '2',
        )

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/locked-ips`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { lockedIPs: string[] }
        expect(json.lockedIPs).toStrictEqual(['1.1.1.1', '1.1.1.2'])
      },
    )

    test(
      'placeholder test for user has no email',
      async () => {
        await insertUsers()
        await db.prepare('update "user" set email = ?').run(null)
        const res = await app.request(
          `${BaseRoute}/1-1-1-1/locked-ips`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { lockedIPs: string[] }
        expect(json.lockedIPs).toStrictEqual([])
      },
    )
  },
)

describe(
  'delete locked ips',
  () => {
    test(
      'should delete all locked ips',
      async () => {
        await insertUsers()
        mockedKV.put(
          `${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com-1.1.1.1`,
          '1',
        )
        mockedKV.put(
          `${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com-1.1.1.2`,
          '2',
        )

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/locked-ips`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )

        expect(res.status).toBe(204)

        const checkRes = await app.request(
          `${BaseRoute}/1-1-1-1/locked-ips`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const checkJson = await checkRes.json() as { lockedIPs: string[] }
        expect(checkJson.lockedIPs).toStrictEqual([])
      },
    )

    test(
      'placeholder test for user has no email',
      async () => {
        await insertUsers()
        db.prepare('update "user" set email = ?').run(null)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/locked-ips`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(204)
      },
    )
  },
)

describe(
  'update',
  () => {
    test(
      'should update user',
      async () => {
        await insertUsers()
        await db.prepare('insert into role (name) values (?)').run('test')

        const updateObj = {
          locale: 'fr',
          isActive: false,
          firstName: 'First',
          lastName: 'Last',
          roles: ['test'],
        }
        const res = await app.request(
          `${BaseRoute}/1-1-1-2`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          user: {
            ...user2,
            ...updateObj,
          },
        })

        const res1 = await app.request(
          `${BaseRoute}/1-1-1-2`,
          {
            method: 'PUT',
            body: JSON.stringify({ isActive: true }),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json1 = await res1.json()

        expect(json1).toStrictEqual({
          user: {
            ...user2,
            ...updateObj,
            isActive: true,
          },
        })
      },
    )

    test(
      'should throw error if no user found',
      async () => {
        await insertUsers()
        await db.prepare('insert into role (name) values (?)').run('test')

        const res = await app.request(
          `${BaseRoute}/1-1-1-3`,
          {
            method: 'PUT',
            body: JSON.stringify({}),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(localeConfig.Error.NoUser)
      },
    )

    test(
      'return when nothing updated',
      async () => {
        await insertUsers()
        await db.prepare('insert into role (name) values (?)').run('test')

        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {
            method: 'PUT',
            body: JSON.stringify({}),
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          user: {
            ...user1,
            roles: [],
          },
        })
      },
    )

    test(
      'should update user with write_user scope',
      async () => {
        await insertUsers()
        await attachIndividualScopes(db)

        const updateObj = {
          firstName: 'First',
          lastName: 'Last',
        }
        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.WriteUser,
              )}`,
            },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          user: {
            ...user1,
            ...updateObj,
            roles: [],
          },
        })
      },
    )

    test(
      'should return 401 without proper scope',
      async () => {
        await insertUsers()
        await attachIndividualScopes(db)

        const updateObj = { locale: 'fr' }
        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
            headers: {
              Authorization: `Bearer ${await getS2sToken(
                db,
                Scope.ReadUser,
              )}`,
            },
          },
          mock(db),
        )
        expect(res.status).toBe(401)

        const res1 = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {
            method: 'PUT',
            body: JSON.stringify(updateObj),
          },
          mock(db),
        )
        expect(res1.status).toBe(401)
      },
    )
  },
)

describe(
  'send verification email',
  () => {
    test(
      'should send email',
      async () => {
        await insertUsers()

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: true })
        })
        global.fetch = mockFetch as Mock

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/verify-email`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({ success: true })

        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`) ?? ''
        expect(code.length).toBe(8)

        expect(mockFetch).toBeCalledTimes(1)

        const callArgs = mockFetch.mock.calls[0] as any[]
        const body = (callArgs[1] as unknown as { body: string }).body
        expect(callArgs[0]).toBe('https://api.sendgrid.com/v3/mail/send')
        expect(body).toContain(code)
        expect(body).toContain(localeConfig.emailVerificationEmail.verify.en)
        expect(body).toContain('/identity/v1/verify-email?id=1-1-1-1&amp;locale=en')

        global.fetch = fetchMock
      },
    )

    test(
      'pass through if failed to send email',
      async () => {
        await insertUsers()

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: false })
        })
        global.fetch = mockFetch as Mock

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/verify-email`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({ success: true })

        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`) ?? ''
        expect(code.length).toBeFalsy()
        global.fetch = fetchMock
      },
    )

    test(
      'throw error if no email sender set',
      async () => {
        process.env.SENDGRID_API_KEY = ''
        process.env.SENDGRID_SENDER_ADDRESS = ''

        await insertUsers()

        const mockFetch = vi.fn(async () => {
          return Promise.resolve({ ok: false })
        })
        global.fetch = mockFetch as Mock

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/verify-email`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.NoEmailSender)

        const code = await mockedKV.get(`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`) ?? ''
        expect(code).toBeFalsy()
        global.fetch = fetchMock
        process.env.SENDGRID_API_KEY = 'abc'
        process.env.SENDGRID_SENDER_ADDRESS = 'app@valuemelody.com'
      },
    )

    test(
      'should throw error if email already verified',
      async () => {
        await insertUsers()
        await db.prepare('update "user" set "emailVerified" = ?').run(1)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/verify-email`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.EmailAlreadyVerified)
      },
    )
  },
)

describe(
  'delete',
  () => {
    test(
      'should delete user',
      async () => {
        await insertUsers()

        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(204)

        const checkRes = await app.request(
          `${BaseRoute}/1-1-1-1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        expect(checkRes.status).toBe(404)
      },
    )

    test(
      'should throw error if can not find user',
      async () => {
        await insertUsers()

        const res = await app.request(
          `${BaseRoute}/1-1-1-3`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(localeConfig.Error.NoUser)
      },
    )
  },
)

describe(
  'get user app consents',
  () => {
    test(
      'should return user app consents',
      async () => {
        await insertUsers()

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/consented-apps`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const json = await res.json() as { consentedApps: userAppConsentModel.ConsentedApp[] }
        expect(json.consentedApps).toStrictEqual([{
          appId: 1,
          appName: 'Admin Panel (SPA)',
        }])
      },
    )

    test(
      'should throw error if user not found',
      async () => {
        await insertUsers()

        const res = await app.request(
          `${BaseRoute}/1-1-1-3/consented-apps`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(localeConfig.Error.NoUser)
      },
    )
  },
)

describe(
  'delete app consent',
  () => {
    test(
      'should delete app consent',
      async () => {
        await insertUsers()

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/consented-apps/1`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(204)

        const checkRes = await app.request(
          `${BaseRoute}/1-1-1-1/consented-apps`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const checkJson = await checkRes.json() as { consentedApps: userAppConsentModel.ConsentedApp[] }
        expect(checkJson.consentedApps).toStrictEqual([])
      },
    )
  },
)

describe(
  'enroll email mfa',
  () => {
    const enrollAndCheckUser = async () => {
      await insertUsers()

      const res = await app.request(
        `${BaseRoute}/1-1-1-1/email-mfa`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
        },
        mock(db),
      )
      expect(res.status).toBe(204)

      const userRes = await app.request(
        `${BaseRoute}/1-1-1-1`,
        { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
        mock(db),
      )
      return userRes
    }

    test(
      'should enroll email mfa',
      async () => {
        const userRes = await enrollAndCheckUser()

        const userJson = await userRes.json() as { user: userModel.Record }
        expect(userJson.user.mfaTypes).toStrictEqual(['email'])
      },
    )

    test(
      'if email is enforced by config',
      async () => {
        global.process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string
        const userRes = await enrollAndCheckUser()

        const userJson = await userRes.json() as { user: userModel.Record }
        expect(userJson.user.mfaTypes).toStrictEqual([])
        global.process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'if user already enrolled with email',
      async () => {
        await insertUsers()
        await db.prepare('update "user" set "mfaTypes" = ?').run('email')

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/email-mfa`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(204)

        const userRes = await app.request(
          `${BaseRoute}/1-1-1-1`,
          { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
          mock(db),
        )
        const userJson = await userRes.json() as { user: userModel.Record }
        expect(userJson.user.mfaTypes).toStrictEqual(['email'])
      },
    )

    test(
      'should throw error for wrong id',
      async () => {
        await insertUsers()

        const res = await app.request(
          `${BaseRoute}/1-1-1-3/email-mfa`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(localeConfig.Error.NoUser)
      },
    )

    test(
      'should throw error for inactive user',
      async () => {
        await insertUsers()
        await disableUser(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/email-mfa`,
          {
            method: 'POST',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.UserDisabled)
      },
    )
  },
)

describe(
  'Unenroll email mfa',
  () => {
    const handleUnenrollRequest = async () => {
      const res = await app.request(
        `${BaseRoute}/1-1-1-1/email-mfa`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
        },
        mock(db),
      )
      expect(res.status).toBe(204)

      const userRes = await app.request(
        `${BaseRoute}/1-1-1-1`,
        { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
        mock(db),
      )

      const userJson = await userRes.json() as { user: userModel.Record }
      expect(userJson.user.mfaTypes).toStrictEqual([])
    }

    test(
      'should unenroll email mfa',
      async () => {
        await insertUsers()
        await enrollEmailMfa(db)

        await handleUnenrollRequest()
      },
    )

    test(
      'if user is not enrolled',
      async () => {
        insertUsers()
        await handleUnenrollRequest()
      },
    )

    test(
      'should throw error for wrong id',
      async () => {
        await insertUsers()
        await enrollEmailMfa(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-3/email-mfa`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(404)
        expect(await res.text()).toBe(localeConfig.Error.NoUser)
      },
    )

    test(
      'should throw error for inactive user',
      async () => {
        await insertUsers()
        await enrollEmailMfa(db)
        await disableUser(db)

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/email-mfa`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(localeConfig.Error.UserDisabled)
      },
    )
  },
)

describe(
  'enroll otp mfa',
  () => {
    const enrollAndCheckUser = async () => {
      await insertUsers()

      await app.request(
        `${BaseRoute}/1-1-1-1/otp-mfa`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
        },
        mock(db),
      )

      const userRes = await app.request(
        `${BaseRoute}/1-1-1-1`,
        { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
        mock(db),
      )
      return userRes
    }

    test(
      'should enroll otp mfa',
      async () => {
        const userRes = await enrollAndCheckUser()

        const userJson = await userRes.json() as { user: userModel.Record }
        expect(userJson.user.mfaTypes).toStrictEqual(['otp'])
      },
    )

    test(
      'if otp is enforced by config',
      async () => {
        global.process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        const userRes = await enrollAndCheckUser()

        const userJson = await userRes.json() as { user: userModel.Record }
        expect(userJson.user.mfaTypes).toStrictEqual([])
        global.process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
      },
    )
  },
)

describe(
  'Unenroll otp mfa',
  () => {
    const handleUnenrollCheck = async () => {
      const res = await app.request(
        `${BaseRoute}/1-1-1-1/otp-mfa`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${await getS2sToken(db)}` },
        },
        mock(db),
      )
      expect(res.status).toBe(204)

      const userRes = await app.request(
        `${BaseRoute}/1-1-1-1`,
        { headers: { Authorization: `Bearer ${await getS2sToken(db)}` } },
        mock(db),
      )

      const userJson = await userRes.json() as { user: userModel.Record }
      expect(userJson.user.mfaTypes).toStrictEqual([])
    }

    test(
      'should unenroll otp mfa',
      async () => {
        await insertUsers()
        await enrollOtpMfa(db)

        await handleUnenrollCheck()
      },
    )

    test(
      'If user is not enrolled',
      async () => {
        await insertUsers()
        await handleUnenrollCheck()
      },
    )
  },
)
