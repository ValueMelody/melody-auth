import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import {
  authMiddleware, configMiddleware,
} from 'middlewares'
import { orgGroupHandler } from 'handlers'

const BaseRoute = routeConfig.InternalRoute.ApiOrgGroups
const orgGroupRoutes = new Hono<typeConfig.Context>()
export default orgGroupRoutes

/**
 * @swagger
 * /api/v1/org-groups:
 *   get:
 *     summary: Get a list of org groups by orgId
 *     description: Required scope - read_org
 *     tags: [Org Groups]
 *     parameters:
 *       - in: query
 *         name: org_id
 *         schema:
 *           type: integer
 *         description: The unique ID of the org
 *     responses:
 *       200:
 *         description: A list of org groups by orgId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orgGroups:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrgGroup'
 */
orgGroupRoutes.get(
  BaseRoute,
  configMiddleware.enableOrgGroup,
  authMiddleware.s2sReadOrg,
  orgGroupHandler.getOrgGroups,
)

/**
 * @swagger
 * /api/v1/org-groups:
 *   post:
 *     summary: Create a new org group
 *     description: Required scope - write_org
 *     tags: [Org Groups]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostOrgGroupReq'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orgGroup:
 *                   $ref: '#/components/schemas/OrgGroup'
 */
orgGroupRoutes.post(
  BaseRoute,
  configMiddleware.enableOrgGroup,
  authMiddleware.s2sWriteOrg,
  orgGroupHandler.postOrgGroup,
)

/**
 * @swagger
 * /api/v1/org-groups/{id}:
 *   put:
 *     summary: Update an existing org group by ID
 *     description: Required scope - write_org
 *     tags: [Org Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the org group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PutOrgGroupReq'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orgGroup:
 *                   $ref: '#/components/schemas/OrgGroup'
 */
orgGroupRoutes.put(
  `${BaseRoute}/:id`,
  configMiddleware.enableOrgGroup,
  authMiddleware.s2sWriteOrg,
  orgGroupHandler.putOrgGroup,
)

/**
 * @swagger
 * /api/v1/org-groups/{id}:
 *   delete:
 *     summary: Delete an existing org group by ID
 *     description: Required scope - write_org
 *     tags: [Org Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the org group
 *     responses:
 *       204:
 *         description: Successful operation with no content to return
 */
orgGroupRoutes.delete(
  `${BaseRoute}/:id`,
  configMiddleware.enableOrgGroup,
  authMiddleware.s2sWriteOrg,
  orgGroupHandler.deleteOrgGroup,
)
