import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { typeConfig } from 'configs'
import { oauthRoute } from 'routes'

const app = new Hono<typeConfig.Context>()

app.use(
  '/*',
  cors(),
)

oauthRoute.load(app)

export default app
