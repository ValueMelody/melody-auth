import { Context } from 'hono'
import { env } from 'hono/adapter'
import { Scope } from 'shared'
import { oauthDto } from 'dtos'
import {
  routeConfig, typeConfig,
} from 'configs'
import { kvService } from 'services'
import { cryptoUtil } from 'utils'

export const getSystemInfo = async (c: Context<typeConfig.Context>) => {
  const environment = env(c)

  const configs = {
    AUTHORIZATION_CODE_EXPIRES_IN: environment.AUTHORIZATION_CODE_EXPIRES_IN,
    SPA_ACCESS_TOKEN_EXPIRES_IN: environment.SPA_ACCESS_TOKEN_EXPIRES_IN,
    SPA_REFRESH_TOKEN_EXPIRES_IN: environment.SPA_REFRESH_TOKEN_EXPIRES_IN,
    S2S_ACCESS_TOKEN_EXPIRES_IN: environment.S2S_ACCESS_TOKEN_EXPIRES_IN,
    ID_TOKEN_EXPIRES_IN: environment.ID_TOKEN_EXPIRES_IN,
    SERVER_SESSION_EXPIRES_IN: environment.SERVER_SESSION_EXPIRES_IN,
    AUTH_SERVER_URL: environment.AUTH_SERVER_URL,
    SUPPORTED_LOCALES: environment.SUPPORTED_LOCALES,
    ENABLE_LOCALE_SELECTOR: environment.ENABLE_LOCALE_SELECTOR,
    COMPANY_LOGO_URL: environment.COMPANY_LOGO_URL,
    EMAIL_SENDER_NAME: environment.EMAIL_SENDER_NAME,
    GOOGLE_AUTH_CLIENT_ID: environment.GOOGLE_AUTH_CLIENT_ID,
    FACEBOOK_AUTH_CLIENT_ID: environment.FACEBOOK_AUTH_CLIENT_ID,
    GITHUB_AUTH_CLIENT_ID: environment.GITHUB_AUTH_CLIENT_ID,
    GITHUB_AUTH_APP_NAME: environment.GITHUB_AUTH_APP_NAME,
    ENABLE_SIGN_UP: environment.ENABLE_SIGN_UP,
    ENABLE_PASSWORD_RESET: environment.ENABLE_PASSWORD_RESET,
    PASSWORD_RESET_EMAIL_THRESHOLD: environment.PASSWORD_RESET_EMAIL_THRESHOLD,
    ENABLE_NAMES: environment.ENABLE_NAMES,
    NAMES_IS_REQUIRED: environment.NAMES_IS_REQUIRED,
    ENABLE_USER_APP_CONSENT: environment.ENABLE_USER_APP_CONSENT,
    ENFORCE_ONE_MFA_ENROLLMENT: environment.ENFORCE_ONE_MFA_ENROLLMENT,
    ENABLE_EMAIL_VERIFICATION: environment.ENABLE_EMAIL_VERIFICATION,
    EMAIL_MFA_IS_REQUIRED: environment.EMAIL_MFA_IS_REQUIRED,
    EMAIL_MFA_EMAIL_THRESHOLD: environment.EMAIL_MFA_EMAIL_THRESHOLD,
    OTP_MFA_IS_REQUIRED: environment.OTP_MFA_IS_REQUIRED,
    SMS_MFA_IS_REQUIRED: environment.SMS_MFA_IS_REQUIRED,
    SMS_MFA_MESSAGE_THRESHOLD: environment.SMS_MFA_MESSAGE_THRESHOLD,
    ACCOUNT_LOCKOUT_THRESHOLD: environment.ACCOUNT_LOCKOUT_THRESHOLD,
    ACCOUNT_LOCKOUT_EXPIRES_IN: environment.ACCOUNT_LOCKOUT_EXPIRES_IN,
    UNLOCK_ACCOUNT_VIA_PASSWORD_RESET: environment.UNLOCK_ACCOUNT_VIA_PASSWORD_RESET,
    ALLOW_EMAIL_MFA_AS_BACKUP: environment.ALLOW_EMAIL_MFA_AS_BACKUP,
    TERMS_LINK: environment.TERMS_LINK,
    PRIVACY_POLICY_LINK: environment.PRIVACY_POLICY_LINK,
    ENABLE_EMAIL_LOG: environment.ENABLE_EMAIL_LOG,
    ENABLE_SMS_LOG: environment.ENABLE_SMS_LOG,
    ENABLE_SIGN_IN_LOG: environment.ENABLE_SIGN_IN_LOG,
  }

  return c.json({ configs })
}

export const getOpenidConfig = async (c: Context<typeConfig.Context>) => {
  const { AUTH_SERVER_URL: serverUrl } = env(c)
  return c.json({
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
}

export const getJwks = async (c: Context<typeConfig.Context>) => {
  const publicKey = await kvService.getJwtPublicSecret(c.env.KV)
  const keys = []
  const jwk = await cryptoUtil.secretToJwk(publicKey)
  keys.push(jwk)
  const deprecatedPublicKey = await kvService.getDeprecatedPublicSecret(c.env.KV)
  if (deprecatedPublicKey) {
    const deprecatedJwk = await cryptoUtil.secretToJwk(deprecatedPublicKey)
    keys.push(deprecatedJwk)
  }
  return c.json({ keys })
}
