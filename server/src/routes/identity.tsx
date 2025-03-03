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
  routeConfig.IdentityRoute.AuthorizeView,
  identityHandler.getAuthorizeView,
)

identityRoutes.get(
  routeConfig.IdentityRoute.ProcessView,
  identityHandler.getProcessView,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeConsentInfo,
  identityHandler.getAuthorizeConsentInfo,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeOtpSetupInfo,
  identityHandler.getAuthorizeOtpSetupInfo,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeOtpMfaInfo,
  identityHandler.getAuthorizeOtpMfaInfo,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeSmsMfaInfo,
  identityHandler.getAuthorizeSmsMfaInfo,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizePasskeyEnrollInfo,
  identityHandler.getAuthorizePasskeyEnrollInfo,
)

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

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizePasskeyEnroll,
  configMiddleware.enablePasskeyEnrollment,
  identityHandler.getAuthorizePasskeyEnroll,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizePasskeyEnroll,
  setupMiddleware.validOrigin,
  configMiddleware.enablePasskeyEnrollment,
  identityHandler.postAuthorizePasskeyEnroll,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizePasskeyEnrollDecline,
  setupMiddleware.validOrigin,
  configMiddleware.enablePasskeyEnrollment,
  identityHandler.postAuthorizePasskeyEnrollDecline,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizePasskeyVerify,
  configMiddleware.enablePasskeyEnrollment,
  identityHandler.getAuthorizePasskeyVerify,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizePasskeyVerify,
  setupMiddleware.validOrigin,
  configMiddleware.enablePasskeyEnrollment,
  identityHandler.postAuthorizePasskeyVerify,
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
  routeConfig.IdentityRoute.Logout,
  authMiddleware.spa,
  identityHandler.postLogout,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthCodeExpired,
  identityHandler.getAuthCodeExpired,
)

/**
 * Authorize Social-signin
 * - AuthorizeGoogle
 * - AuthorizeFacebook
 * - AuthorizeGitHub
 */
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

/**
 * Process MFA
 * - ProcessMfaEnroll
 */
identityRoutes.get(
  routeConfig.IdentityRoute.ProcessMfaEnroll,
  configMiddleware.enableMfaEnroll,
  identityHandler.getProcessMfaEnroll,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ProcessMfaEnroll,
  configMiddleware.enableMfaEnroll,
  identityHandler.postProcessMfaEnroll,
)

/**
 * Policy
 * - ChangePassword
 * - ChangeEmail
 * - ResetMfa
 * - ManagePasskey
 * - UpdateInfo
 */
identityRoutes.post(
  routeConfig.IdentityRoute.ChangePassword,
  setupMiddleware.validOrigin,
  configMiddleware.enableChangePasswordPolicy,
  identityHandler.postChangePassword,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ChangeEmailCode,
  configMiddleware.enableChangeEmailPolicy,
  identityHandler.postChangeEmailCode,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ChangeEmail,
  configMiddleware.enableChangeEmailPolicy,
  identityHandler.postChangeEmail,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ResetMfa,
  configMiddleware.enableResetMfaPolicy,
  identityHandler.postResetMfa,
)

identityRoutes.get(
  routeConfig.IdentityRoute.ManagePasskey,
  configMiddleware.enableManagePasskeyPolicy,
  identityHandler.getManagePasskey,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ManagePasskey,
  configMiddleware.enableManagePasskeyPolicy,
  identityHandler.postManagePasskey,
)

identityRoutes.delete(
  routeConfig.IdentityRoute.ManagePasskey,
  configMiddleware.enableManagePasskeyPolicy,
  identityHandler.deleteManagePasskey,
)

identityRoutes.post(
  routeConfig.IdentityRoute.UpdateInfo,
  configMiddleware.enableUpdateInfoPolicy,
  identityHandler.postUpdateInfo,
)

/**
 * Other
 * - VerifyEmail
 * - ResetPassword
 * - AuthCodeExpired
 */

identityRoutes.get(
  routeConfig.IdentityRoute.VerifyEmailView,
  configMiddleware.enableEmailVerification,
  identityHandler.getVerifyEmailView,
)

identityRoutes.post(
  routeConfig.IdentityRoute.VerifyEmail,
  setupMiddleware.validOrigin,
  configMiddleware.enableEmailVerification,
  identityHandler.postVerifyEmail,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ResetPasswordCode,
  setupMiddleware.validOrigin,
  configMiddleware.enablePasswordReset,
  identityHandler.postResetPasswordCode,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ResetPassword,
  setupMiddleware.validOrigin,
  configMiddleware.enablePasswordReset,
  identityHandler.postResetPassword,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthCodeExpiredView,
  identityHandler.getAuthCodeExpiredView,
)
