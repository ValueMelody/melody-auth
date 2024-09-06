import { readFileSync } from 'fs'
import { serve } from '@hono/node-server'
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
  '/*',
  async (
    c: Context<typeConfig.Context>, next: Next,
  ) => {
    c.env.KV = redisAdapter.fit() as unknown as any
    c.env.DB = pgAdapter.fit() as unknown as any
    c.env.SMTP = smtpAdapter.fit()
    await next()
  },
)

const appWithRouters = loadRouters(app)

serve({
  ...appWithRouters,
  port: 8787,
})
