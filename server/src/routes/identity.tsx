import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import {
  authMiddleware, configMiddleware,
  setupMiddleware,
} from 'middlewares'
import { identityHandler } from 'handlers'

const BaseRoute = routeConfig.InternalRoute.Identity
const identityRoutes = new Hono<typeConfig.Context>()
export default identityRoutes

identityRoutes.get(
  `${BaseRoute}/authorize-password`,
  identityHandler.getAuthorizePassword,
)

identityRoutes.post(
  `${BaseRoute}/authorize-password`,
  setupMiddleware.validOrigin,
  identityHandler.postAuthorizePassword,
)

identityRoutes.get(
  `${BaseRoute}/authorize-account`,
  configMiddleware.enableSignUp,
  identityHandler.getAuthorizeAccount,
)

identityRoutes.post(
  `${BaseRoute}/authorize-account`,
  setupMiddleware.validOrigin,
  configMiddleware.enableSignUp,
  identityHandler.postAuthorizeAccount,
)

identityRoutes.get(
  `${BaseRoute}/authorize-reset`,
  configMiddleware.enablePasswordReset,
  identityHandler.getAuthorizeReset,
)

identityRoutes.post(
  `${BaseRoute}/authorize-reset`,
  setupMiddleware.validOrigin,
  configMiddleware.enablePasswordReset,
  identityHandler.postAuthorizeReset,
)

identityRoutes.get(
  `${BaseRoute}/authorize-consent`,
  identityHandler.getAuthorizeConsent,
)

identityRoutes.post(
  `${BaseRoute}/authorize-consent`,
  setupMiddleware.validOrigin,
  identityHandler.postAuthorizeConsent,
)

identityRoutes.post(
  `${BaseRoute}/reset-code`,
  setupMiddleware.validOrigin,
  configMiddleware.enablePasswordReset,
  identityHandler.postResetCode,
)

identityRoutes.get(
  `${BaseRoute}/verify-email`,
  configMiddleware.enableEmailVerification,
  identityHandler.getVerifyEmail,
)

identityRoutes.post(
  `${BaseRoute}/verify-email`,
  setupMiddleware.validOrigin,
  configMiddleware.enableEmailVerification,
  identityHandler.postVerifyEmail,
)

identityRoutes.post(
  `${BaseRoute}/logout`,
  authMiddleware.spa,
  identityHandler.postLogout,
)