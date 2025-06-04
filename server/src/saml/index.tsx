import { Hono } from 'hono'
import { typeConfig } from 'configs'
import { loadRouters } from 'router'
import samlRoutes from 'saml/route'

const app = new Hono<typeConfig.Context>()

const appWithRouters = loadRouters(app)

appWithRouters.route(
  '/',
  samlRoutes,
)

export default appWithRouters
