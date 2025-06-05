import {
  afterEach, beforeEach, describe, expect, test,
} from 'vitest'
import { Database } from 'better-sqlite3'
import { Scope } from '@melody-auth/shared'
import app from 'index'
import {
  migrate, mock,
  mockedKV,
} from 'tests/mock'
import {
  messageConfig, routeConfig,
} from 'configs'
import { oauthDto } from 'dtos'

let db: Database

beforeEach(async () => {
  db = await migrate()
})

afterEach(async () => {
  await db.close()
})

const BaseRoute = ''

describe(
  'get system info',
  () => {
    test(
      'should return system info',
      async () => {
        const res = await app.request(
          `${BaseRoute}/info`,
          {},
          mock(db),
        )
        const json = await res.json() as { configs: object }

        expect(json.configs).toStrictEqual({
          AUTHORIZATION_CODE_EXPIRES_IN: 300,
          SPA_ACCESS_TOKEN_EXPIRES_IN: 1800,
          SPA_REFRESH_TOKEN_EXPIRES_IN: 604800,
          S2S_ACCESS_TOKEN_EXPIRES_IN: 3600,
          ID_TOKEN_EXPIRES_IN: 1800,
          SERVER_SESSION_EXPIRES_IN: 1800,
          AUTH_SERVER_URL: 'http://localhost:8787',
          SUPPORTED_LOCALES: ['en', 'fr'],
          ENABLE_LOCALE_SELECTOR: true,
          COMPANY_LOGO_URL: 'https://valuemelody.com/logo.svg',
          COMPANY_EMAIL_LOGO_URL: 'https://valuemelody.com/logo.jpg',
          EMAIL_SENDER_NAME: 'Melody Auth',
          ENABLE_SIGN_UP: true,
          ENABLE_PASSWORD_RESET: true,
          PASSWORD_RESET_EMAIL_THRESHOLD: 5,
          ENABLE_NAMES: true,
          NAMES_IS_REQUIRED: false,
          ENABLE_USER_APP_CONSENT: true,
          ENFORCE_ONE_MFA_ENROLLMENT: ['otp', 'email'],
          ENABLE_EMAIL_VERIFICATION: true,
          REPLACE_EMAIL_VERIFICATION_WITH_WELCOME_EMAIL: false,
          EMAIL_MFA_IS_REQUIRED: false,
          EMAIL_MFA_EMAIL_THRESHOLD: 10,
          CHANGE_EMAIL_EMAIL_THRESHOLD: 5,
          OTP_MFA_IS_REQUIRED: false,
          SMS_MFA_IS_REQUIRED: false,
          SMS_MFA_MESSAGE_THRESHOLD: 5,
          ACCOUNT_LOCKOUT_THRESHOLD: 5,
          ACCOUNT_LOCKOUT_EXPIRES_IN: 86400,
          UNLOCK_ACCOUNT_VIA_PASSWORD_RESET: true,
          ALLOW_EMAIL_MFA_AS_BACKUP: true,
          ALLOW_PASSKEY_ENROLLMENT: false,
          TERMS_LINK: '',
          PRIVACY_POLICY_LINK: '',
          ENABLE_EMAIL_LOG: false,
          ENABLE_SMS_LOG: false,
          ENABLE_SIGN_IN_LOG: false,
          ENABLE_PASSWORD_SIGN_IN: true,
          ENABLE_PASSWORDLESS_SIGN_IN: false,
          ENABLE_ORG: false,
          ENABLE_USER_ATTRIBUTE: false,
          BLOCKED_POLICIES: [],
          EMBEDDED_AUTH_ORIGINS: [],
          ENABLE_SAML_SSO_AS_SP: false,
        })
      },
    )
  },
)

describe(
  'get openid config',
  () => {
    test(
      'should return openid config',
      async () => {
        const res = await app.request(
          `${BaseRoute}/.well-known/openid-configuration`,
          {},
          mock(db),
        )
        const json = await res.json() as { configs: object }

        const serverUrl = 'http://localhost:8787'
        expect(json).toStrictEqual({
          issuer: serverUrl,
          authorization_endpoint: `${serverUrl}${routeConfig.OauthRoute.Authorize}`,
          token_endpoint: `${serverUrl}${routeConfig.OauthRoute.Token}`,
          userinfo_endpoint: `${serverUrl}${routeConfig.OauthRoute.Userinfo}`,
          revocation_endpoint: `${serverUrl}${routeConfig.OauthRoute.Revoke}`,
          scopes_supported: Object.values(Scope),
          response_types_supported: ['code'],
          grant_types_supported: Object.values(oauthDto.TokenGrantType),
          token_endpoint_auth_methods_supported: ['client_secret_basic'],
          claims_supported: ['sub', 'email', 'first_name', 'last_name', 'locale'],
          id_token_signing_alg_values_supported: ['RS256'],
          jwks_uri: `${serverUrl}/.well-known/jwks.json`,
          code_challenge_methods_supported: ['plain', 'S256'],
        })
      },
    )
  },
)

describe(
  'get jwks',
  () => {
    test(
      'should return jwks',
      async () => {
        const res = await app.request(
          `${BaseRoute}/.well-known/jwks.json`,
          {},
          mock(db),
        )
        const json = await res.json() as { keys: any[] }

        expect(json.keys[0]).toStrictEqual({
          kty: 'RSA',
          n: expect.any(String),
          e: 'AQAB',
          alg: 'RS256',
          use: 'sig',
          kid: expect.any(String),
        })
      },
    )

    test(
      'should throw error if no jwt public secret',
      async () => {
        const kvGet = mockedKV.get
        mockedKV.get = () => Promise.resolve(null)

        const res = await app.request(
          `${BaseRoute}/.well-known/jwks.json`,
          {},
          mock(db),
        )
        expect(res.status).toBe(400)
        expect(await res.text()).toBe(messageConfig.ConfigError.NoJwtPublicSecret)

        mockedKV.get = kvGet
      },
    )
  },
)

describe(
  'get swagger',
  () => {
    test(
      'should return swagger',
      async () => {
        const res = await app.request(
          `${BaseRoute}/api/v1/swagger`,
          {},
          mock(db),
        )
        const swagger = await res.text()
        expect(swagger).toContain('html')
      },
    )
  },
)
