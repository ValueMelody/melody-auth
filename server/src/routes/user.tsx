import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import { userHandler } from 'handlers'
import {
  authMiddleware, configMiddleware,
} from 'middlewares'

const BaseRoute = routeConfig.InternalRoute.ApiUsers
const userRoutes = new Hono<typeConfig.Context>()
export default userRoutes

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get a list of users
 *     description: Required scope - read_user
 *     tags: [Users]
 *     parameters:
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
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserDetail'
 *                 count:
 *                   type: integer
 *                   description: Total number of users matching the query
 */
userRoutes.get(
  `${BaseRoute}`,
  authMiddleware.s2sReadUser,
  userHandler.getUsers,
)

/**
 * @swagger
 * /api/v1/users/{authId}:
 *   get:
 *     summary: Get a single user by authId
 *     description: Required scope - read_user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: authId
 *         required: true
 *         schema:
 *           type: string
 *         description: The authId of the user
 *     responses:
 *       200:
 *         description: A single user object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserDetail'
 */
userRoutes.get(
  `${BaseRoute}/:authId`,
  authMiddleware.s2sReadUser,
  userHandler.getUser,
)

/**
 * @swagger
 * /api/v1/users/{authId}:
 *   put:
 *     summary: Update an existing user by authId
 *     description: Required scope - write_user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: authId
 *         required: true
 *         schema:
 *           type: string
 *         description: The authId of the user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PutUserReq'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/UserDetail'
 */
userRoutes.put(
  `${BaseRoute}/:authId`,
  authMiddleware.s2sWriteUser,
  userHandler.putUser,
)

/**
 * @swagger
 * /api/v1/users/{authId}/verify-email:
 *   post:
 *     summary: Send a verification email to the user
 *     description: Required scope - write_user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: authId
 *         schema:
 *           type: string
 *         required: true
 *         description: The authId of the user who will receive the verification email
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 */
userRoutes.post(
  `${BaseRoute}/:authId/verify-email`,
  authMiddleware.s2sWriteUser,
  configMiddleware.enableEmailVerification,
  userHandler.verifyEmail,
)

/**
 * @swagger
 * /api/v1/users/{authId}:
 *   delete:
 *     summary: Delete an existing user by authId
 *     description: Required scope - write_user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The authId of the user
 *     responses:
 *       204:
 *         description: Successful operation with no content to return
 */
userRoutes.delete(
  `${BaseRoute}/:authId`,
  authMiddleware.s2sWriteUser,
  userHandler.deleteUser,
)
