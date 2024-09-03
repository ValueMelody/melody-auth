import { readFileSync } from 'fs'
import { serve } from '@hono/node-server'
import {
  Context, Next,
} from 'hono'
import * as dotenv from 'dotenv'
import toml from 'toml'
import { typeConfig } from 'configs'
import {
  pgAdapter, redisAdapter,
} from 'adapters'
import app from 'index'

const config = toml.parse(readFileSync(
  './wrangler.toml',
  'utf-8',
))

global.process.env = { ...config.vars }

dotenv.config({ path: '.dev.vars' })

pgAdapter.initConnection()
redisAdapter.initConnection()

app.use(
  '/*',
  async (
    c: Context<typeConfig.Context>, next: Next,
  ) => {
    c.env.KV = redisAdapter.fit() as unknown as any
    c.env.DB = pgAdapter.fit() as unknown as any
    await next()
  },
)

serve({
  ...app,
  port: 8787,
})
