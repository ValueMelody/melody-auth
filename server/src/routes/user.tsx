import {
  errorConfig,
  localeConfig,
  routeConfig, typeConfig,
} from 'configs'
import {
  authMiddleware, configMiddleware,
} from 'middlewares'
import { userService } from 'services'

const BaseRoute = routeConfig.InternalRoute.ApiUsers

export const load = (app: typeConfig.App) => {
  app.get(
    `${BaseRoute}`,
    authMiddleware.s2sReadUser,
    async (c) => {
      const includeDeleted = c.req.query('include_disabled') === 'true'
      const users = await userService.getUsers(
        c,
        includeDeleted,
      )
      return c.json({ users })
    },
  )

  app.get(
    `${BaseRoute}/:authId`,
    authMiddleware.s2sReadUser,
    async (c) => {
      const includeDeleted = c.req.query('include_disabled') === 'true'
      const authId = c.req.param('authId')
      const user = await userService.getUserByAuthId(
        c,
        authId,
        includeDeleted,
      )
      return c.json({ user })
    },
  )

  app.post(
    `${BaseRoute}/:authId/verify-email`,
    authMiddleware.s2sWriteUser,
    configMiddleware.enableEmailVerification,
    async (c) => {
      const authId = c.req.param('authId')
      const user = await userService.getUserByAuthId(
        c,
        authId,
      )

      if (user.emailVerified) throw new errorConfig.Forbidden(localeConfig.Error.EmailAlreadyVerified)

      await userService.sendEmailVerification(
        c,
        user,
      )
      return c.json({ success: true })
    },
  )

  app.put(
    `${BaseRoute}/:authId/enable`,
    authMiddleware.s2sWriteUser,
    async (c) => {
      const authId = c.req.param('authId')
      await userService.enableUser(
        c,
        authId,
      )

      return c.json({ success: true })
    },
  )

  app.put(
    `${BaseRoute}/:authId/disable`,
    authMiddleware.s2sWriteUser,
    async (c) => {
      const authId = c.req.param('authId')
      await userService.disableUser(
        c,
        authId,
      )
      return c.json({ success: true })
    },
  )
}
