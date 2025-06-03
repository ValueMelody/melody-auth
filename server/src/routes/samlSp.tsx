import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import { samlSpHandler } from 'handlers'
import { configMiddleware } from 'middlewares'

const BaseRoute = routeConfig.InternalRoute.SamlSp
const samlSpRoutes = new Hono<typeConfig.Context>()
export default samlSpRoutes

samlSpRoutes.get(
  `${BaseRoute}/metadata`,
  configMiddleware.enableSamlSp,
  samlSpHandler.getSamlSpMetadata,
)

samlSpRoutes.get(
  `${BaseRoute}/:name/login`,
  configMiddleware.enableSamlSp,
  samlSpHandler.getSamlSpLogin,
)

samlSpRoutes.post(
  `${BaseRoute}/acs`,
  configMiddleware.enableSamlSp,
  samlSpHandler.postSamlSpAcs,
)
