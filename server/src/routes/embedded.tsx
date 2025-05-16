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
  embeddedHandler.postAppConsent,
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
 * /embedded-auth/v1/reset-password:
 *   post:
 *     summary: Trigger a password reset email
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
  routeConfig.EmbeddedRoute.ResetPassword,
  setupMiddleware.validEmbeddedOrigin,
  configMiddleware.enablePasswordReset,
  embeddedHandler.resetPassword,
)
