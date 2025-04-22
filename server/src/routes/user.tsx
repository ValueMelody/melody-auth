import { Hono } from 'hono'
import {
  routeConfig, typeConfig,
} from 'configs'
import { userHandler } from 'handlers'
import { authMiddleware } from 'middlewares'

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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
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
 *                     $ref: '#/components/schemas/User'
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
 * /api/v1/users/{authId}/locked-ips:
 *   get:
 *     summary: Get a list of locked IPs for a user
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
 *         description: A list of IPs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lockedIPs:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: The list of locked IP addresses for the user
 */
userRoutes.get(
  `${BaseRoute}/:authId/locked-ips`,
  authMiddleware.s2sReadUser,
  userHandler.getUserLockedIPs,
)

/**
 * @swagger
 * /api/v1/users/{authId}/locked-ips:
 *   delete:
 *     summary: Unlock all locked IP addresses for a user
 *     description: Required scope - write_user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: authId
 *         required: true
 *         schema:
 *           type: string
 *         description: The authId of the user
 *     responses:
 *       204:
 *         description: Successful operation with no content to return
 */
userRoutes.delete(
  `${BaseRoute}/:authId/locked-ips`,
  authMiddleware.s2sWriteUser,
  userHandler.deleteUserLockedIPs,
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
 *         name: authId
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

/**
 * @swagger
 * /api/v1/users/{authId}/consented-apps:
 *   get:
 *     summary: Get a list of apps user has consented to
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
 *         description: A list of consented apps
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 consentedApps:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserConsentedApp'
 */
userRoutes.get(
  `${BaseRoute}/:authId/consented-apps`,
  authMiddleware.s2sReadUser,
  userHandler.getUserAppConsents,
)

/**
 * @swagger
 * /api/v1/users/{authId}/consented-apps/{appId}:
 *   delete:
 *     summary: Delete an existing consent for a user by authId and appId
 *     description: Required scope - write_user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: authId
 *         required: true
 *         schema:
 *           type: string
 *         description: The authId of the user
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: number
 *         description: The id of the app
 *     responses:
 *       204:
 *         description: Successful operation with no content to return
 */
userRoutes.delete(
  `${BaseRoute}/:authId/consented-apps/:appId`,
  authMiddleware.s2sWriteUser,
  userHandler.deleteUserAppConsent,
)

/**
 * @swagger
 * /api/v1/users/{authId}/passkeys:
 *   get:
 *     summary: Get a list of passkeys for a user
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
 *         description: A list of passkeys
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 passkeys:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserPasskey'
 */
userRoutes.get(
  `${BaseRoute}/:authId/passkeys`,
  authMiddleware.s2sReadUser,
  userHandler.getUserPasskeys,
)

/**
 * @swagger
 * /api/v1/users/{authId}/passkeys/{passkeyId}:
 *   delete:
 *     summary: Remove a passkey for a user
 *     description: Required scope - write_user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: authId
 *         schema:
 *           type: string
 *         required: true
 *         description: The authId of the user
 *       - in: path
 *         name: passkeyId
 *         schema:
 *           type: number
 *         required: true
 *         description: The id of the passkey
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
userRoutes.delete(
  `${BaseRoute}/:authId/passkeys/:passkeyId`,
  authMiddleware.s2sWriteUser,
  userHandler.removeUserPasskey,
)

/**
 * @swagger
 * /api/v1/users/{authId}/email-mfa:
 *   post:
 *     summary: enroll user for email MFA.
 *     description: Required scope - write_user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: authId
 *         required: true
 *         schema:
 *           type: string
 *         description: The authId of the user
 *     responses:
 *       204:
 *         description: Successful operation with no content to return
 */
userRoutes.post(
  `${BaseRoute}/:authId/email-mfa`,
  authMiddleware.s2sWriteUser,
  userHandler.postUserEmailMfa,
)

/**
 * @swagger
 * /api/v1/users/{authId}/email-mfa:
 *   delete:
 *     summary: Unenroll user from email MFA.
 *     description: Required scope - write_user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: authId
 *         required: true
 *         schema:
 *           type: string
 *         description: The authId of the user
 *     responses:
 *       204:
 *         description: Successful operation with no content to return
 */
userRoutes.delete(
  `${BaseRoute}/:authId/email-mfa`,
  authMiddleware.s2sWriteUser,
  userHandler.deleteUserEmailMfa,
)

/**
 * @swagger
 * /api/v1/users/{authId}/otp-mfa:
 *   post:
 *     summary: enroll user for OTP MFA.
 *     description: Required scope - write_user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: authId
 *         required: true
 *         schema:
 *           type: string
 *         description: The authId of the user
 *     responses:
 *       204:
 *         description: Successful operation with no content to return
 */
userRoutes.post(
  `${BaseRoute}/:authId/otp-mfa`,
  authMiddleware.s2sWriteUser,
  userHandler.postUserOtpMfa,
)

/**
 * @swagger
 * /api/v1/users/{authId}/otp-mfa:
 *   delete:
 *     summary: Remove user's current OTP MFA setup.
 *     description: Required scope - write_user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: authId
 *         required: true
 *         schema:
 *           type: string
 *         description: The authId of the user
 *     responses:
 *       204:
 *         description: Successful operation with no content to return
 */
userRoutes.delete(
  `${BaseRoute}/:authId/otp-mfa`,
  authMiddleware.s2sWriteUser,
  userHandler.deleteUserOtpMfa,
)

/**
 * @swagger
 * /api/v1/users/{authId}/sms-mfa:
 *   post:
 *     summary: enroll user for SMS MFA.
 *     description: Required scope - write_user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: authId
 *         required: true
 *         schema:
 *           type: string
 *         description: The authId of the user
 *     responses:
 *       204:
 *         description: Successful operation with no content to return
 */
userRoutes.post(
  `${BaseRoute}/:authId/sms-mfa`,
  authMiddleware.s2sWriteUser,
  userHandler.postUserSmsMfa,
)

/**
 * @swagger
 * /api/v1/users/{authId}/sms-mfa:
 *   delete:
 *     summary: Remove user's current SMS MFA setup.
 *     description: Required scope - write_user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: authId
 *         required: true
 *         schema:
 *           type: string
 *         description: The authId of the user
 *     responses:
 *       204:
 *         description: Successful operation with no content to return
 */
userRoutes.delete(
  `${BaseRoute}/:authId/sms-mfa`,
  authMiddleware.s2sWriteUser,
  userHandler.deleteUserSmsMfa,
)

/**
 * @swagger
 * /api/v1/users/{authId}/account-linking/{linkingAuthId}:
 *   post:
 *     summary: Link current user account with another user account
 *     description: Required scope - write_user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: authId
 *         schema:
 *           type: string
 *         required: true
 *         description: The authId of the user
 *       - in: path
 *         name: linkingAuthId
 *         schema:
 *           type: string
 *         required: true
 *         description: The authId of the account to link with
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
  `${BaseRoute}/:authId/account-linking/:linkingAuthId`,
  authMiddleware.s2sWriteUser,
  userHandler.linkAccount,
)

/**
 * @swagger
 * /api/v1/users/{authId}/account-linking:
 *   delete:
 *     summary: Unlink current user account with another user account
 *     description: Required scope - write_user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: authId
 *         schema:
 *           type: string
 *         required: true
 *         description: The authId of the user
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
userRoutes.delete(
  `${BaseRoute}/:authId/account-linking`,
  authMiddleware.s2sWriteUser,
  userHandler.unlinkAccount,
)

/**
 * @swagger
 * /api/v1/users/{authId}/impersonation/{appId}:
 *   post:
 *     summary: Generate an impersonation refresh token for a user by authId and appId
 *     description: Required scope - root
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: authId
 *         required: true
 *         schema:
 *           type: string
 *         description: The authId of the user
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: number
 *         description: The id of the app
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               impersonatorToken:
 *                 type: string
 *                 description: The access token of the user impersonating, this user must be a super_admin
 *     responses:
 *       200:
 *         description: A refresh token for impersonation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 refresh_token:
 *                   type: string
 *                   description: The refresh token for impersonation
 *                 refresh_token_expires_on:
 *                   type: number
 *                   description: The expiration time of the refresh token
 *                 refresh_token_expires_in:
 *                   type: number
 *                   description: The remaining time of the refresh token in seconds
 */
userRoutes.post(
  `${BaseRoute}/:authId/impersonation/:appId`,
  authMiddleware.s2sRoot,
  userHandler.impersonateUser,
)
