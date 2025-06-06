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
  configMiddleware.enableSamlAsSp,
  samlHandler.getSamlSpMetadata,
)

samlRoutes.get(
  `${SpBaseRoute}/login`,
  configMiddleware.enableSamlAsSp,
  samlHandler.getSamlSpLogin,
)

samlRoutes.post(
  `${SpBaseRoute}/acs`,
  configMiddleware.enableSamlAsSp,
  samlHandler.postSamlSpAcs,
)
