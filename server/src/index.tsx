import { Hono } from 'hono'
import { typeConfig } from 'configs'
import { loadRouters } from 'router'

const app = new Hono<typeConfig.Context>()

const appWithRouters = loadRouters(app)


export default appWithRouters
