import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import {
  authMiddleware, configMiddleware,
} from 'middlewares'
import { userAttributeHandler } from 'handlers'

const BaseRoute = routeConfig.InternalRoute.ApiUserAttributes
const userAttributeRoutes = new Hono<typeConfig.Context>()
export default userAttributeRoutes

userAttributeRoutes.get(
  `${BaseRoute}`,
  configMiddleware.enableUserAttribute,
  authMiddleware.s2sUserAttribute,
  userAttributeHandler.getUserAttributes,
)

userAttributeRoutes.post(
  `${BaseRoute}`,
  configMiddleware.enableUserAttribute,
  authMiddleware.s2sUserAttribute,
  userAttributeHandler.createUserAttribute,
)

userAttributeRoutes.put(
  `${BaseRoute}/:id`,
  configMiddleware.enableUserAttribute,
  authMiddleware.s2sUserAttribute,
  userAttributeHandler.updateUserAttribute,
)

userAttributeRoutes.get(
  `${BaseRoute}/:id`,
  configMiddleware.enableUserAttribute,
  authMiddleware.s2sUserAttribute,
  userAttributeHandler.getUserAttribute,
)

userAttributeRoutes.delete(
  `${BaseRoute}/:id`,
  configMiddleware.enableUserAttribute,
  authMiddleware.s2sUserAttribute,
  userAttributeHandler.deleteUserAttribute,
)
