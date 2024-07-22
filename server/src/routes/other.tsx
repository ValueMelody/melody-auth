import { env } from 'hono/adapter'
import {
  routeConfig, typeConfig,
} from 'configs'
import { oauthDto } from 'dtos'

export const load = (app: typeConfig.App) => {
  app.get(
    '/info',
    async (c) => {
      const environment = env(c)

      const configs = {
        AUTHORIZATION_CODE_EXPIRES_IN: environment.AUTHORIZATION_CODE_EXPIRES_IN,
        SPA_ACCESS_TOKEN_EXPIRES_IN: environment.SPA_ACCESS_TOKEN_EXPIRES_IN,
        SPA_REFRESH_TOKEN_EXPIRES_IN: environment.SPA_REFRESH_TOKEN_EXPIRES_IN,
        S2S_ACCESS_TOKEN_EXPIRES_IN: environment.S2S_ACCESS_TOKEN_EXPIRES_IN,
        ID_TOKEN_EXPIRES_IN: environment.ID_TOKEN_EXPIRES_IN,
        SERVER_SESSION_EXPIRES_IN: environment.SERVER_SESSION_EXPIRES_IN,
        AUTH_SERVER_URL: environment.AUTH_SERVER_URL,
        COMPANY_LOGO_URL: environment.COMPANY_LOGO_URL,
        ENABLE_SIGN_UP: environment.ENABLE_SIGN_UP,
        ENABLE_PASSWORD_RESET: environment.ENABLE_PASSWORD_RESET,
        ENABLE_NAMES: environment.ENABLE_NAMES,
        NAMES_IS_REQUIRED: environment.NAMES_IS_REQUIRED,
        ENABLE_USER_APP_CONSENT: environment.ENABLE_USER_APP_CONSENT,
        ENABLE_EMAIL_VERIFICATION: environment.ENABLE_EMAIL_VERIFICATION,
        ENABLE_USER_ROLE: environment.ENABLE_USER_ROLE,
      }

      return c.json({ configs })
    },
  )

  app.get(
    '/.well-known/openid-configuration',
    async (c) => {
      const { AUTH_SERVER_URL: serverUrl } = env(c)
      const oauthRoot = `${serverUrl}${routeConfig.InternalRoute.OAuth}`
      return c.json({
        issuer: serverUrl,
        authorization_endpoint: `${oauthRoot}/authorize`,
        token_endpoint: `${oauthRoot}/token`,
        userinfo_endpoint: `${oauthRoot}/userinfo`,
        scopes_supported: Object.values(typeConfig.Scope),
        response_types_supported: ['code'],
        grant_types_supported: Object.values(oauthDto.TokenGrantType),
        token_endpoint_auth_methods_supported: ['client_secret_basic'],
        claims_supported: ['sub', 'email', 'first_name', 'last_name'],
        id_token_signing_alg_values_supported: ['HS256'],
        code_challenge_methods_supported: ['plain', 'S256'],
      })
    },
  )
}
