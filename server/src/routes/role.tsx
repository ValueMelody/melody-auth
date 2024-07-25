import {
  routeConfig, typeConfig,
} from 'configs'
import { roleHandler } from 'handlers'
import { authMiddleware } from 'middlewares'

const BaseRoute = routeConfig.InternalRoute.ApiRoles

export const load = (app: typeConfig.App) => {
  app.get(
    `${BaseRoute}`,
    authMiddleware.s2sReadRole,
    roleHandler.getRoles,
  )

  app.get(
    `${BaseRoute}/:id`,
    authMiddleware.s2sReadRole,
    roleHandler.getRole,
  )

  app.post(
    `${BaseRoute}`,
    authMiddleware.s2sWriteRole,
    roleHandler.postRole,
  )

  app.put(
    `${BaseRoute}/:id`,
    authMiddleware.s2sWriteRole,
    roleHandler.putRole,
  )
}
