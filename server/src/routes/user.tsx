import {
  routeConfig, typeConfig,
} from 'configs'
import { userHandler } from 'handlers'
import {
  authMiddleware, configMiddleware,
} from 'middlewares'

const BaseRoute = routeConfig.InternalRoute.ApiUsers

export const load = (app: typeConfig.App) => {
  app.get(
    `${BaseRoute}`,
    authMiddleware.s2sReadUser,
    userHandler.getUsers,
  )

  app.get(
    `${BaseRoute}/:authId`,
    authMiddleware.s2sReadUser,
    userHandler.getUser,
  )

  app.post(
    `${BaseRoute}/:authId/verify-email`,
    authMiddleware.s2sWriteUser,
    configMiddleware.enableEmailVerification,
    userHandler.verifyEmail,
  )

  app.put(
    `${BaseRoute}/:authId/roles`,
    authMiddleware.s2sWriteUser,
    userHandler.updateRoles,
  )
}
