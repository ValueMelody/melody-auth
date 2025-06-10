import { readFileSync } from 'fs'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import {
  Context, Hono, Next,
} from 'hono'
import * as dotenv from 'dotenv'
import toml from 'toml'
import { typeConfig } from 'configs'
import {
  pgAdapter, redisAdapter, smtpAdapter,
} from 'adapters'
import { loadRouters } from 'router'
import samlRoutes from 'saml/route'

const config = toml.parse(readFileSync(
  './wrangler.toml',
  'utf-8',
))

global.process.env = { ...config.vars }

dotenv.config({ path: '.dev.vars' })

pgAdapter.initConnection()
redisAdapter.initConnection()

const app = new Hono<typeConfig.Context>()

app.use(
  '/client.css',
  serveStatic({ path: './dist/static/client.css' }),
)
app.use(
  '/client.js',
  serveStatic({ path: './dist/static/client.js' }),
)

app.use(
  '/*',
  async (
    c: Context<typeConfig.Context>, next: Next,
  ) => {
    c.env.KV = redisAdapter.fit() as unknown as any
    c.env.DB = pgAdapter.fit() as unknown as any
    if (process.env.SMTP_CONNECTION_STRING) c.env.SMTP = smtpAdapter.fit()
    await next()
  },
)

const appWithRouters = loadRouters(app)

appWithRouters.route(
  '/',
  samlRoutes,
)

serve({
  ...appWithRouters,
  port: 8787,
})

export default appWithRouters
