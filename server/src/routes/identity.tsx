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
/**
 * Identity Main
 * - AuthorizeView
 * - ProcessView
 * - AuthorizePassword
 * - AuthorizeAccount
 * - AuthorizeRecoveryCode
 * - AppConsent
 * - Logout
 */
identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeView,
  identityHandler.getAuthorizeView,
)

identityRoutes.get(
  routeConfig.IdentityRoute.ProcessView,
  identityHandler.getProcessView,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizePassword,
  setupMiddleware.validOrigin,
  configMiddleware.enablePasswordSignIn,
  identityHandler.postAuthorizePassword,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizeRecoveryCode,
  setupMiddleware.validOrigin,
  configMiddleware.enableRecoveryCode,
  identityHandler.postAuthorizeRecoveryCode,
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
  routeConfig.IdentityRoute.AppConsent,
  configMiddleware.enableAppConsent,
  identityHandler.getAppConsent,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AppConsent,
  setupMiddleware.validOrigin,
  configMiddleware.enableAppConsent,
  identityHandler.postAppConsent,
)

identityRoutes.post(
  routeConfig.IdentityRoute.Logout,
  authMiddleware.spa,
  identityHandler.postLogout,
)

/**
 * Authorize Social-signin
 * - AuthorizeGoogle
 * - AuthorizeFacebook
 * - AuthorizeGitHub
 * - AuthorizeDiscord
 * - AuthorizeOIDC
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

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeDiscord,
  configMiddleware.enableDiscordSignIn,
  identityHandler.getAuthorizeDiscord,
)

identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizeApple,
  configMiddleware.enableAppleSignIn,
  identityHandler.postAuthorizeApple,
)

identityRoutes.get(
  `${routeConfig.IdentityRoute.AuthorizeOidc}/:provider`,
  configMiddleware.enableOidcSignIn,
  identityHandler.getAuthorizeOidc,
)

identityRoutes.get(
  routeConfig.IdentityRoute.AuthorizeOidcConfigs,
  configMiddleware.enableOidcSignIn,
  identityHandler.getAuthorizeOidcConfigs,
)

/**
 * Passwordless Sign-in
 */
identityRoutes.post(
  routeConfig.IdentityRoute.AuthorizePasswordless,
  setupMiddleware.validOrigin,
  configMiddleware.enablePasswordlessSignIn,
  identityHandler.postAuthorizePasswordless,
)

identityRoutes.post(
  routeConfig.IdentityRoute.SendPasswordlessCode,
  setupMiddleware.validOrigin,
  identityHandler.postSendPasswordlessCode,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ProcessPasswordlessCode,
  setupMiddleware.validOrigin,
  identityHandler.postProcessPasswordlessCode,
)

/**
 * Process MFA
 * - ProcessMfaEnroll
 * - ProcessEmailMfa
 * - ProcessSmsMfa
 * - ProcessOtpMfa
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

identityRoutes.post(
  routeConfig.IdentityRoute.SendEmailMfa,
  setupMiddleware.validOrigin,
  identityHandler.postSendEmailMfa,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ProcessEmailMfa,
  setupMiddleware.validOrigin,
  identityHandler.postProcessEmailMfa,
)

identityRoutes.post(
  routeConfig.IdentityRoute.SetupSmsMfa,
  setupMiddleware.validOrigin,
  identityHandler.postSetupSmsMfa,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ResendSmsMfa,
  setupMiddleware.validOrigin,
  identityHandler.resendSmsMfa,
)

identityRoutes.get(
  routeConfig.IdentityRoute.ProcessSmsMfa,
  identityHandler.getProcessSmsMfa,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ProcessSmsMfa,
  setupMiddleware.validOrigin,
  identityHandler.postProcessSmsMfa,
)

identityRoutes.get(
  routeConfig.IdentityRoute.OtpMfaSetup,
  identityHandler.getOtpMfaSetup,
)

identityRoutes.get(
  routeConfig.IdentityRoute.ProcessOtpMfa,
  identityHandler.getProcessOtpMfa,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ProcessOtpMfa,
  setupMiddleware.validOrigin,
  identityHandler.postProcessOtpMfa,
)

/**
 * Process Passkey
 * - ProcessPasskeyEnroll
 * - AuthorizePasskeyEnrollDecline
 * - AuthorizePasskeyVerify
 */

identityRoutes.get(
  routeConfig.IdentityRoute.ProcessPasskeyEnroll,
  configMiddleware.enablePasskeyEnrollment,
  identityHandler.getProcessPasskeyEnroll,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ProcessPasskeyEnroll,
  setupMiddleware.validOrigin,
  configMiddleware.enablePasskeyEnrollment,
  identityHandler.postProcessPasskeyEnroll,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ProcessPasskeyEnrollDecline,
  setupMiddleware.validOrigin,
  configMiddleware.enablePasskeyEnrollment,
  identityHandler.postProcessPasskeyEnrollDecline,
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

/**
 * Process Recovery Code
 * - ProcessRecoveryCodeEnroll
 */
identityRoutes.get(
  routeConfig.IdentityRoute.ProcessRecoveryCodeEnroll,
  configMiddleware.enableRecoveryCode,
  identityHandler.getProcessRecoveryCodeEnroll,
)

identityRoutes.post(
  routeConfig.IdentityRoute.ProcessRecoveryCodeEnroll,
  configMiddleware.enableRecoveryCode,
  identityHandler.postProcessRecoveryCodeEnroll,
)

/**
 * Policy
 * - ChangePassword
 * - ChangeEmail
 * - ResetMfa
 * - ManagePasskey
 * - ManageRecoveryCode
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

identityRoutes.post(
  routeConfig.IdentityRoute.ManageRecoveryCode,
  configMiddleware.enableManageRecoveryCodePolicy,
  identityHandler.postManageRecoveryCode,
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
