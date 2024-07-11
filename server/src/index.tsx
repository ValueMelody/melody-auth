import { Hono } from 'hono'
import { typeConfig } from 'configs'
import { oauthRoute } from 'routes'

const app = new Hono<typeConfig.Context>()

oauthRoute.load(app)

export default app
