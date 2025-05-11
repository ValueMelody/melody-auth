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
