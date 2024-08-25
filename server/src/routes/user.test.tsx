import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import app from 'index'
import {
  adapterConfig, routeConfig,
} from 'configs'
import {
  kv,
  migrate, mock,
} from 'tests/mock'
import { userModel } from 'models'
import { dbTime } from 'tests/seed'
import { ConsentedApp } from 'models/userAppConsent'

let db: Database

const insertUsers = () => {
  db.exec(`
    INSERT INTO user
    (authId, locale, email, googleId, password, firstName, lastName)
    values ('1-1-1-1', 'en', 'test@email.com', null, '$2a$10$3HtEAf8YcN94V4GOR6ZBNu9tmoIflmEOqb9hUf0iqS4OjYVKe.9/C', null, null)
  `)
  db.exec(`
    INSERT INTO user
    (authId, locale, email, googleId, password, firstName, lastName)
    values ('1-1-1-2', 'fr', 'test1@email.com', null, '$2a$10$Pv1pI5pskwwUXA9hiu3k5.E0Lk6x8PxAyIAhJz3nBZTRkGZTxfPyy', null, null)
  `)
  db.exec(`
    INSERT INTO user_app_consent
    (userId, appId)
    values (1, 1)
  `)
  db.exec(`
    INSERT INTO user_role
    (userId, roleId)
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

afterEach(() => {
  db.close()
})

const BaseRoute = routeConfig.InternalRoute.ApiUsers

describe(
  'get all',
  () => {
    test(
      'should return all users',
      async () => {
        insertUsers()

        const res = await app.request(
          BaseRoute,
          {},
          mock(db),
        )
        const json = await res.json() as { users: userModel.Record[] }
        expect(json.users).toStrictEqual([user1, user2])
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
        insertUsers()

        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {},
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
        insertUsers()

        const res = await app.request(
          `${BaseRoute}/1-1-1-2`,
          {},
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
          {},
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
        insertUsers()
        kv[`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com-1.1.1.1`] = '1'
        kv[`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com-1.1.1.2`] = '2'

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/locked-ips`,
          {},
          mock(db),
        )
        const json = await res.json() as { lockedIPs: string[] }
        expect(json.lockedIPs).toStrictEqual(['1.1.1.1', '1.1.1.2'])
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
        insertUsers()
        kv[`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com-1.1.1.1`] = '1'
        kv[`${adapterConfig.BaseKVKey.FailedLoginAttempts}-test@email.com-1.1.1.2`] = '2'

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/locked-ips`,
          { method: 'DELETE' },
          mock(db),
        )

        expect(res.status).toBe(204)

        const checkRes = await app.request(
          `${BaseRoute}/1-1-1-1/locked-ips`,
          {},
          mock(db),
        )
        const checkJson = await checkRes.json() as { lockedIPs: string[] }
        expect(checkJson.lockedIPs).toStrictEqual([])
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
        insertUsers()

        const updateObj = {
          locale: 'fr',
          isActive: false,
          firstName: 'First',
          lastName: 'Last',
          roles: ['super_admin'],
        }
        const res = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {
            method: 'PUT', body: JSON.stringify(updateObj),
          },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({
          user: {
            ...user1,
            ...updateObj,
          },
        })
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
        insertUsers()

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/verify-email`,
          { method: 'POST' },
          mock(db),
        )
        const json = await res.json()

        expect(json).toStrictEqual({ success: true })

        expect(kv[`${adapterConfig.BaseKVKey.EmailVerificationCode}-1`].length).toBe(8)
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
          { method: 'DELETE' },
          mock(db),
        )
        expect(res.status).toBe(204)

        const checkRes = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {},
          mock(db),
        )
        expect(checkRes.status).toBe(404)
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
        insertUsers()

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/consented-apps`,
          {},
          mock(db),
        )
        const json = await res.json() as { consentedApps: ConsentedApp[] }
        expect(json.consentedApps).toStrictEqual([{
          appId: 1,
          appName: 'Admin Panel (SPA)',
        }])
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
          { method: 'DELETE' },
          mock(db),
        )
        expect(res.status).toBe(204)

        const checkRes = await app.request(
          `${BaseRoute}/1-1-1-1/consented-apps`,
          {},
          mock(db),
        )
        const checkJson = await checkRes.json() as { consentedApps: ConsentedApp[] }
        expect(checkJson.consentedApps).toStrictEqual([])
      },
    )
  },
)

describe(
  'enroll email mfa',
  () => {
    test(
      'should enroll email mfa',
      async () => {
        insertUsers()

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/email-mfa`,
          { method: 'POST' },
          mock(db),
        )
        expect(res.status).toBe(204)

        const userRes = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {},
          mock(db),
        )

        const userJson = await userRes.json() as { user: userModel.Record }
        expect(userJson.user.mfaTypes).toStrictEqual(['email'])
      },
    )
  },
)

describe(
  'Unenroll email mfa',
  () => {
    test(
      'should unenroll email mfa',
      async () => {
        insertUsers()

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/email-mfa`,
          { method: 'DELETE' },
          mock(db),
        )
        expect(res.status).toBe(204)

        const userRes = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {},
          mock(db),
        )

        const userJson = await userRes.json() as { user: userModel.Record }
        expect(userJson.user.mfaTypes).toStrictEqual([])
      },
    )
  },
)

describe(
  'enroll otp mfa',
  () => {
    test(
      'should enroll otp mfa',
      async () => {
        insertUsers()

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/otp-mfa`,
          { method: 'POST' },
          mock(db),
        )
        expect(res.status).toBe(204)

        const userRes = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {},
          mock(db),
        )

        const userJson = await userRes.json() as { user: userModel.Record }
        expect(userJson.user.mfaTypes).toStrictEqual(['otp'])
      },
    )
  },
)

describe(
  'Unenroll otp mfa',
  () => {
    test(
      'should unenroll otp mfa',
      async () => {
        insertUsers()

        const res = await app.request(
          `${BaseRoute}/1-1-1-1/otp-mfa`,
          { method: 'DELETE' },
          mock(db),
        )
        expect(res.status).toBe(204)

        const userRes = await app.request(
          `${BaseRoute}/1-1-1-1`,
          {},
          mock(db),
        )

        const userJson = await userRes.json() as { user: userModel.Record }
        expect(userJson.user.mfaTypes).toStrictEqual([])
      },
    )
  },
)
