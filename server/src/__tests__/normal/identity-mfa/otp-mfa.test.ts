import {
  afterEach, beforeEach, describe, expect, test,
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
} from 'tests/identity'
import { enrollOtpMfa } from 'tests/util'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
})

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
        expect(await res.json()).toStrictEqual({ otpUri: `otpauth://totp/Admin Panel (SPA):test@email.com?secret=${user.otpSecret}&issuer=melody-auth&algorithm=SHA1&digits=6&period=30` })
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
  },
)
