import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import { orgHandler } from 'handlers'
import { authMiddleware } from 'middlewares'

const BaseRoute = routeConfig.InternalRoute.ApiOrgs
const orgRoutes = new Hono<typeConfig.Context>()
export default orgRoutes

/**
 * @swagger
 * /api/v1/orgs:
 *   get:
 *     summary: Get a list of orgs
 *     description: Required scope - read_org
 *     tags: [Orgs]
 *     responses:
 *       200:
 *         description: A list of orgs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orgs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Org'
 */
orgRoutes.get(
  `${BaseRoute}`,
  authMiddleware.s2sReadOrg,
  orgHandler.getOrgs,
)

/**
 * @swagger
 * /api/v1/orgs/{id}:
 *   get:
 *     summary: Get a single org by ID
 *     description: Required scope - read_org
 *     tags: [Orgs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the org
 *     responses:
 *       200:
 *         description: A single org object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 org:
 *                   $ref: '#/components/schemas/Org'
 */
orgRoutes.get(
  `${BaseRoute}/:id`,
  authMiddleware.s2sReadOrg,
  orgHandler.getOrg,
)

/**
 * @swagger
 * /api/v1/orgs:
 *   post:
 *     summary: Create a new org
 *     description: Required scope - write_org
 *     tags: [Orgs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostOrgReq'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 org:
 *                   $ref: '#/components/schemas/Org'
 */
orgRoutes.post(
  `${BaseRoute}`,
  authMiddleware.s2sWriteOrg,
  orgHandler.postOrg,
)

/**
 * @swagger
 * /api/v1/orgs/{id}:
 *   put:
 *     summary: Update an existing org by ID
 *     description: Required scope - write_org
 *     tags: [Orgs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the org
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PutOrgReq'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 org:
 *                   $ref: '#/components/schemas/Org'
 */
orgRoutes.put(
  `${BaseRoute}/:id`,
  authMiddleware.s2sWriteOrg,
  orgHandler.putOrg,
)

/**
 * @swagger
 * /api/v1/orgs/{id}:
 *   delete:
 *     summary: Delete an existing org by ID
 *     description: Required scope - write_org
 *     tags: [Orgs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the org
 *     responses:
 *       204:
 *         description: Successful operation with no content to return
 */
orgRoutes.delete(
  `${BaseRoute}/:id`,
  authMiddleware.s2sWriteOrg,
  orgHandler.deleteOrg,
)
