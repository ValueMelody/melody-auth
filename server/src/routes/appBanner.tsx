import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import { appBannerHandler } from 'handlers'
import {
  authMiddleware, configMiddleware,
} from 'middlewares'

const BaseRoute = routeConfig.InternalRoute.ApiAppBanners
const appBannerRoutes = new Hono<typeConfig.Context>()
export default appBannerRoutes

/**
 * @swagger
 * /api/v1/app-banners:
 *   get:
 *     summary: Get a list of app banners
 *     description: Required scope - read_app
 *     tags: [App Banners]
 *     responses:
 *       200:
 *         description: A list of app banners
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appBanners:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AppBanner'
 */
appBannerRoutes.get(
  `${BaseRoute}`,
  configMiddleware.enableAppBanner,
  authMiddleware.s2sReadApp,
  appBannerHandler.getAppBanners,
)

/**
 * @swagger
 * /api/v1/app-banners/{id}:
 *   get:
 *     summary: Get a single app banner by ID
 *     description: Required scope - read_app
 *     tags: [App Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the app banner
 *     responses:
 *       200:
 *         description: A single app banner object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appBanner:
 *                   $ref: '#/components/schemas/AppBanner'
 */
appBannerRoutes.post(
  `${BaseRoute}`,
  configMiddleware.enableAppBanner,
  authMiddleware.s2sWriteApp,
  appBannerHandler.postAppBanner,
)

/**
 * @swagger
 * /api/v1/app-banners:
 *   post:
 *     summary: Create a new app banner
 *     description: Required scope - write_app
 *     tags: [App Banners]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostAppBannerReq'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appBanner:
 *                   $ref: '#/components/schemas/AppBanner'
 */
appBannerRoutes.get(
  `${BaseRoute}/:id`,
  configMiddleware.enableAppBanner,
  authMiddleware.s2sReadApp,
  appBannerHandler.getAppBanner,
)

/**
 * @swagger
 * /api/v1/app-banners/{id}:
 *   put:
 *     summary: Update an existing app banner by ID
 *     description: Required scope - write_app
 *     tags: [App Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the app banner
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PutAppBannerReq'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 appBanner:
 *                   $ref: '#/components/schemas/AppBanner'
 */
appBannerRoutes.put(
  `${BaseRoute}/:id`,
  configMiddleware.enableAppBanner,
  authMiddleware.s2sWriteApp,
  appBannerHandler.putAppBanner,
)

/**
 * @swagger
 * /api/v1/app-banners/{id}:
 *   delete:
 *     summary: Delete an existing app banner by ID
 *     description: Required scope - write_app
 *     tags: [App Banners]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the app banner
 *     responses:
 *       204:
 *         description: Successful operation with no content to return
 */
appBannerRoutes.delete(
  `${BaseRoute}/:id`,
  configMiddleware.enableAppBanner,
  authMiddleware.s2sWriteApp,
  appBannerHandler.deleteAppBanner,
)
