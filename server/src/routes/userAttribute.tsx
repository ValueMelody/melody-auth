import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import {
  authMiddleware, configMiddleware,
} from 'middlewares'
import { userAttributeHandler } from 'handlers'

const BaseRoute = routeConfig.InternalRoute.ApiUserAttributes
const userAttributeRoutes = new Hono<typeConfig.Context>()
export default userAttributeRoutes

/**
 * @swagger
 * /api/v1/user-attributes:
 *   get:
 *     summary: Get a list of user attributes
 *     description: Required scope - root
 *     tags: [User Attributes]
 *     responses:
 *       200:
 *         description: A list of user attributes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userAttributes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserAttribute'
 */
userAttributeRoutes.get(
  `${BaseRoute}`,
  configMiddleware.enableUserAttribute,
  authMiddleware.s2sUserAttribute,
  userAttributeHandler.getUserAttributes,
)

/**
 * @swagger
 * /api/v1/user-attributes:
 *   post:
 *     summary: Create a user attribute
 *     description: Required scope - root
 *     tags: [User Attributes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostUserAttributeReq'
 *     responses:
 *       200:
 *         description: A user attribute
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userAttribute:
 *                   $ref: '#/components/schemas/UserAttribute'
 */
userAttributeRoutes.post(
  `${BaseRoute}`,
  configMiddleware.enableUserAttribute,
  authMiddleware.s2sUserAttribute,
  userAttributeHandler.createUserAttribute,
)

/**
 * @swagger
 * /api/v1/user-attributes/{id}:
 *   get:
 *     summary: Get a user attribute
 *     description: Required scope - root
 *     tags: [User Attributes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the user attribute
 *     responses:
 *       200:
 *         description: A user attribute
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userAttribute:
 *                   $ref: '#/components/schemas/UserAttribute'
 */
userAttributeRoutes.get(
  `${BaseRoute}/:id`,
  configMiddleware.enableUserAttribute,
  authMiddleware.s2sUserAttribute,
  userAttributeHandler.getUserAttribute,
)

/**
 * @swagger
 * /api/v1/user-attributes/{id}:
 *   put:
 *     summary: Update a user attribute
 *     description: Required scope - root
 *     tags: [User Attributes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the user attribute
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PutUserAttributeReq'
 *     responses:
 *       200:
 *         description: A user attribute
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userAttribute:
 *                   $ref: '#/components/schemas/UserAttribute'
 */
userAttributeRoutes.put(
  `${BaseRoute}/:id`,
  configMiddleware.enableUserAttribute,
  authMiddleware.s2sUserAttribute,
  userAttributeHandler.updateUserAttribute,
)

/**
 * @swagger
 * /api/v1/user-attributes/{id}:
 *   delete:
 *     summary: Delete an existing user attribute by ID
 *     description: Required scope - root
 *     tags: [User Attributes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the user attribute
 *     responses:
 *       204:
 *         description: Successful operation with no content to return
 */
userAttributeRoutes.delete(
  `${BaseRoute}/:id`,
  configMiddleware.enableUserAttribute,
  authMiddleware.s2sUserAttribute,
  userAttributeHandler.deleteUserAttribute,
)
