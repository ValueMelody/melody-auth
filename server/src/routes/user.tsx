import {
  errorConfig,
  localeConfig,
  routeConfig, typeConfig,
} from 'configs'
import {
  authMiddleware, configMiddleware,
} from 'middlewares'
import { userModel } from 'models'
import { userService } from 'services'
import { timeUtil } from 'utils'

const BaseRoute = routeConfig.InternalRoute.ApiUsers

export const load = (app: typeConfig.App) => {
  app.get(
    `${BaseRoute}`,
    authMiddleware.s2sReadUser,
    async (c) => {
      const includeDeleted = c.req.query('include_disabled') === 'true'
      const users = await userModel.getAll(
        c.env.DB,
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
      const user = await userModel.getByAuthId(
        c.env.DB,
        authId,
      )
      if (!user) throw new errorConfig.NotFound(localeConfig.Error.NoUser)
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
      const includeDeleted = true
      const user = await userService.getUserByAuthId(
        c,
        authId,
        includeDeleted,
      )

      if (!user.deletedAt) throw new errorConfig.NotFound(localeConfig.Error.NoUser)

      await userModel.update(
        c.env.DB,
        user.id,
        { deletedAt: null },
      )

      return c.json({ success: true })
    },
  )

  app.put(
    `${BaseRoute}/:authId/disable`,
    authMiddleware.s2sWriteUser,
    async (c) => {
      const authId = c.req.param('authId')
      const user = await userService.getUserByAuthId(
        c,
        authId,
      )

      await userModel.update(
        c.env.DB,
        user.id,
        { deletedAt: timeUtil.getDbCurrentTime() },
      )
      return c.json({ success: true })
    },
  )
}
