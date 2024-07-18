import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { typeConfig } from 'configs'
import {
  oauthRoute, userRoute, identityRoute
} from 'routes'
import { setupMiddleware } from 'middlewares'

const app = new Hono<typeConfig.Context>()

app.use(
  '/*',
  cors(),
  setupMiddleware.session,
)

oauthRoute.load(app)
userRoute.load(app)
identityRoute.load(app)

export default app
