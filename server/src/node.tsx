import { readFileSync } from 'fs'
import { serve } from '@hono/node-server'
import {
  Context, Hono, Next,
} from 'hono'
import { cors } from 'hono/cors'
import * as dotenv from 'dotenv'
import toml from 'toml'
import { typeConfig } from 'configs'
import {
  oauthRoute, userRoute, identityRoute,
  otherRoute, appRoute, roleRoute, scopeRoute,
} from 'routes'
import { setupMiddleware } from 'middlewares'
import { kvModule } from 'tests/mock'
import { pgAdapter } from 'adapters'

const config = toml.parse(readFileSync(
  './wrangler.toml',
  'utf-8',
))

global.process.env = { ...config.vars }

dotenv.config({ path: '.dev.vars' })

pgAdapter.initConnection()

const app = new Hono<typeConfig.Context>()

app.use(
  '/*',
  cors(),
  async (
    c: Context<typeConfig.Context>, next: Next,
  ) => {
    c.env.KV = kvModule as unknown as any
    c.env.DB = pgAdapter.fit() as unknown as any
    await next()
  },
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

serve({
  ...app,
  port: 8787,
})
