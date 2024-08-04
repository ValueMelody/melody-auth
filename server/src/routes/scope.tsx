import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import { scopeHandler } from 'handlers'
import { authMiddleware } from 'middlewares'

const BaseRoute = routeConfig.InternalRoute.ApiScopes
const scopeRoutes = new Hono<typeConfig.Context>()
export default scopeRoutes

/**
 * @swagger
 * /api/v1/scopes:
 *   get:
 *     summary: Get a list of scopes
 *     description: Required scope - read_scope
 *     tags: [Scopes]
 *     responses:
 *       200:
 *         description: A list of scopes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Scope'
 */
scopeRoutes.get(
  `${BaseRoute}`,
  authMiddleware.s2sReadScope,
  scopeHandler.getScopes,
)

/**
 * @swagger
 * /api/v1/scopes/{id}:
 *   get:
 *     summary: Get a single scope by ID
 *     description: Required scope - read_scope
 *     tags: [Scopes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the scope
 *     responses:
 *       200:
 *         description: A single scope object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scope'
 */
scopeRoutes.get(
  `${BaseRoute}/:id`,
  authMiddleware.s2sReadScope,
  scopeHandler.getScope,
)

/**
 * @swagger
 * /api/v1/scopes:
 *   post:
 *     summary: Create a new scope
 *     description: Required scope - write_scope
 *     tags: [Scopes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostScopeReq'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scope'
 */
scopeRoutes.post(
  `${BaseRoute}`,
  authMiddleware.s2sWriteScope,
  scopeHandler.postScope,
)

/**
 * @swagger
 * /api/v1/scopes/{id}:
 *   put:
 *     summary: Update an existing scope by ID
 *     description: Required scope - write_scope
 *     tags: [Scopes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the scope
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PutScopeReq'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Scope'
 */
scopeRoutes.put(
  `${BaseRoute}/:id`,
  authMiddleware.s2sWriteScope,
  scopeHandler.putScope,
)
