import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import {
  authMiddleware, configMiddleware,
  setupMiddleware,
} from 'middlewares'
import { identityHandler } from 'handlers'

const identityRoutes = new Hono<typeConfig.Context>()
export default identityRoutes

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizePassword,
  identityHandler.getAuthorizePassword,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizePassword,
  setupMiddleware.validOrigin,
  configMiddleware.enablePasswordSignIn,
  identityHandler.postAuthorizePassword,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeAccount,
  configMiddleware.enableSignUp,
  identityHandler.getAuthorizeAccount,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizeAccount,
  setupMiddleware.validOrigin,
  configMiddleware.enableSignUp,
  identityHandler.postAuthorizeAccount,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeMfaEnroll,
  configMiddleware.enableMfaEnroll,
  identityHandler.getAuthorizeMfaEnroll,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizeMfaEnroll,
  configMiddleware.enableMfaEnroll,
  identityHandler.postAuthorizeMfaEnroll,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeOtpSetup,
  identityHandler.getAuthorizeOtpSetup,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeOtpMfa,
  identityHandler.getAuthorizeOtpMfa,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizeOtpMfa,
  setupMiddleware.validOrigin,
  identityHandler.postAuthorizeOtpMfa,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeOtpSetup,
  identityHandler.getAuthorizeOtpSetup,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeSmsMfa,
  identityHandler.getAuthorizeSmsMfa,
)

identityRoutes.post(
  routeConfig.IdentityRoute.SetupSmsMfa,
  setupMiddleware.validOrigin,
  identityHandler.postSetupSmsMfa,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizeSmsMfa,
  setupMiddleware.validOrigin,
  identityHandler.postAuthorizeSmsMfa,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ResendSmsMfa,
  setupMiddleware.validOrigin,
  identityHandler.resendSmsMfa,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeEmailMfa,
  identityHandler.getAuthorizeEmailMfa,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizeEmailMfa,
  setupMiddleware.validOrigin,
  identityHandler.postAuthorizeEmailMfa,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ResendEmailMfa,
  setupMiddleware.validOrigin,
  identityHandler.postResendEmailMfa,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeConsent,
  identityHandler.getAuthorizeConsent,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizeConsent,
  setupMiddleware.validOrigin,
  identityHandler.postAuthorizeConsent,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizeGoogle,
  setupMiddleware.validOrigin,
  configMiddleware.enableGoogleSignIn,
  identityHandler.postAuthorizeGoogle,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizeFacebook,
  setupMiddleware.validOrigin,
  configMiddleware.enableFacebookSignIn,
  identityHandler.postAuthorizeFacebook,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeGitHub,
  configMiddleware.enableGithubSignIn,
  identityHandler.getAuthorizeGithub,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeReset,
  configMiddleware.enablePasswordReset,
  identityHandler.getAuthorizeReset,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizeReset,
  setupMiddleware.validOrigin,
  configMiddleware.enablePasswordReset,
  identityHandler.postAuthorizeReset,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ResetCode,
  setupMiddleware.validOrigin,
  configMiddleware.enablePasswordReset,
  identityHandler.postResetCode,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ResendResetCode,
  setupMiddleware.validOrigin,
  configMiddleware.enablePasswordReset,
  identityHandler.postResetCode,
)

identityRoutes.get(
  routeConfig.IdentityRoute.VerifyEmail,
  configMiddleware.enableEmailVerification,
  identityHandler.getVerifyEmail,
)

identityRoutes.post(
  routeConfig.IdentityRoute.VerifyEmail,
  setupMiddleware.validOrigin,
  configMiddleware.enableEmailVerification,
  identityHandler.postVerifyEmail,
)

identityRoutes.post(
  routeConfig.IdentityRoute.Logout,
  authMiddleware.spa,
  identityHandler.postLogout,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthCodeExpired,
  identityHandler.getAuthCodeExpired,
)
