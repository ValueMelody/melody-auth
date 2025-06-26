import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import { roleHandler } from 'handlers'
import { authMiddleware } from 'middlewares'

const BaseRoute = routeConfig.InternalRoute.ApiRoles
const roleRoutes = new Hono<typeConfig.Context>()
export default roleRoutes

/**
 * @swagger
 * /api/v1/roles:
 *   get:
 *     summary: Get a list of roles
 *     description: Required scope - read_role
 *     tags: [Roles]
 *     responses:
 *       200:
 *         description: A list of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 roles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Role'
 */
roleRoutes.get(
  `${BaseRoute}`,
  authMiddleware.s2sReadRole,
  roleHandler.getRoles,
)

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   get:
 *     summary: Get a single role by ID
 *     description: Required scope - read_role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the role
 *     responses:
 *       200:
 *         description: A single role object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role:
 *                   $ref: '#/components/schemas/Role'
 */
roleRoutes.get(
  `${BaseRoute}/:id`,
  authMiddleware.s2sReadRole,
  roleHandler.getRole,
)

/**
 * @swagger
 * /api/v1/roles:
 *   post:
 *     summary: Create a new role
 *     description: Required scope - write_role
 *     tags: [Roles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostRoleReq'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role:
 *                   $ref: '#/components/schemas/Role'
 */
roleRoutes.post(
  `${BaseRoute}`,
  authMiddleware.s2sWriteRole,
  roleHandler.postRole,
)

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   put:
 *     summary: Update an existing role by ID
 *     description: Required scope - write_role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PutRoleReq'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 role:
 *                   $ref: '#/components/schemas/Role'
 */
roleRoutes.put(
  `${BaseRoute}/:id`,
  authMiddleware.s2sWriteRole,
  roleHandler.putRole,
)

/**
 * @swagger
 * /api/v1/roles/{id}:
 *   delete:
 *     summary: Delete an existing role by ID
 *     description: Required scope - write_role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the role
 *     responses:
 *       204:
 *         description: Successful operation with no content to return
 */
roleRoutes.delete(
  `${BaseRoute}/:id`,
  authMiddleware.s2sWriteRole,
  roleHandler.deleteRole,
)

/**
 * @swagger
 * /api/v1/roles/{id}/users:
 *   get:
 *     summary: Get a list of users by roleId
 *     description: Required scope - read_user, read_role
 *     tags: [Roles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the role
 *     responses:
 *       200:
 *         description: A list of users by roleId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
roleRoutes.get(
  `${BaseRoute}/:id/users`,
  authMiddleware.s2sReadUser,
  authMiddleware.s2sReadRole,
  roleHandler.getUsersByRoleId,
)
