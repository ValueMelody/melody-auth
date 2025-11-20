import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import { embeddedHandler } from 'handlers'
import {
  configMiddleware, setupMiddleware,
} from 'middlewares'

const embeddedRoutes = new Hono<typeConfig.Context>()
export default embeddedRoutes

/**
 * @swagger
 * /embedded-auth/v1/initiate:
 *   post:
 *     summary: Initiate a new embedded auth session
 *     tags: [Embedded Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostInitiateReq'
 *     responses:
 *       200:
 *         description: A session id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sessionId:
 *                   type: string
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.Initiate,
  setupMiddleware.validEmbeddedOrigin,
  embeddedHandler.initiate,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/sign-up:
 *   get:
 *     summary: Get sign up info, only need to call this endpoint if you enabled user attribute for sign up form
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sign up info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetSignUpInfoRes'
 */
embeddedRoutes.get(
  routeConfig.EmbeddedRoute.SignUp,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enableSignUp,
  embeddedHandler.getSignUpInfo,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/sign-up:
 *   post:
 *     summary: Sign up using the embedded auth session
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostSignUpReq'
 *     responses:
 *       200:
 *         description: Next step of the auth flow
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRes'
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.SignUp,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enableSignUp,
  embeddedHandler.signUp,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/sign-in:
 *   post:
 *     summary: Sign in using the embedded auth session
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostSignInReq'
 *     responses:
 *       200:
 *         description: Next step of the auth flow
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRes'
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.SignIn,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enablePasswordSignIn,
  embeddedHandler.signIn,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/app-consent:
 *   get:
 *     summary: Get app consent
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: App consent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetAppConsentRes'
 */
embeddedRoutes.get(
  routeConfig.EmbeddedRoute.AppConsent,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enableAppConsent,
  embeddedHandler.getAppConsent,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/app-consent:
 *   post:
 *     summary: Post app consent
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: App consent
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRes'
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.AppConsent,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enableAppConsent,
  embeddedHandler.postAppConsent,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/mfa-enrollment:
 *   get:
 *     summary: Get mfa enrollment
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Mfa enrollment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MfaEnrollmentInfoRes'
 */
embeddedRoutes.get(
  routeConfig.EmbeddedRoute.MfaEnrollment,
  setupMiddleware.validEmbeddedOrigin,
  embeddedHandler.getMfaEnrollment,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/mfa-enrollment:
 *   post:
 *     summary: Enroll a new mfa
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostMfaEnrollmentReq'
 *     responses:
 *       200:
 *         description: Mfa enrolled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRes'
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.MfaEnrollment,
  setupMiddleware.validEmbeddedOrigin,
  embeddedHandler.postMfaEnrollment,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/email-mfa-code:
 *   post:
 *     summary: send an email mfa code to the user
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: an email mfa code has been sent to the user
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.EmailMfaCode,
  setupMiddleware.validEmbeddedOrigin,
  embeddedHandler.postEmailMfaCode,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/email-mfa:
 *   post:
 *     summary: verify the email mfa code
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MfaCodeReq'
 *     responses:
 *       200:
 *         description: the email mfa code has been verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRes'
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.EmailMfa,
  setupMiddleware.validEmbeddedOrigin,
  embeddedHandler.postEmailMfa,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/otp-mfa-setup:
 *   get:
 *     summary: get the otp mfa initial setup info, this is for the first time otp mfa setup
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: the otp mfa initial setup info
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OtpMfaSetupRes'
 */
embeddedRoutes.get(
  routeConfig.EmbeddedRoute.OtpMfaSetup,
  setupMiddleware.validEmbeddedOrigin,
  embeddedHandler.getOtpMfaSetup,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/otp-mfa:
 *   get:
 *     summary: get the otp mfa config, this is for the existing otp mfa verification
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: the otp mfa config
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OtpMfaConfigRes'
 */
embeddedRoutes.get(
  routeConfig.EmbeddedRoute.OtpMfa,
  setupMiddleware.validEmbeddedOrigin,
  embeddedHandler.getOtpMfa,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/otp-mfa:
 *   post:
 *     summary: verify the otp mfa code
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MfaCodeReq'
 *     responses:
 *       200:
 *         description: the otp mfa code has been verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRes'
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.OtpMfa,
  setupMiddleware.validEmbeddedOrigin,
  embeddedHandler.postOtpMfa,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/sms-mfa-setup:
 *   post:
 *     summary: send a sms mfa code to the phone number provided, this is for the first time sms mfa setup
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SmsMfaSetupReq'
 *     responses:
 *       200:
 *         description: a new sms mfa code has been sent to the user
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.SmsMfaSetup,
  setupMiddleware.validEmbeddedOrigin,
  embeddedHandler.postSmsMfaSetup,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/sms-mfa:
 *   get:
 *     summary: get the sms mfa config, this will also send a sms mfa code to the user
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: the sms mfa config
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SmsMfaConfigRes'
 */
embeddedRoutes.get(
  routeConfig.EmbeddedRoute.SmsMfa,
  setupMiddleware.validEmbeddedOrigin,
  embeddedHandler.getSmsMfa,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/sms-mfa-code:
 *   post:
 *     summary: send a new sms mfa code to the user
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: a new sms mfa code has been sent to the user
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.SmsMfaCode,
  setupMiddleware.validEmbeddedOrigin,
  embeddedHandler.postSmsMfaCode,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/sms-mfa:
 *   post:
 *     summary: verify the sms mfa code
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MfaCodeReq'
 *     responses:
 *       200:
 *         description: the sms mfa code has been verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRes'
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.SmsMfa,
  setupMiddleware.validEmbeddedOrigin,
  embeddedHandler.postSmsMfa,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/passkey-enroll:
 *   get:
 *     summary: get the passkey enroll options
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: the passkey enroll options
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PasskeyEnrollInfoRes'
 */
embeddedRoutes.get(
  routeConfig.EmbeddedRoute.PasskeyEnroll,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enablePasskeyEnrollment,
  embeddedHandler.getPasskeyEnroll,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/passkey-enroll:
 *   post:
 *     summary: enroll a new passkey
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostPasskeyEnrollReq'
 *     responses:
 *       200:
 *         description: Next step of the auth flow
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRes'
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.PasskeyEnroll,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enablePasskeyEnrollment,
  embeddedHandler.postPasskeyEnroll,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/passkey-enroll-decline:
 *   post:
 *     summary: decline to enroll a new passkey
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostPasskeyEnrollDeclineReq'
 *     responses:
 *       200:
 *         description: Next step of the auth flow
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRes'
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.PasskeyEnrollDecline,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enablePasskeyEnrollment,
  embeddedHandler.postPasskeyEnrollDecline,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/passkey-verify:
 *   get:
 *     summary: Get the passkey verify options for the target email
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: email
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: the passkey verify options
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PasskeyVerifyInfoRes'
 */
embeddedRoutes.get(
  routeConfig.EmbeddedRoute.PasskeyVerify,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enablePasskeyEnrollment,
  embeddedHandler.getPasskeyVerify,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/passkey-verify:
 *   post:
 *     summary: verify a passkey
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostPasskeyVerifyReq'
 *     responses:
 *       200:
 *         description: Next step of the auth flow
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRes'
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.PasskeyVerify,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enablePasskeyEnrollment,
  embeddedHandler.postPasskeyVerify,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/recovery-code-enroll:
 *   get:
 *     summary: get the recovery code, this is for the first time recovery code enroll
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: the recovery code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecoveryCodeEnrollRes'
 */
embeddedRoutes.get(
  routeConfig.EmbeddedRoute.RecoveryCodeEnroll,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enableRecoveryCode,
  embeddedHandler.getRecoveryCodeEnroll,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/recovery-code:
 *   post:
 *     summary: sign in with a recovery code
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostSignInWithRecoveryCodeReq'
 *     responses:
 *       200:
 *         description: Next step of the auth flow
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRes'
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.RecoveryCode,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enableRecoveryCode,
  embeddedHandler.signInWithRecoveryCode,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/switch-org:
 *   get:
 *     summary: Get user orgs
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User orgs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserOrgsRes'
 */
embeddedRoutes.get(
  routeConfig.EmbeddedRoute.UserOrgs,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enableOrg,
  configMiddleware.enableUserSwitchOrg,
  embeddedHandler.getUserOrgs,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/switch-org:
 *   post:
 *     summary: Switch user org
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostProcessSwitchOrgReq'
 *     responses:
 *       200:
 *         description: Next step of the auth flow
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRes'
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.UserOrgs,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enableOrg,
  configMiddleware.enableUserSwitchOrg,
  embeddedHandler.postUserOrgs,
)

/**
 * @swagger
 * /embedded-auth/v1/{sessionId}/app-banners:
 *   get:
 *     summary: get the app banners
 *     tags: [Embedded Auth]
 *     parameters:
 *       - name: sessionId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: the app banners
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppBannersRes'
 */
embeddedRoutes.get(
  routeConfig.EmbeddedRoute.AppBanners,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enableAppBanner,
  embeddedHandler.getAppBanners,
)

/**
 * @swagger
 * /embedded-auth/v1/token-exchange:
 *   post:
 *     summary: Exchange the auth code for access token, refresh token, id token
 *     tags: [Embedded Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenExchangeReq'
 *     responses:
 *       200:
 *         description: Access token, refresh token, id token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenExchangeRes'
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.TokenExchange,
  setupMiddleware.validEmbeddedOrigin,
  embeddedHandler.tokenExchange,
)

/**
 * @swagger
 * /embedded-auth/v1/token-refresh:
 *   post:
 *     summary: Refresh the access token
 *     tags: [Embedded Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TokenRefreshReq'
 *     responses:
 *       200:
 *         description: Access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenRefreshRes'
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.TokenRefresh,
  setupMiddleware.validEmbeddedOrigin,
  embeddedHandler.tokenRefresh,
)

/**
 * @swagger
 * /embedded-auth/v1/sign-out:
 *   post:
 *     summary: Sign out
 *     tags: [Embedded Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignOutReq'
 *     responses:
 *       200:
 *         description: Sign out successfully
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.SignOut,
  setupMiddleware.validEmbeddedOrigin,
  embeddedHandler.signOut,
)

/**
 * @swagger
 * /embedded-auth/v1/reset-password-code:
 *   post:
 *     summary: Trigger a password reset code
 *     tags: [Embedded Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordReq'
 *     responses:
 *       200:
 *         description: Password reset email triggered
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.ResetPasswordCode,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enablePasswordReset,
  embeddedHandler.resetPassword,
)
