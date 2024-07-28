import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { typeConfig } from 'configs'
import {
  oauthRoute, userRoute, identityRoute,
  otherRoute, appRoute, roleRoute, scopeRoute,
} from 'routes'
import { setupMiddleware } from 'middlewares'

const app = new Hono<typeConfig.Context>()

app.use(
  '/*',
  cors(),
  setupMiddleware.session,
)

app.route(
  '/',
  scopeRoute,
)
app.route(
  '/',
  roleRoute,
)
app.route(
  '/',
  appRoute,
)
app.route(
  '/',
  userRoute,
)
app.route(
  '/',
  identityRoute,
)
app.route(
  '/',
  oauthRoute,
)
app.route(
  '/',
  otherRoute,
)

export default app
