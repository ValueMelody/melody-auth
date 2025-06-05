import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import { samlHandler } from 'handlers'
import {
  authMiddleware, configMiddleware,
} from 'middlewares'

const BaseRoute = routeConfig.InternalRoute.ApiSamlIdps
const samlRoutes = new Hono<typeConfig.Context>()
export default samlRoutes

/**
 * @swagger
 * /api/v1/saml/idps:
 *   get:
 *     summary: Get a list of SAML IDPs
 *     description: Required scope - root
 *     tags: [SAML]
 *     responses:
 *       200:
 *         description: A list of SAML IDPs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idps:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SamlIdp'
 */
samlRoutes.get(
  `${BaseRoute}`,
  configMiddleware.enableSamlAsSp,
  authMiddleware.s2sRoot,
  samlHandler.getSamlIdps,
)

/**
 * @swagger
 * /api/v1/saml/idps/{id}:
 *   get:
 *     summary: Get a SAML IDP
 *     description: Required scope - root
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: number
 *     tags: [SAML]
 *     responses:
 *       200:
 *         description: A SAML IDP
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idp:
 *                   $ref: '#/components/schemas/SamlIdp'
 */
samlRoutes.get(
  `${BaseRoute}/:id`,
  configMiddleware.enableSamlAsSp,
  authMiddleware.s2sRoot,
  samlHandler.getSamlIdp,
)

/**
 * @swagger
 * /api/v1/saml/idps:
 *   post:
 *     summary: Create a new SAML IDP
 *     description: Required scope - root
 *     tags: [SAML]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PostSamlIdpReq'
 *     responses:
 *       201:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idp:
 *                   $ref: '#/components/schemas/SamlIdp'
 */
samlRoutes.post(
  `${BaseRoute}`,
  configMiddleware.enableSamlAsSp,
  authMiddleware.s2sRoot,
  samlHandler.postIdp,
)

/**
 * @swagger
 * /api/v1/saml/idps/{id}:
 *   put:
 *     summary: Update an existing SAML IDP
 *     description: Required scope - root
 *     tags: [SAML]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the SAML IDP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PutSamlIdpReq'
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idp:
 *                   $ref: '#/components/schemas/SamlIdp'
 */
samlRoutes.put(
  `${BaseRoute}/:id`,
  configMiddleware.enableSamlAsSp,
  authMiddleware.s2sRoot,
  samlHandler.putIdp,
)

/**
 * @swagger
 * /api/v1/saml/idps/{id}:
 *   delete:
 *     summary: Delete an existing SAML IDP
 *     description: Required scope - root
 *     tags: [SAML]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *         description: The unique ID of the SAML IDP
 *     responses:
 *       204:
 *         description: Successful operation with no content to return
 */
samlRoutes.delete(
  `${BaseRoute}/:id`,
  configMiddleware.enableSamlAsSp,
  authMiddleware.s2sRoot,
  samlHandler.deleteIdp,
)
