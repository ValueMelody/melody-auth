import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import { orgHandler } from 'handlers'
import {
  authMiddleware, configMiddleware,
} from 'middlewares'

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
  configMiddleware.enableOrg,
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
  configMiddleware.enableOrg,
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
  configMiddleware.enableOrg,
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
  configMiddleware.enableOrg,
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
  configMiddleware.enableOrg,
  authMiddleware.s2sWriteOrg,
  orgHandler.deleteOrg,
)

/**
 * @swagger
 * /api/v1/orgs/{id}/users:
 *   get:
 *     summary: Get a list of users currently active in one organization
 *     description: Required scopes - read_org, read_user
 *     tags: [Orgs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the org
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *         description: Number of users to return per page
 *       - in: query
 *         name: page_number
 *         schema:
 *           type: integer
 *         description: Page number to return
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: A list of active users in this org
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 count:
 *                   type: integer
 *                   description: Total number of users matching the query
 */
orgRoutes.get(
  `${BaseRoute}/:id/users`,
  configMiddleware.enableOrg,
  authMiddleware.s2sReadOrg,
  authMiddleware.s2sReadUser,
  orgHandler.getOrgActiveUsers,
)

/**
 * @swagger
 * /api/v1/orgs/{id}/all-users:
 *   get:
 *     summary: Get a list of all users in one organization
 *     description: Required scopes - read_org, read_user
 *     tags: [Orgs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the org
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *         description: Number of users to return per page
 *       - in: query
 *         name: page_number
 *         schema:
 *           type: integer
 *         description: Page number to return
 *     responses:
 *       200:
 *         description: A list of all users in this org
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 count:
 *                   type: integer
 *                   description: Total number of users matching the query
 */
orgRoutes.get(
  `${BaseRoute}/:id/all-users`,
  configMiddleware.enableOrg,
  authMiddleware.s2sReadOrg,
  authMiddleware.s2sReadUser,
  orgHandler.getOrgAllUsers,
)

/**
 * @swagger
 * /api/v1/orgs/{id}/verify-domain:
 *   post:
 *     summary: Verify custom domain ownership via DNS TXT record
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
 *       200:
 *         description: Domain verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 org:
 *                   $ref: '#/components/schemas/Org'
 */
orgRoutes.post(
  `${BaseRoute}/:id/verify-domain`,
  configMiddleware.enableOrg,
  authMiddleware.s2sWriteOrg,
  orgHandler.verifyCustomDomain,
)
