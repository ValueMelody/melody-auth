import { Hono } from 'hono'
import { typeConfig } from 'configs'
import { oauthRoute } from 'routes'

const app = new Hono<{ Bindings: typeConfig.Bindings }>()

oauthRoute.load(app)

export default app
