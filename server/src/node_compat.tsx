import { Hono } from 'hono'
import { typeConfig } from 'configs'
import { loadRouters } from 'router'
import { pgAdapter } from 'adapters'

const app = new Hono<typeConfig.Context>()

app.use(
  '/*',
  async (
    c, next,
  ) => {
    if (c.env.PG_CONNECTION_STRING) {
      pgAdapter.initConnection(c.env.PG_CONNECTION_STRING)
      c.env.DB = pgAdapter.fit() as unknown as any
    }
    await next()
  },
)

const appWithRouters = loadRouters(app)

export default appWithRouters
