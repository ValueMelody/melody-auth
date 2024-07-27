import {
  routeConfig, typeConfig,
} from 'configs'
import {
  authMiddleware, configMiddleware,
  setupMiddleware,
} from 'middlewares'
import { identityHandler } from 'handlers'

const BaseRoute = routeConfig.InternalRoute.Identity

export const load = (app: typeConfig.App) => {
  app.get(
    `${BaseRoute}/authorize-password`,
    identityHandler.getAuthorizePassword,
  )

  app.post(
    `${BaseRoute}/authorize-password`,
    setupMiddleware.validOrigin,
    identityHandler.postAuthorizePassword,
  )

  app.get(
    `${BaseRoute}/authorize-account`,
    configMiddleware.enableSignUp,
    identityHandler.getAuthorizeAccount,
  )

  app.post(
    `${BaseRoute}/authorize-account`,
    setupMiddleware.validOrigin,
    configMiddleware.enableSignUp,
    identityHandler.postAuthorizeAccount,
  )

  app.get(
    `${BaseRoute}/authorize-reset`,
    configMiddleware.enablePasswordReset,
    identityHandler.getAuthorizeReset,
  )

  app.post(
    `${BaseRoute}/authorize-reset`,
    setupMiddleware.validOrigin,
    configMiddleware.enablePasswordReset,
    identityHandler.postAuthorizeReset,
  )

  app.get(
    `${BaseRoute}/authorize-consent`,
    identityHandler.getAuthorizeConsent,
  )

  app.post(
    `${BaseRoute}/authorize-consent`,
    setupMiddleware.validOrigin,
    identityHandler.postAuthorizeConsent,
  )

  app.post(
    `${BaseRoute}/reset-code`,
    setupMiddleware.validOrigin,
    configMiddleware.enablePasswordReset,
    identityHandler.postResetCode,
  )

  app.get(
    `${BaseRoute}/verify-email`,
    configMiddleware.enableEmailVerification,
    identityHandler.getVerifyEmail,
  )

  app.post(
    `${BaseRoute}/verify-email`,
    setupMiddleware.validOrigin,
    configMiddleware.enableEmailVerification,
    identityHandler.postVerifyEmail,
  )

  app.post(
    `${BaseRoute}/logout`,
    authMiddleware.spa,
    identityHandler.postLogout,
  )
}
