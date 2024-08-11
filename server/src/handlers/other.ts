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
    ENABLE_SIGN_UP: environment.ENABLE_SIGN_UP,
    ENABLE_PASSWORD_RESET: environment.ENABLE_PASSWORD_RESET,
    ENABLE_NAMES: environment.ENABLE_NAMES,
    NAMES_IS_REQUIRED: environment.NAMES_IS_REQUIRED,
    ENABLE_USER_APP_CONSENT: environment.ENABLE_USER_APP_CONSENT,
    ENABLE_EMAIL_VERIFICATION: environment.ENABLE_EMAIL_VERIFICATION,
    ENABLE_EMAIL_MFA: environment.ENABLE_EMAIL_MFA,
    ACCOUNT_LOCKOUT_THRESHOLD: environment.ACCOUNT_LOCKOUT_THRESHOLD,
    ACCOUNT_LOCKOUT_EXPIRES_IN: environment.ACCOUNT_LOCKOUT_EXPIRES_IN,
    UNLOCK_ACCOUNT_VIA_PASSWORD_RESET: environment.UNLOCK_ACCOUNT_VIA_PASSWORD_RESET,
  }

  return c.json({ configs })
}

export const getOpenidConfig = async (c: Context<typeConfig.Context>) => {
  const { AUTH_SERVER_URL: serverUrl } = env(c)
  const oauthRoot = `${serverUrl}${routeConfig.InternalRoute.OAuth}`
  return c.json({
    issuer: serverUrl,
    authorization_endpoint: `${oauthRoot}/authorize`,
    token_endpoint: `${oauthRoot}/token`,
    userinfo_endpoint: `${oauthRoot}/userinfo`,
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
  const jwk = await cryptoUtil.secretToJwk(publicKey)
  return c.json({ keys: [jwk] })
}
