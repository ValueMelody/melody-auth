import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import * as samlHandler from 'saml/handler'
import { configMiddleware } from 'middlewares'

const SpBaseRoute = routeConfig.InternalRoute.SamlSp
const samlRoutes = new Hono<typeConfig.Context>()
export default samlRoutes

samlRoutes.get(
  `${SpBaseRoute}/metadata`,
  configMiddleware.enableSamlSp,
  samlHandler.getSamlSpMetadata,
)

samlRoutes.get(
  `${SpBaseRoute}/:name/login`,
  configMiddleware.enableSamlSp,
  samlHandler.getSamlSpLogin,
)

samlRoutes.post(
  `${SpBaseRoute}/acs`,
  configMiddleware.enableSamlSp,
  samlHandler.postSamlSpAcs,
)
