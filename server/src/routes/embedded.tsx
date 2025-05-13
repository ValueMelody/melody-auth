import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import { embeddedHandler } from 'handlers'
import { setupMiddleware } from 'middlewares'

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
 * /embedded-auth/v1/sign-in:
 *   post:
 *     summary: Sign in using the embedded auth session
 *     tags: [Embedded Auth]
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
 *               $ref: '#/components/schemas/EmbeddedAuthResponse'
 */
embeddedRoutes.post(
  routeConfig.EmbeddedRoute.SignIn,
  setupMiddleware.validEmbeddedOrigin,
  embeddedHandler.signIn,
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
