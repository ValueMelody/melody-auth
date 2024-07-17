import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { typeConfig } from 'configs'
import { oauthRoute } from 'routes'
import { authMiddleware } from 'middlewares'

const app = new Hono<typeConfig.Context>()

app.use(
  '/*',
  cors(),
  authMiddleware.sessionSetup,
)

oauthRoute.load(app)

export default app
