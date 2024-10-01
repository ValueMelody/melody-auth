import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import { authMiddleware } from 'middlewares'
import { logHandler } from 'handlers'

const BaseRoute = routeConfig.InternalRoute.ApiLogs
const logRoutes = new Hono<typeConfig.Context>()
export default logRoutes

/**
 * @swagger
 * /api/v1/logs/email:
 *   get:
 *     summary: Get a list of email logs
 *     description: Required scope - root
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *         description: Number of logs to return per page
 *       - in: query
 *         name: page_number
 *         schema:
 *           type: integer
 *         description: Page number to return
 *     responses:
 *       200:
 *         description: A list of email logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EmailLog'
 *                 count:
 *                   type: integer
 *                   description: Total number of logs matching the query
 */
logRoutes.get(
  `${BaseRoute}/email`,
  authMiddleware.s2sRoot,
  logHandler.getEmailLogs,
)

/**
 * @swagger
 * /api/v1/logs/email/{id}:
 *   get:
 *     summary: Get an email log by id
 *     description: Required scope - root
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the email log
 *     responses:
 *       200:
 *         description: A single email log object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 log:
 *                   $ref: '#/components/schemas/EmailLog'
 */
logRoutes.get(
  `${BaseRoute}/email/:id`,
  authMiddleware.s2sRoot,
  logHandler.getEmailLog,
)

/**
 * @swagger
 * /api/v1/logs/sms:
 *   get:
 *     summary: Get a list of SMS logs
 *     description: Required scope - root
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *         description: Number of logs to return per page
 *       - in: query
 *         name: page_number
 *         schema:
 *           type: integer
 *         description: Page number to return
 *     responses:
 *       200:
 *         description: A list of SMS logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SmsLog'
 *                 count:
 *                   type: integer
 *                   description: Total number of logs matching the query
 */
logRoutes.get(
  `${BaseRoute}/sms`,
  authMiddleware.s2sRoot,
  logHandler.getSmsLogs,
)

/**
 * @swagger
 * /api/v1/logs/sms/{id}:
 *   get:
 *     summary: Get an SMS log by id
 *     description: Required scope - root
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the SMS log
 *     responses:
 *       200:
 *         description: A single SMS log object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 log:
 *                   $ref: '#/components/schemas/SmsLog'
 */
logRoutes.get(
  `${BaseRoute}/sms/:id`,
  authMiddleware.s2sRoot,
  logHandler.getSmsLog,
)

/**
 * @swagger
 * /api/v1/logs/sign-in:
 *   get:
 *     summary: Get a list of Sign-in logs
 *     description: Required scope - root
 *     tags: [Logs]
 *     parameters:
 *       - in: query
 *         name: page_size
 *         schema:
 *           type: integer
 *         description: Number of logs to return per page
 *       - in: query
 *         name: page_number
 *         schema:
 *           type: integer
 *         description: Page number to return
 *     responses:
 *       200:
 *         description: A list of Sign-in logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SignInLog'
 *                 count:
 *                   type: integer
 *                   description: Total number of logs matching the query
 */
logRoutes.get(
  `${BaseRoute}/sign-in`,
  authMiddleware.s2sRoot,
  logHandler.getSignInLogs,
)

/**
 * @swagger
 * /api/v1/logs/sign-in/{id}:
 *   get:
 *     summary: Get an sign-in log by id
 *     description: Required scope - root
 *     tags: [Logs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the sign-in log
 *     responses:
 *       200:
 *         description: A single sign-in log object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 log:
 *                   $ref: '#/components/schemas/SignInLog'
 */
logRoutes.get(
  `${BaseRoute}/sign-in/:id`,
  authMiddleware.s2sRoot,
  logHandler.getSignInLog,
)
