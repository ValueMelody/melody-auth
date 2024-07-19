import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { env } from 'hono/adapter'
import {
  routeConfig, typeConfig,
} from 'configs'
import {
  oauthRoute, userRoute, identityRoute,
} from 'routes'
import { setupMiddleware } from 'middlewares'
import { oauthDto } from 'dtos'

const app = new Hono<typeConfig.Context>()

app.use(
  '/*',
  cors(),
  setupMiddleware.session,
)

oauthRoute.load(app)
userRoute.load(app)
identityRoute.load(app)

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

export default app
