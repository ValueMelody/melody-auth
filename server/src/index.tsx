import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { typeConfig } from 'configs'
import {
  oauthRoute, userRoute, identityRoute,
  otherRoute, appRoute,
} from 'routes'
import { setupMiddleware } from 'middlewares'

const app = new Hono<typeConfig.Context>()

app.use(
  '/*',
  cors(),
  setupMiddleware.session,
)

otherRoute.load(app)
oauthRoute.load(app)
identityRoute.load(app)
userRoute.load(app)
appRoute.load(app)

export default app
