import {
  afterEach, beforeEach, describe, expect, test, vi,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { authenticator } from 'otplib'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  adapterConfig, messageConfig, routeConfig,
} from 'configs'
import { userModel } from 'models'
import {
  prepareFollowUpBody, insertUsers,
  getApp, postSignInRequest,
} from 'tests/identity'
import { enrollOtpMfa } from 'tests/util'

let db: Database
const fixedOtpTime = new Date('2026-04-28T12:00:15.000Z')
const totpPeriodMs = 30000

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  vi.useRealTimers()
  await db.close()
  await mockedKV.empty()
})

const generateOtpAtTime = (
  secret: string,
  timestamp: number,
) => {
  const timeScopedAuthenticator = authenticator.clone()
  timeScopedAuthenticator.options = {
    ...timeScopedAuthenticator.options,
    epoch: timestamp,
  }

  return timeScopedAuthenticator.generate(secret)
}

const prepareFollowUpBodyByEmail = async (email: string) => {
  const appRecord = await getApp(db)
  const res = await postSignInRequest(
    db,
    appRecord,
    { email },
  )
  const json = await res.json() as { code: string }
  return {
    code: json.code,
    locale: 'en',
  }
}

const postOtpMfa = (
  body: { code: string; locale: string },
  mfaCode: string,
) => app.request(
  routeConfig.IdentityRoute.ProcessOtpMfa,
  {
    method: 'POST',
    body: JSON.stringify({
      ...body,
      mfaCode,
    }),
  },
  mock(db),
)

const sendCorrectGetOtpMfaSetupReq = async ({ code }: { code?: string } = {}) => {
  const body = await prepareFollowUpBody(db)
  const res = await app.request(
    `${routeConfig.IdentityRoute.OtpMfaSetup}?code=${code ?? body.code}`,
    { method: 'GET' },
    mock(db),
  )

  return { res }
}

const sendCorrectGetProcessOtpMfaReq = async ({ code }: { code?: string } = {}) => {
  const body = await prepareFollowUpBody(db)
  const res = await app.request(
    `${routeConfig.IdentityRoute.ProcessOtpMfa}?code=${code ?? body.code}`,
    { method: 'GET' },
    mock(db),
  )
  return { res }
}

describe(
  'get /otp-mfa-setup',
  () => {
    test(
      'should return otp mfa setup',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const { res } = await sendCorrectGetOtpMfaSetupReq()

        expect(res.status).toBe(200)
        const user = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        expect(await res.json()).toStrictEqual({
          otpSecret: user.otpSecret,
          otpUri: `otpauth://totp/Admin Panel (SPA):test@email.com?secret=${user.otpSecret}&issuer=melody-auth&algorithm=SHA1&digits=6&period=30`,
        })
      },
    )

    test(
      'should throw error if otp already verified',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await db.prepare('update "user" set "otpVerified" = 1 where id = 1').run()

        const { res } = await sendCorrectGetOtpMfaSetupReq()
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.OtpAlreadySet)
      },
    )

    test(
      'should throw error if wrong auth code used',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await prepareFollowUpBody(db)
        const { res } = await sendCorrectGetOtpMfaSetupReq({ code: 'abc' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)
      },
    )
  },
)

describe(
  'get /process-otp-mfa',
  () => {
    test(
      'should return not allow fallback to email mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        const { res } = await sendCorrectGetProcessOtpMfaReq()
        expect(res.status).toBe(200)
        expect(await res.json()).toStrictEqual({ allowFallbackToEmailMfa: false })
      },
    )

    test(
      'should return allow fallback to email mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const { res } = await sendCorrectGetProcessOtpMfaReq()
        expect(res.status).toBe(200)
        expect(await res.json()).toStrictEqual({ allowFallbackToEmailMfa: true })
      },
    )

    test(
      'should throw error if wrong auth code used',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await prepareFollowUpBody(db)
        const { res } = await sendCorrectGetProcessOtpMfaReq({ code: 'abc' })
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)
      },
    )
  },
)

describe(
  'post /process-otp-mfa',
  () => {
    test(
      'should pass otp mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await sendCorrectGetOtpMfaSetupReq()
        const body = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: token,
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
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${json.code}`)).toBe('1')
      },
    )

    test(
      'should accept current time-step otp mfa code',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await sendCorrectGetOtpMfaSetupReq()
        const body = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw

        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(fixedOtpTime)
        const token = generateOtpAtTime(
          currentUser.otpSecret,
          fixedOtpTime.getTime(),
        )

        const res = await postOtpMfa(
          body,
          token,
        )
        expect(res.status).toBe(200)
        const json = await res.json() as { code: string }
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${json.code}`)).toBe('1')
      },
    )

    test(
      'should accept previous and next time-step otp mfa codes',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await sendCorrectGetOtpMfaSetupReq()
        const previousStepBody = await prepareFollowUpBody(db)
        const nextStepBody = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw

        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(fixedOtpTime)
        const previousStepToken = generateOtpAtTime(
          currentUser.otpSecret,
          fixedOtpTime.getTime() - totpPeriodMs,
        )
        const nextStepToken = generateOtpAtTime(
          currentUser.otpSecret,
          fixedOtpTime.getTime() + totpPeriodMs,
        )

        const previousStepRes = await postOtpMfa(
          previousStepBody,
          previousStepToken,
        )
        expect(previousStepRes.status).toBe(200)
        const previousStepJson = await previousStepRes.json() as { code: string }
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${previousStepJson.code}`)).toBe('1')

        const nextStepRes = await postOtpMfa(
          nextStepBody,
          nextStepToken,
        )
        expect(nextStepRes.status).toBe(200)
        const nextStepJson = await nextStepRes.json() as { code: string }
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${nextStepJson.code}`)).toBe('1')
      },
    )

    test(
      'should reject otp mfa codes outside one time-step skew',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await sendCorrectGetOtpMfaSetupReq()
        const pastStepBody = await prepareFollowUpBody(db)
        const futureStepBody = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw

        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(fixedOtpTime)
        const pastStepToken = generateOtpAtTime(
          currentUser.otpSecret,
          fixedOtpTime.getTime() - (totpPeriodMs * 2),
        )
        const futureStepToken = generateOtpAtTime(
          currentUser.otpSecret,
          fixedOtpTime.getTime() + (totpPeriodMs * 2),
        )

        const pastStepRes = await postOtpMfa(
          pastStepBody,
          pastStepToken,
        )
        expect(pastStepRes.status).toBe(401)
        expect(await pastStepRes.text()).toBe(messageConfig.RequestError.WrongMfaCode)
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${pastStepBody.code}`)).toBeNull()

        const futureStepRes = await postOtpMfa(
          futureStepBody,
          futureStepToken,
        )
        expect(futureStepRes.status).toBe(401)
        expect(await futureStepRes.text()).toBe(messageConfig.RequestError.WrongMfaCode)
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${futureStepBody.code}`)).toBeNull()
      },
    )

    test(
      'should reject replay of the same user otp time step',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await sendCorrectGetOtpMfaSetupReq()
        const firstBody = await prepareFollowUpBody(db)
        const secondBody = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw

        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(fixedOtpTime)
        const token = generateOtpAtTime(
          currentUser.otpSecret,
          fixedOtpTime.getTime(),
        )

        const firstRes = await postOtpMfa(
          firstBody,
          token,
        )
        expect(firstRes.status).toBe(200)

        const secondRes = await postOtpMfa(
          secondBody,
          token,
        )
        expect(secondRes.status).toBe(401)
        expect(await secondRes.text()).toBe(messageConfig.RequestError.WrongMfaCode)
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${secondBody.code}`)).toBeNull()
      },
    )

    test(
      'should reject replay of the same otp code after the current step advances within the skew window',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await sendCorrectGetOtpMfaSetupReq()
        const firstBody = await prepareFollowUpBody(db)
        const secondBody = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw

        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(fixedOtpTime)
        const token = generateOtpAtTime(
          currentUser.otpSecret,
          fixedOtpTime.getTime(),
        )

        const firstRes = await postOtpMfa(
          firstBody,
          token,
        )
        expect(firstRes.status).toBe(200)

        vi.setSystemTime(new Date(fixedOtpTime.getTime() + totpPeriodMs))

        const secondRes = await postOtpMfa(
          secondBody,
          token,
        )
        expect(secondRes.status).toBe(401)
        expect(await secondRes.text()).toBe(messageConfig.RequestError.WrongMfaCode)
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${secondBody.code}`)).toBeNull()
      },
    )

    test(
      'should allow the same user to verify on the next time step after succeeding on a previous one',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await sendCorrectGetOtpMfaSetupReq()
        const firstBody = await prepareFollowUpBody(db)
        const secondBody = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw

        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(fixedOtpTime)
        const firstToken = generateOtpAtTime(
          currentUser.otpSecret,
          fixedOtpTime.getTime(),
        )
        const nextStepMs = fixedOtpTime.getTime() + totpPeriodMs
        const secondToken = generateOtpAtTime(
          currentUser.otpSecret,
          nextStepMs,
        )

        const firstRes = await postOtpMfa(
          firstBody,
          firstToken,
        )
        expect(firstRes.status).toBe(200)

        vi.setSystemTime(new Date(nextStepMs))

        const secondRes = await postOtpMfa(
          secondBody,
          secondToken,
        )
        expect(secondRes.status).toBe(200)
        const secondJson = await secondRes.json() as { code: string }
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${secondJson.code}`)).toBe('1')
      },
    )

    test(
      'should allow same time-step otp code for different users',
      async () => {
        await insertUsers(
          db,
          true,
        )
        await enrollOtpMfa(db)
        await sendCorrectGetOtpMfaSetupReq()
        const firstUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        await db.prepare(`
          INSERT INTO "user"
          ("authId", locale, email, "socialAccountId", "socialAccountType", password, "firstName", "lastName", "otpSecret", "mfaTypes")
          values ('1-1-1-2', 'en', 'second@email.com', null, null, ?, null, null, ?, 'otp')
        `).run(
          '$2a$10$3HtEAf8YcN94V4GOR6ZBNu9tmoIflmEOqb9hUf0iqS4OjYVKe.9/C',
          firstUser.otpSecret,
        )
        await db.prepare('INSERT INTO user_app_consent ("userId", "appId") values (2, 1)').run()

        const firstBody = await prepareFollowUpBodyByEmail('test@email.com')
        const secondBody = await prepareFollowUpBodyByEmail('second@email.com')

        vi.useFakeTimers({ toFake: ['Date'] })
        vi.setSystemTime(fixedOtpTime)
        const token = generateOtpAtTime(
          firstUser.otpSecret,
          fixedOtpTime.getTime(),
        )

        const firstRes = await postOtpMfa(
          firstBody,
          token,
        )
        expect(firstRes.status).toBe(200)

        const secondRes = await postOtpMfa(
          secondBody,
          token,
        )
        expect(secondRes.status).toBe(200)
        const secondJson = await secondRes.json() as { code: string }
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${secondJson.code}`)).toBe('1')
      },
    )

    test(
      'should pass mfa if requied by config',
      async () => {
        process.env.OTP_MFA_IS_REQUIRED = true as unknown as string
        await insertUsers(
          db,
          false,
        )

        const body = await prepareFollowUpBody(db)
        await sendCorrectGetOtpMfaSetupReq({ code: body.code })
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: token,
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
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${json.code}`)).toBe('1')

        process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'should throw error if auth code is wrong',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              locale: 'en',
              code: 'abc',
              mfaCode: token,
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongAuthCode)
      },
    )

    test(
      'should throw error if otp secret not exists',
      async () => {
        await mockedKV.put(
          `${adapterConfig.BaseKVKey.AuthCode}-abc`,
          JSON.stringify({ user: { otpSecret: null } }),
        )
        const res = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: 'abc',
              locale: 'en',
              mfaCode: '123456',
            }),
          },
          mock(db),
        )
        expect(res.status).toBe(400)
      },
    )

    test(
      'should be blocked after 5 attempts',
      async () => {
        global.process.env.MFA_CODE_VERIFY_THRESHOLD = 5 as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        const body = await prepareFollowUpBody(db)

        await sendCorrectGetOtpMfaSetupReq({ code: body.code })

        const sendRequest = async () => {
          return app.request(
            routeConfig.IdentityRoute.ProcessOtpMfa,
            {
              method: 'POST',
              body: JSON.stringify({
                ...body,
                mfaCode: 'abcdefgh',
              }),
            },
            mock(db),
          )
        }
        const res = await sendRequest()
        expect(res.status).toBe(401)
        expect(await res.text()).toBe(messageConfig.RequestError.WrongMfaCode)

        const res1 = await sendRequest()
        expect(res1.status).toBe(401)
        expect(await res1.text()).toBe(messageConfig.RequestError.WrongMfaCode)

        const res2 = await sendRequest()
        expect(res2.status).toBe(401)
        expect(await res2.text()).toBe(messageConfig.RequestError.WrongMfaCode)

        const res3 = await sendRequest()
        expect(res3.status).toBe(401)
        expect(await res3.text()).toBe(messageConfig.RequestError.WrongMfaCode)

        const res4 = await sendRequest()
        expect(res4.status).toBe(401)
        expect(await res4.text()).toBe(messageConfig.RequestError.WrongMfaCode)

        const res5 = await sendRequest()
        expect(res5.status).toBe(400)
        expect(await res5.text()).toBe(messageConfig.RequestError.OtpMfaLocked)

        global.process.env.MFA_CODE_VERIFY_THRESHOLD = 0 as unknown as string
      },
    )

    test(
      'could fallback to email mfa',
      async () => {
        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)

        const body = await prepareFollowUpBody(db)
        await app.request(
          routeConfig.IdentityRoute.SendEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({ ...body }),
          },
          mock(db),
        )

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessEmailMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: body.code,
              locale: body.locale,
              mfaCode: await mockedKV.get(`${adapterConfig.BaseKVKey.EmailMfaCode}-${body.code}`),
            }),
          },
          mock(db),
        )

        const json = await res.json() as { code: string }
        expect(await mockedKV.get(`${adapterConfig.BaseKVKey.OtpMfaCode}-${json.code}`)).toBe('1')
      },
    )

    test(
      'should set remember device cookie when rememberDevice is true',
      async () => {
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await sendCorrectGetOtpMfaSetupReq()
        const body = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: token,
              rememberDevice: true,
            }),
          },
          mock(db),
        )

        expect(res.status).toBe(200)
        const json = await res.json() as { code: string }
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        const setCookieHeader = res.headers.get('Set-Cookie')
        expect(setCookieHeader).toContain('OMRD-1=')
        expect(setCookieHeader).toContain('HttpOnly')
        expect(setCookieHeader).toContain('Secure')
        expect(setCookieHeader).toContain('SameSite=Strict')

        const cookieMatch = setCookieHeader?.match(/OMRD-1=([^;]+)/)
        const cookieValue = cookieMatch?.[1]
        expect(cookieValue).toBeDefined()
        expect(cookieValue?.split('-')).toHaveLength(2)
        expect(cookieValue?.split('-')[0]).toHaveLength(24)
        expect(cookieValue?.split('-')[1]).toHaveLength(128)

        const [deviceId, storedCookieValue] = cookieValue!.split('-')
        const kvKey = `${adapterConfig.BaseKVKey.OtpMfaRememberDevice}-1-${deviceId}`
        const storedValue = await mockedKV.get(kvKey)
        expect(storedValue).toBe(storedCookieValue)

        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
      },
    )

    test(
      'should not set remember device cookie when rememberDevice is false',
      async () => {
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await sendCorrectGetOtpMfaSetupReq()
        const body = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: token,
              rememberDevice: false,
            }),
          },
          mock(db),
        )

        expect(res.status).toBe(200)
        const json = await res.json() as { code: string }
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        const setCookieHeader = res.headers.get('Set-Cookie')
        expect(setCookieHeader).toBeNull()

        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
      },
    )

    test(
      'should not set remember device cookie when ENABLE_MFA_REMEMBER_DEVICE is false',
      async () => {
        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)
        await sendCorrectGetOtpMfaSetupReq()
        const body = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const res = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: token,
              rememberDevice: true,
            }),
          },
          mock(db),
        )

        expect(res.status).toBe(200)
        const json = await res.json() as { code: string }
        expect(json).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        const setCookieHeader = res.headers.get('Set-Cookie')
        expect(setCookieHeader).toBeNull()
      },
    )

    test(
      'should bypass otp mfa on subsequent login when device is remembered',
      async () => {
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)

        await sendCorrectGetOtpMfaSetupReq()
        const body = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const mfaRes = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: token,
              rememberDevice: true,
            }),
          },
          mock(db),
        )

        expect(mfaRes.status).toBe(200)
        const mfaJson = await mfaRes.json() as { code: string }

        const setCookieHeader = mfaRes.headers.get('Set-Cookie')
        expect(setCookieHeader).toContain('OMRD-1=')

        const cookieMatch = setCookieHeader?.match(/OMRD-1=([^;]+)/)
        const cookieValue = cookieMatch?.[1]
        expect(cookieValue).toBeDefined()

        const tokenRes = await app.request(
          routeConfig.OauthRoute.Token,
          {
            method: 'POST',
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: mfaJson.code,
              code_verifier: 'abc',
            }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        expect(tokenRes.status).toBe(200)

        const appRecord = await getApp(db)

        const secondLoginRes = await app.request(
          routeConfig.IdentityRoute.AuthorizePassword,
          {
            method: 'POST',
            body: JSON.stringify({
              clientId: appRecord.clientId,
              redirectUri: 'http://localhost:3000/en/dashboard',
              responseType: 'code',
              state: '123',
              codeChallenge: 'ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0',
              codeChallengeMethod: 's256',
              scope: 'profile openid offline_access',
              locale: 'en',
              email: 'test@email.com',
              password: 'Password1!',
            }),
            headers: { Cookie: `OMRD-1=${cookieValue}` },
          },
          mock(db),
        )

        expect(secondLoginRes.status).toBe(200)
        const secondLoginJson = await secondLoginRes.json() as { code: string }
        expect(secondLoginJson).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        const secondTokenRes = await app.request(
          routeConfig.OauthRoute.Token,
          {
            method: 'POST',
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: secondLoginJson.code,
              code_verifier: 'abc',
            }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )

        expect(secondTokenRes.status).toBe(200)
        const secondTokenJson = await secondTokenRes.json()
        expect(secondTokenJson).toStrictEqual({
          access_token: expect.any(String),
          expires_in: 1800,
          expires_on: expect.any(Number),
          not_before: expect.any(Number),
          token_type: 'Bearer',
          scope: 'profile openid offline_access',
          refresh_token: expect.any(String),
          refresh_token_expires_in: 604800,
          refresh_token_expires_on: expect.any(Number),
          id_token: expect.any(String),
        })

        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )

    test(
      'should not bypass otp mfa when invalid remember device cookie is provided',
      async () => {
        process.env.ENABLE_MFA_REMEMBER_DEVICE = true as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = false as unknown as string

        await insertUsers(
          db,
          false,
        )
        await enrollOtpMfa(db)

        await sendCorrectGetOtpMfaSetupReq()
        const body = await prepareFollowUpBody(db)
        const currentUser = await db.prepare('select * from "user" where id = 1').get() as userModel.Raw
        const token = authenticator.generate(currentUser.otpSecret)

        const mfaRes = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              ...body,
              mfaCode: token,
              rememberDevice: true,
            }),
          },
          mock(db),
        )

        expect(mfaRes.status).toBe(200)
        const mfaJson = await mfaRes.json() as { code: string }

        const tokenRes = await app.request(
          routeConfig.OauthRoute.Token,
          {
            method: 'POST',
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: mfaJson.code,
              code_verifier: 'abc',
            }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )
        expect(tokenRes.status).toBe(200)

        const appRecord = await getApp(db)

        const secondLoginRes = await app.request(
          routeConfig.IdentityRoute.AuthorizePassword,
          {
            method: 'POST',
            body: JSON.stringify({
              clientId: appRecord.clientId,
              redirectUri: 'http://localhost:3000/en/dashboard',
              responseType: 'code',
              state: '123',
              codeChallenge: 'ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0',
              codeChallengeMethod: 's256',
              scope: 'profile openid offline_access',
              locale: 'en',
              email: 'test@email.com',
              password: 'Password1!',
            }),
            headers: { Cookie: 'OMRD-1=invalid-cookie-value-123' },
          },
          mock(db),
        )

        expect(secondLoginRes.status).toBe(200)
        const secondLoginJson = await secondLoginRes.json() as { code: string }
        expect(secondLoginJson).toStrictEqual({
          code: expect.any(String),
          redirectUri: 'http://localhost:3000/en/dashboard',
          state: '123',
          nextPage: 'otp_mfa',
          scopes: ['profile', 'openid', 'offline_access'],
        })

        const secondTokenRes = await app.request(
          routeConfig.OauthRoute.Token,
          {
            method: 'POST',
            body: new URLSearchParams({
              grant_type: 'authorization_code',
              code: secondLoginJson.code,
              code_verifier: 'abc',
            }).toString(),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          },
          mock(db),
        )

        expect(secondTokenRes.status).toBe(401)
        expect(await secondTokenRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)

        process.env.ENABLE_MFA_REMEMBER_DEVICE = false as unknown as string
        process.env.ENABLE_USER_APP_CONSENT = true as unknown as string
      },
    )
  },
)
