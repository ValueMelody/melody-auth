import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { authenticator } from 'otplib'
import { exchangeWithAuthToken } from '../oauth.test'
import {
  migrate,
  mockedKV,
  getSmsResponseMock,
  mock,
  fetchMock,
  passkeyEnrollMock,
  sessionStore,
} from 'tests/mock'
import {
  adapterConfig,
  messageConfig,
  routeConfig,
} from 'configs'
import { Policy } from 'dtos/oauth'
import {
  appModel, userModel,
} from 'models'
import {
  getApp,
  getSignInRequest,
  insertUsers,
  postSignInRequest,
  prepareFollowUpParams,
} from 'tests/identity'
import { cryptoUtil } from 'utils'
import app from 'index'

let db: Database
const envOverrides: Array<[string, string | undefined]> = []

const setEnv = (
  key: string,
  value: unknown,
) => {
  envOverrides.push([key, process.env[key]])
  process.env[key] = value as string
}

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
  await mockedKV.empty()
  Object.keys(sessionStore).forEach((key) => delete sessionStore[key])
  while (envOverrides.length) {
    const [key, prev] = envOverrides.pop()!
    process.env[key] = prev as string
  }
})

describe(
  'auth-code token exchange',
  () => {
    test(
      'should override system mfa enrollment config',
      async () => {
        db.prepare('update app set "useSystemMfaConfig" = ? where id = ?').run(
          0,
          1,
        )
        await insertUsers(db)
        const tokenRes = await exchangeWithAuthToken(db)
        expect(tokenRes.status).toBe(200)
      },
    )

    test(
      'should override system email mfa enrollment config',
      async () => {
        global.process.env.EMAIL_MFA_IS_REQUIRED = true as unknown as string

        db.prepare('update app set "useSystemMfaConfig" = ? where id = ?').run(
          0,
          1,
        )
        await insertUsers(db)
        const tokenRes = await exchangeWithAuthToken(db)
        expect(tokenRes.status).toBe(200)

        global.process.env.EMAIL_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'should override system otp mfa enrollment config',
      async () => {
        global.process.env.OTP_MFA_IS_REQUIRED = true as unknown as string

        db.prepare('update app set "useSystemMfaConfig" = ? where id = ?').run(
          0,
          1,
        )
        await insertUsers(db)
        const tokenRes = await exchangeWithAuthToken(db)
        expect(tokenRes.status).toBe(200)

        global.process.env.OTP_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'should override system sms mfa enrollment config',
      async () => {
        global.process.env.SMS_MFA_IS_REQUIRED = true as unknown as string

        db.prepare('update app set "useSystemMfaConfig" = ? where id = ?').run(
          0,
          1,
        )
        await insertUsers(db)
        const tokenRes = await exchangeWithAuthToken(db)
        expect(tokenRes.status).toBe(200)

        global.process.env.SMS_MFA_IS_REQUIRED = false as unknown as string
      },
    )

    test(
      'could enable app level email mfa',
      async () => {
        db.prepare('update app set "useSystemMfaConfig" = ?, "requireEmailMfa" = ? where id = ?').run(
          0,
          1,
          1,
        )
        await insertUsers(db)
        const tokenRes = await exchangeWithAuthToken(db)
        expect(tokenRes.status).toBe(401)
        expect(await tokenRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)
      },
    )

    test(
      'could enable app level otp mfa',
      async () => {
        db.prepare('update app set "useSystemMfaConfig" = ?, "requireOtpMfa" = ? where id = ?').run(
          0,
          1,
          1,
        )
        await insertUsers(db)
        const tokenRes = await exchangeWithAuthToken(db)
        expect(tokenRes.status).toBe(401)
        expect(await tokenRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)
      },
    )

    test(
      'could enable app level sms mfa',
      async () => {
        db.prepare('update app set "useSystemMfaConfig" = ?, "requireSmsMfa" = ? where id = ?').run(
          0,
          1,
          1,
        )
        await insertUsers(db)
        const tokenRes = await exchangeWithAuthToken(db)
        expect(tokenRes.status).toBe(401)
        expect(await tokenRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)
      },
    )

    test(
      'could disable fall back to email mfa at app level',
      async () => {
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        db.prepare('update app set "useSystemMfaConfig" = ?, "allowEmailMfaAsBackup" = ?, "requireSmsMfa" = ? where id = ?').run(
          0,
          0,
          1,
          1,
        )

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )

        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )

        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ProcessSmsMfa}${params}`,
          {},
          mock(db),
        )

        expect(res.status).toBe(200)
        expect(await res.json()).toStrictEqual({
          allowFallbackToEmailMfa: false,
          countryCode: '+1',
          phoneNumber: '********1234',
        })

        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )

    test(
      'could enable fall back to email mfa at app level',
      async () => {
        process.env.ALLOW_EMAIL_MFA_AS_BACKUP = false as unknown as string
        process.env.TWILIO_ACCOUNT_ID = '123'
        process.env.TWILIO_AUTH_TOKEN = 'abc'
        process.env.TWILIO_SENDER_NUMBER = '+1231231234'

        db.prepare('update app set "useSystemMfaConfig" = ?, "allowEmailMfaAsBackup" = ?, "requireSmsMfa" = ? where id = ?').run(
          0,
          1,
          1,
          1,
        )

        const mockFetch = getSmsResponseMock()
        global.fetch = mockFetch

        await insertUsers(
          db,
          false,
        )

        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = ?').run(
          '+16471231234',
          1,
        )

        const params = await prepareFollowUpParams(db)

        const res = await app.request(
          `${routeConfig.IdentityRoute.ProcessSmsMfa}${params}`,
          {},
          mock(db),
        )

        expect(res.status).toBe(200)
        expect(await res.json()).toStrictEqual({
          allowFallbackToEmailMfa: true,
          countryCode: '+1',
          phoneNumber: '********1234',
        })

        process.env.ALLOW_EMAIL_MFA_AS_BACKUP = true as unknown as string
        process.env.TWILIO_ACCOUNT_ID = ''
        process.env.TWILIO_AUTH_TOKEN = ''
        process.env.TWILIO_SENDER_NUMBER = ''
        global.fetch = fetchMock
      },
    )
  },
)

const sensitivePolicies: Array<[Policy, routeConfig.View]> = [
  [Policy.ResetMfa, routeConfig.View.ResetMfa],
  [Policy.ManageRecoveryCode, routeConfig.View.ManageRecoveryCode],
  [Policy.ManagePasskey, routeConfig.View.ManagePasskey],
  [Policy.ChangeEmail, routeConfig.View.ChangeEmail],
  [Policy.ChangePassword, routeConfig.View.ChangePassword],
]

const invokeSensitivePolicyAction = async (
  db: Database,
  policy: Policy,
  code: string,
) => {
  switch (policy) {
  case Policy.ResetMfa:
    return app.request(
      routeConfig.IdentityRoute.ResetMfa,
      {
        method: 'POST',
        body: JSON.stringify({
          code,
          locale: 'en',
        }),
      },
      mock(db),
    )
  case Policy.ManageRecoveryCode:
    return app.request(
      routeConfig.IdentityRoute.ManageRecoveryCode,
      {
        method: 'POST',
        body: JSON.stringify({
          code,
          locale: 'en',
        }),
      },
      mock(db),
    )
  case Policy.ManagePasskey:
    await mockedKV.put(
      `${adapterConfig.BaseKVKey.PasskeyEnrollChallenge}-1`,
      'Gu09HnxTsc01smwaCtC6yHE0MEg_d-qKUSpKi5BbLgU',
    )
    return app.request(
      routeConfig.IdentityRoute.ManagePasskey,
      {
        method: 'POST',
        body: JSON.stringify({
          code,
          locale: 'en',
          enrollInfo: passkeyEnrollMock,
        }),
      },
      mock(db),
    )
  case Policy.ChangeEmail: {
    const codeRes = await app.request(
      routeConfig.IdentityRoute.ChangeEmailCode,
      {
        method: 'POST',
        body: JSON.stringify({
          code,
          locale: 'en',
          email: 'new_email@email.com',
        }),
      },
      mock(db),
    )
    if (codeRes.status !== 200) return codeRes

    const verificationCode = await mockedKV.get(`${adapterConfig.BaseKVKey.ChangeEmailCode}-1-new_email@email.com`)
    return app.request(
      routeConfig.IdentityRoute.ChangeEmail,
      {
        method: 'POST',
        body: JSON.stringify({
          code,
          locale: 'en',
          email: 'new_email@email.com',
          verificationCode,
        }),
      },
      mock(db),
    )
  }
  case Policy.ChangePassword:
    return app.request(
      routeConfig.IdentityRoute.ChangePassword,
      {
        method: 'POST',
        body: JSON.stringify({
          code,
          locale: 'en',
          password: 'Password2!',
        }),
      },
      mock(db),
    )
  default:
    throw new Error(`Unexpected policy: ${policy}`)
  }
}

const disableAppMfaSql =
  'update app set "useSystemMfaConfig" = 0, "requireEmailMfa" = 0, "requireOtpMfa" = 0, "requireSmsMfa" = 0, "allowEmailMfaAsBackup" = 0 where id = 1'

const configureWeakerAppAndOtpUser = async (
  db: Database,
  otpSecret: string,
  options: { skipEnrollSteps?: boolean } = {},
) => {
  await db.prepare(disableAppMfaSql).run()
  await insertUsers(db)
  await db.prepare('update "user" set "otpSecret" = ?, "otpVerified" = 1 where id = 1').run(otpSecret)
  if (options.skipEnrollSteps) {
    await db.prepare('update "user" set "skipPasskeyEnroll" = 1, "recoveryCodeHash" = ? where id = 1').run('123')
  }
}

describe(
  'sensitive account policies enforce global/account MFA',
  () => {
    test.each(sensitivePolicies)(
      'should enforce global OTP MFA for policy %s even when app disables MFA',
      async (
        policy, expectedView,
      ) => {
        setEnv(
          'OTP_MFA_IS_REQUIRED',
          true as unknown as string,
        )
        setEnv(
          'ALLOW_PASSKEY_ENROLLMENT',
          true as unknown as string,
        )
        setEnv(
          'ENABLE_RECOVERY_CODE',
          true as unknown as string,
        )
        setEnv(
          'ENABLE_USER_APP_CONSENT',
          false as unknown as string,
        )

        const otpSecret = cryptoUtil.genOtpSecret()
        await configureWeakerAppAndOtpUser(
          db,
          otpSecret,
          { skipEnrollSteps: true },
        )

        const appRecord = await getApp(db)
        const signInRes = await postSignInRequest(
          db,
          appRecord,
          { policy },
        )
        expect(signInRes.status).toBe(200)
        const signInJson = await signInRes.json() as { code: string; nextPage?: string }
        expect(signInJson.nextPage).toBe(routeConfig.View.OtpMfa)

        const unverifiedActionRes = await invokeSensitivePolicyAction(
          db,
          policy,
          signInJson.code,
        )
        expect(unverifiedActionRes.status).toBe(401)
        expect(await unverifiedActionRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)

        const mfaRes = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: signInJson.code,
              locale: 'en',
              mfaCode: authenticator.generate(otpSecret),
            }),
          },
          mock(db),
        )
        expect(mfaRes.status).toBe(200)
        const mfaJson = await mfaRes.json() as { code: string; nextPage?: string }
        expect(mfaJson.nextPage).toBe(expectedView)

        const verifiedActionRes = await invokeSensitivePolicyAction(
          db,
          policy,
          mfaJson.code,
        )
        expect(verifiedActionRes.status).toBe(200)
      },
    )

    test(
      'should enforce global email MFA for reset_mfa even when app disables MFA',
      async () => {
        setEnv(
          'EMAIL_MFA_IS_REQUIRED',
          true as unknown as string,
        )
        setEnv(
          'ENABLE_USER_APP_CONSENT',
          false as unknown as string,
        )

        await db.prepare(disableAppMfaSql).run()
        await insertUsers(db)
        await db.prepare('update "user" set "skipPasskeyEnroll" = 1, "recoveryCodeHash" = ? where id = 1').run('123')

        const appRecord = await getApp(db)
        const signInRes = await postSignInRequest(
          db,
          appRecord,
          { policy: Policy.ResetMfa },
        )
        expect(signInRes.status).toBe(200)
        const signInJson = await signInRes.json() as { code: string; nextPage?: string }
        expect(signInJson.nextPage).toBe(routeConfig.View.EmailMfa)

        const resetRes = await invokeSensitivePolicyAction(
          db,
          Policy.ResetMfa,
          signInJson.code,
        )
        expect(resetRes.status).toBe(401)
        expect(await resetRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)
      },
    )

    test(
      'should enforce global ENFORCE_ONE_MFA_ENROLLMENT for reset_mfa even when app disables MFA',
      async () => {
        setEnv(
          'ENFORCE_ONE_MFA_ENROLLMENT',
          ['otp', 'email'] as unknown as string,
        )
        setEnv(
          'ENABLE_USER_APP_CONSENT',
          false as unknown as string,
        )

        await db.prepare(disableAppMfaSql).run()
        await insertUsers(db)
        await db.prepare('update "user" set "skipPasskeyEnroll" = 1, "recoveryCodeHash" = ? where id = 1').run('123')

        const appRecord = await getApp(db)
        const signInRes = await postSignInRequest(
          db,
          appRecord,
          { policy: Policy.ResetMfa },
        )
        expect(signInRes.status).toBe(200)
        const signInJson = await signInRes.json() as { code: string; nextPage?: string }
        expect(signInJson.nextPage).toBe(routeConfig.View.MfaEnroll)

        const resetRes = await invokeSensitivePolicyAction(
          db,
          Policy.ResetMfa,
          signInJson.code,
        )
        expect(resetRes.status).toBe(401)
        expect(await resetRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)
      },
    )

    test.each(sensitivePolicies)(
      'should enforce account-verified OTP MFA for policy %s when global MFA is off',
      async (
        policy, expectedView,
      ) => {
        setEnv(
          'ENFORCE_ONE_MFA_ENROLLMENT',
          [] as unknown as string,
        )
        setEnv(
          'ALLOW_PASSKEY_ENROLLMENT',
          true as unknown as string,
        )
        setEnv(
          'ENABLE_RECOVERY_CODE',
          true as unknown as string,
        )
        setEnv(
          'ENABLE_USER_APP_CONSENT',
          false as unknown as string,
        )

        const otpSecret = cryptoUtil.genOtpSecret()
        await configureWeakerAppAndOtpUser(
          db,
          otpSecret,
          { skipEnrollSteps: true },
        )

        const appRecord = await getApp(db)
        const normalSignInRes = await postSignInRequest(
          db,
          appRecord,
        )
        expect(normalSignInRes.status).toBe(200)
        const normalSignInJson = await normalSignInRes.json() as { code: string; nextPage?: string }
        expect(normalSignInJson.nextPage).toBeUndefined()

        const policySignInRes = await postSignInRequest(
          db,
          appRecord,
          { policy },
        )
        expect(policySignInRes.status).toBe(200)
        const policySignInJson = await policySignInRes.json() as { code: string; nextPage?: string }
        expect(policySignInJson.nextPage).toBe(routeConfig.View.OtpMfa)

        const unverifiedRes = await invokeSensitivePolicyAction(
          db,
          policy,
          policySignInJson.code,
        )
        expect(unverifiedRes.status).toBe(401)
        expect(await unverifiedRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)

        const mfaRes = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: policySignInJson.code,
              locale: 'en',
              mfaCode: authenticator.generate(otpSecret),
            }),
          },
          mock(db),
        )
        expect(mfaRes.status).toBe(200)
        const mfaJson = await mfaRes.json() as { code: string; nextPage?: string }
        expect(mfaJson.nextPage).toBe(expectedView)

        const verifiedRes = await invokeSensitivePolicyAction(
          db,
          policy,
          mfaJson.code,
        )
        expect(verifiedRes.status).toBe(200)
      },
    )

    test(
      'should enforce account MFA before deleting passkey via manage_passkey on weaker app',
      async () => {
        setEnv(
          'ENFORCE_ONE_MFA_ENROLLMENT',
          [] as unknown as string,
        )
        setEnv(
          'ALLOW_PASSKEY_ENROLLMENT',
          true as unknown as string,
        )
        setEnv(
          'ENABLE_USER_APP_CONSENT',
          false as unknown as string,
        )

        const otpSecret = cryptoUtil.genOtpSecret()
        await configureWeakerAppAndOtpUser(
          db,
          otpSecret,
          { skipEnrollSteps: true },
        )
        await db.prepare('insert into user_passkey ("userId", "credentialId", "publicKey", "counter") values (?, ?, ?, ?)').run(
          1,
          'cred-1',
          'pub-1',
          0,
        )

        const appRecord = await getApp(db)
        const signInRes = await postSignInRequest(
          db,
          appRecord,
          { policy: Policy.ManagePasskey },
        )
        expect(signInRes.status).toBe(200)
        const signInJson = await signInRes.json() as { code: string; nextPage?: string }
        expect(signInJson.nextPage).toBe(routeConfig.View.OtpMfa)

        const unverifiedDeleteRes = await app.request(
          routeConfig.IdentityRoute.ManagePasskey,
          {
            method: 'DELETE',
            body: JSON.stringify({
              code: signInJson.code,
              locale: 'en',
            }),
          },
          mock(db),
        )
        expect(unverifiedDeleteRes.status).toBe(401)
        expect(await unverifiedDeleteRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)

        const mfaRes = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: signInJson.code,
              locale: 'en',
              mfaCode: authenticator.generate(otpSecret),
            }),
          },
          mock(db),
        )
        expect(mfaRes.status).toBe(200)
        const mfaJson = await mfaRes.json() as { code: string; nextPage?: string }
        expect(mfaJson.nextPage).toBe(routeConfig.View.ManagePasskey)

        const verifiedDeleteRes = await app.request(
          routeConfig.IdentityRoute.ManagePasskey,
          {
            method: 'DELETE',
            body: JSON.stringify({
              code: mfaJson.code,
              locale: 'en',
            }),
          },
          mock(db),
        )
        expect(verifiedDeleteRes.status).toBe(200)
      },
    )

    test(
      'should enforce account-verified SMS MFA for reset_mfa when global MFA is off',
      async () => {
        setEnv(
          'ENFORCE_ONE_MFA_ENROLLMENT',
          [] as unknown as string,
        )
        setEnv(
          'ENABLE_USER_APP_CONSENT',
          false as unknown as string,
        )

        await db.prepare(disableAppMfaSql).run()
        await insertUsers(db)
        await db.prepare('update "user" set "skipPasskeyEnroll" = 1, "recoveryCodeHash" = ? where id = 1').run('123')
        await db.prepare('update "user" set "smsPhoneNumber" = ?, "smsPhoneNumberVerified" = 1 where id = 1').run('+16471231234')

        const appRecord = await getApp(db)
        const normalSignInRes = await postSignInRequest(
          db,
          appRecord,
        )
        expect(normalSignInRes.status).toBe(200)
        expect((await normalSignInRes.json() as { nextPage?: string }).nextPage).toBeUndefined()

        const policySignInRes = await postSignInRequest(
          db,
          appRecord,
          { policy: Policy.ResetMfa },
        )
        expect(policySignInRes.status).toBe(200)
        const policySignInJson = await policySignInRes.json() as { code: string; nextPage?: string }
        expect(policySignInJson.nextPage).toBe(routeConfig.View.SmsMfa)

        const resetRes = await invokeSensitivePolicyAction(
          db,
          Policy.ResetMfa,
          policySignInJson.code,
        )
        expect(resetRes.status).toBe(401)
        expect(await resetRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)
      },
    )

    test.each(sensitivePolicies)(
      'should re-verify account MFA when triggering policy %s via existing session',
      async (
        policy, expectedView,
      ) => {
        setEnv(
          'ENFORCE_ONE_MFA_ENROLLMENT',
          [] as unknown as string,
        )
        setEnv(
          'ALLOW_PASSKEY_ENROLLMENT',
          true as unknown as string,
        )
        setEnv(
          'ENABLE_RECOVERY_CODE',
          true as unknown as string,
        )
        setEnv(
          'ENABLE_USER_APP_CONSENT',
          false as unknown as string,
        )

        await db.prepare(disableAppMfaSql).run()
        await insertUsers(db)
        await db.prepare('update "user" set "skipPasskeyEnroll" = 1, "recoveryCodeHash" = ? where id = 1').run('123')

        const appRecord = await getApp(db)
        const signInRes = await postSignInRequest(
          db,
          appRecord,
        )
        expect(signInRes.status).toBe(200)

        const otpSecret = cryptoUtil.genOtpSecret()
        await db.prepare('update "user" set "otpSecret" = ?, "otpVerified" = 1 where id = 1').run(otpSecret)

        const authorizeRes = await getSignInRequest(
          db,
          routeConfig.OauthRoute.Authorize,
          appRecord,
          `&policy=${policy}`,
        )
        expect(authorizeRes.status).toBe(302)
        const location = authorizeRes.headers.get('Location') ?? ''
        expect(location).toContain(`${routeConfig.IdentityRoute.ProcessView}?`)
        expect(location).toContain(`step=${routeConfig.View.OtpMfa}`)
        expect(location).not.toContain(`step=${policy}`)

        const code = new URL(
          location,
          'http://localhost',
        ).searchParams.get('code') ?? ''
        expect(code.length).toBeGreaterThan(0)

        const unverifiedRes = await invokeSensitivePolicyAction(
          db,
          policy,
          code,
        )
        expect(unverifiedRes.status).toBe(401)
        expect(await unverifiedRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)

        const mfaRes = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code,
              locale: 'en',
              mfaCode: authenticator.generate(otpSecret),
            }),
          },
          mock(db),
        )
        expect(mfaRes.status).toBe(200)
        const mfaJson = await mfaRes.json() as { code: string; nextPage?: string }
        expect(mfaJson.nextPage).toBe(expectedView)

        const verifiedRes = await invokeSensitivePolicyAction(
          db,
          policy,
          mfaJson.code,
        )
        expect(verifiedRes.status).toBe(200)
      },
    )

    test(
      'should redirect to authorize view when passwordless sign-in is enabled and reset_mfa is requested via session',
      async () => {
        setEnv(
          'ENFORCE_ONE_MFA_ENROLLMENT',
          [] as unknown as string,
        )
        setEnv(
          'ENABLE_USER_APP_CONSENT',
          false as unknown as string,
        )

        await db.prepare(disableAppMfaSql).run()
        await insertUsers(db)
        await db.prepare('update "user" set "skipPasskeyEnroll" = 1, "recoveryCodeHash" = ? where id = 1').run('123')

        const appRecord = await getApp(db)
        const signInRes = await postSignInRequest(
          db,
          appRecord,
        )
        expect(signInRes.status).toBe(200)

        setEnv(
          'ENABLE_PASSWORDLESS_SIGN_IN',
          true as unknown as string,
        )

        const authorizeRes = await getSignInRequest(
          db,
          routeConfig.OauthRoute.Authorize,
          appRecord,
          `&policy=${Policy.ResetMfa}`,
        )
        expect(authorizeRes.status).toBe(302)
        expect(authorizeRes.headers.get('Location')).toContain(routeConfig.IdentityRoute.AuthorizeView)
      },
    )

    test(
      'should ignore remember-device cookie on sensitive policies',
      async () => {
        setEnv(
          'ENABLE_MFA_REMEMBER_DEVICE',
          true as unknown as string,
        )
        setEnv(
          'ENABLE_USER_APP_CONSENT',
          false as unknown as string,
        )
        setEnv(
          'OTP_MFA_IS_REQUIRED',
          true as unknown as string,
        )

        const otpSecret = cryptoUtil.genOtpSecret()
        await insertUsers(db)
        await db.prepare('update "user" set "otpSecret" = ?, "otpVerified" = 1 where id = 1').run(otpSecret)

        const appRecord = await getApp(db)
        const firstSignInRes = await postSignInRequest(
          db,
          appRecord,
        )
        const firstSignInJson = await firstSignInRes.json() as { code: string }

        const mfaRes = await app.request(
          routeConfig.IdentityRoute.ProcessOtpMfa,
          {
            method: 'POST',
            body: JSON.stringify({
              code: firstSignInJson.code,
              locale: 'en',
              mfaCode: authenticator.generate(otpSecret),
              rememberDevice: true,
            }),
          },
          mock(db),
        )
        expect(mfaRes.status).toBe(200)
        const setCookieHeader = mfaRes.headers.get('Set-Cookie')
        const cookieValue = setCookieHeader?.match(/OMRD-1=([^;]+)/)?.[1]
        expect(cookieValue).toBeDefined()

        const baseBody = {
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
        }

        const normalBypassRes = await app.request(
          routeConfig.IdentityRoute.AuthorizePassword,
          {
            method: 'POST',
            body: JSON.stringify(baseBody),
            headers: { Cookie: `OMRD-1=${cookieValue}` },
          },
          mock(db),
        )
        expect(normalBypassRes.status).toBe(200)
        expect((await normalBypassRes.json() as { nextPage?: string }).nextPage).toBeUndefined()

        for (const policy of [Policy.ResetMfa, Policy.ChangePassword]) {
          const policyRes = await app.request(
            routeConfig.IdentityRoute.AuthorizePassword,
            {
              method: 'POST',
              body: JSON.stringify({
                ...baseBody,
                policy,
              }),
              headers: { Cookie: `OMRD-1=${cookieValue}` },
            },
            mock(db),
          )
          expect(policyRes.status).toBe(200)
          const policyJson = await policyRes.json() as { code: string; nextPage?: string }
          expect(policyJson.nextPage).toBe(routeConfig.View.OtpMfa)

          const actionRes = await invokeSensitivePolicyAction(
            db,
            policy,
            policyJson.code,
          )
          expect(actionRes.status).toBe(401)
          expect(await actionRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)
        }
      },
    )

    test.each([
      ['global OTP MFA required', true],
      ['account-verified OTP MFA with global MFA off', false],
    ])(
      'should block passkey and recovery code enrollment on weaker app when %s',
      async (
        _label, requireGlobalOtp,
      ) => {
        setEnv(
          'OTP_MFA_IS_REQUIRED',
          requireGlobalOtp as unknown as string,
        )
        setEnv(
          'ENFORCE_ONE_MFA_ENROLLMENT',
          [] as unknown as string,
        )
        setEnv(
          'ALLOW_PASSKEY_ENROLLMENT',
          true as unknown as string,
        )
        setEnv(
          'ENABLE_RECOVERY_CODE',
          true as unknown as string,
        )
        setEnv(
          'ENABLE_USER_APP_CONSENT',
          false as unknown as string,
        )
        setEnv(
          'EMBEDDED_AUTH_ORIGINS',
          ['http://localhost:3000'] as unknown as string,
        )
        setEnv(
          'ENABLE_ORG',
          true as unknown as string,
        )
        setEnv(
          'ALLOW_USER_SWITCH_ORG_ON_SIGN_IN',
          true as unknown as string,
        )

        const otpSecret = cryptoUtil.genOtpSecret()
        await configureWeakerAppAndOtpUser(
          db,
          otpSecret,
        )

        const appRecord = await getApp(db) as appModel.Record
        const signInRes = await postSignInRequest(
          db,
          appRecord,
        )
        expect(signInRes.status).toBe(200)
        const signInJson = await signInRes.json() as { code: string; nextPage?: string }
        expect(signInJson.nextPage).toBe(routeConfig.View.SwitchOrg)

        await mockedKV.put(
          `${adapterConfig.BaseKVKey.PasskeyEnrollChallenge}-1`,
          'Gu09HnxTsc01smwaCtC6yHE0MEg_d-qKUSpKi5BbLgU',
        )
        const passkeyRes = await app.request(
          routeConfig.IdentityRoute.ProcessPasskeyEnroll,
          {
            method: 'POST',
            body: JSON.stringify({
              code: signInJson.code,
              locale: 'en',
              enrollInfo: passkeyEnrollMock,
            }),
          },
          mock(db),
        )
        expect(passkeyRes.status).toBe(401)
        expect(await passkeyRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)

        const recoveryRes = await app.request(
          `${routeConfig.IdentityRoute.ProcessRecoveryCodeEnroll}?code=${signInJson.code}`,
          { method: 'GET' },
          mock(db),
        )
        expect(recoveryRes.status).toBe(401)
        expect(await recoveryRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)

        setEnv(
          'ENABLE_ORG',
          false as unknown as string,
        )
        setEnv(
          'ALLOW_USER_SWITCH_ORG_ON_SIGN_IN',
          false as unknown as string,
        )

        const normalSignInRes = await postSignInRequest(
          db,
          appRecord,
        )
        expect(normalSignInRes.status).toBe(200)
        expect((await normalSignInRes.json() as { nextPage?: string }).nextPage).toBeUndefined()

        const initiateRes = await app.request(
          routeConfig.EmbeddedRoute.Initiate,
          {
            method: 'POST',
            body: JSON.stringify({
              clientId: appRecord.clientId,
              redirectUri: 'http://localhost:3000',
              codeChallengeMethod: 'S256',
              codeChallenge: 'ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0',
              scopes: ['profile', 'openid', 'offline_access'],
              locale: 'en',
            }),
          },
          mock(db),
        )
        const { sessionId } = await initiateRes.json() as { sessionId: string }

        const embeddedSignInRes = await app.request(
          routeConfig.EmbeddedRoute.SignIn.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({
              email: 'test@email.com',
              password: 'Password1!',
            }),
          },
          mock(db),
        )
        expect(embeddedSignInRes.status).toBe(200)
        expect(await embeddedSignInRes.json()).toStrictEqual({
          sessionId,
          success: true,
        })

        const embeddedPasskeyRes = await app.request(
          routeConfig.EmbeddedRoute.PasskeyEnroll.replace(
            ':sessionId',
            sessionId,
          ),
          {
            method: 'POST',
            body: JSON.stringify({ enrollInfo: passkeyEnrollMock }),
          },
          mock(db),
        )
        expect(embeddedPasskeyRes.status).toBe(401)
        expect(await embeddedPasskeyRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)

        const embeddedRecoveryRes = await app.request(
          routeConfig.EmbeddedRoute.RecoveryCodeEnroll.replace(
            ':sessionId',
            sessionId,
          ),
          { method: 'GET' },
          mock(db),
        )
        expect(embeddedRecoveryRes.status).toBe(401)
        expect(await embeddedRecoveryRes.text()).toBe(messageConfig.RequestError.MfaNotVerified)

        const passkeys = await db.prepare('SELECT * FROM user_passkey WHERE "userId" = 1').all()
        expect(passkeys.length).toBe(0)
        const user = await db.prepare('SELECT * FROM "user" WHERE id = 1').get() as userModel.Raw
        expect(user.recoveryCodeHash).toBeNull()
      },
    )
  },
)
