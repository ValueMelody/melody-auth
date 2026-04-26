import { swaggerUI } from '@hono/swagger-ui'
import { Hono } from 'hono'
import s2sSwaggerSpec from '../scripts/swagger.json'
import embeddedSwaggerSpec from '../scripts/embedded-swagger.json'
import { otherHandler } from 'handlers'
import { typeConfig } from 'configs'
import { authMiddleware } from 'middlewares'

const otherRoutes = new Hono<typeConfig.Context>()
export default otherRoutes

/**
 * @swagger
 * /info:
 *   get:
 *     summary: Get system info
 *     description: Requires an authenticated S2S access token. No specific scope is required.
 *     tags: [System]
 *     security:
 *       - oauth2: []
 *     responses:
 *       200:
 *         description: System configuration values
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 configs:
 *                   type: object
 *                   additionalProperties: true
 *       401:
 *         description: Unauthorized
 */
otherRoutes.get(
  '/info',
  authMiddleware.s2s,
  otherHandler.getSystemInfo,
)

otherRoutes.get(
  '/.well-known/openid-configuration',
  otherHandler.getOpenidConfig,
)

otherRoutes.get(
  '/.well-known/jwks.json',
  otherHandler.getJwks,
)

otherRoutes.get(
  '/api/v1/swagger',
  swaggerUI({
    spec: s2sSwaggerSpec, url: '/',
  }),
)

otherRoutes.get(
  '/api/v1/embedded-swagger',
  swaggerUI({
    spec: embeddedSwaggerSpec, url: '/',
  }),
)
