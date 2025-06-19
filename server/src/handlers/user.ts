import { Context } from 'hono'
import {
  ClientType, genRandomString, Role, Scope,
} from '@melody-auth/shared'
import { env } from 'hono/adapter'
import {
  errorConfig, messageConfig, typeConfig,
  variableConfig,
} from 'configs'
import {
  consentService, appService, roleService,
  emailService, kvService, passkeyService, userService,
  jwtService,
  orgService,
  orgGroupService,
} from 'services'
import { userDto } from 'dtos'
import {
  loggerUtil, timeUtil, validateUtil,
} from 'utils'
import { PaginationDto } from 'dtos/common'
import { userModel } from 'models'

export const getUsers = async (c: Context<typeConfig.Context>) => {
  const {
    page_size: pageSize,
    page_number: pageNumber,
    search,
  } = c.req.query()
  const pagination = pageSize && pageNumber
    ? new PaginationDto({
      pageSize: Number(pageSize),
      pageNumber: Number(pageNumber),
    })
    : undefined

  const orgId = undefined
  const result = await userService.getUsers(
    c,
    search || undefined,
    pagination,
    orgId,
  )
  return c.json(result)
}

export const getUser = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const user = await userService.getUserDetailByAuthId(
    c,
    authId,
  )
  return c.json({ user })
}

export const getUserAppConsents = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const user = await userService.getUserByAuthId(
    c,
    authId,
  )

  const consentedApps = await consentService.getUserConsentedApps(
    c,
    user.id,
  )
  return c.json({ consentedApps })
}

export const getUserPasskeys = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const user = await userService.getUserByAuthId(
    c,
    authId,
  )

  const passkey = await passkeyService.getPasskeyByUser(
    c,
    user.id,
  )
  return c.json({
    passkeys: passkey
      ? [{
        id: passkey.id,
        credentialId: passkey.credentialId,
        counter: passkey.counter,
        createdAt: passkey.createdAt,
        updatedAt: passkey.updatedAt,
        deletedAt: passkey.deletedAt,
      }]
      : [],
  })
}

export const removeUserPasskey = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const passkeyId = c.req.param('passkeyId')
  const user = await userService.getUserByAuthId(
    c,
    authId,
  )
  await passkeyService.deletePasskey(
    c,
    user.id,
    Number(passkeyId),
  )
  c.status(204)
  return c.body(null)
}

export const getUserLockedIPs = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const user = await userService.getUserByAuthId(
    c,
    authId,
  )

  const lockedIPs = await kvService.getLockedIPsByEmail(
    c.env.KV,
    user.email ?? '',
  )
  return c.json({ lockedIPs })
}

export const deleteUserLockedIPs = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const user = await userService.getUserByAuthId(
    c,
    authId,
  )

  await kvService.deleteLockedIPsByEmail(
    c.env.KV,
    user.email ?? '',
  )
  c.status(204)
  return c.body(null)
}

export const postUserEmailMfa = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')

  await userService.enrollUserMfa(
    c,
    authId,
    userModel.MfaType.Email,
  )
  c.status(204)
  return c.body(null)
}

export const postUserOtpMfa = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')

  await userService.enrollUserMfa(
    c,
    authId,
    userModel.MfaType.Otp,
  )
  c.status(204)
  return c.body(null)
}

export const postUserSmsMfa = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')

  await userService.enrollUserMfa(
    c,
    authId,
    userModel.MfaType.Sms,
  )
  c.status(204)
  return c.body(null)
}

export const deleteUserEmailMfa = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')

  await userService.resetUserMfa(
    c,
    authId,
    userModel.MfaType.Email,
  )
  c.status(204)
  return c.body(null)
}

export const deleteUserOtpMfa = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')

  await userService.resetUserMfa(
    c,
    authId,
    userModel.MfaType.Otp,
  )
  c.status(204)
  return c.body(null)
}

export const deleteUserSmsMfa = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')

  await userService.resetUserMfa(
    c,
    authId,
    userModel.MfaType.Sms,
  )
  c.status(204)
  return c.body(null)
}

export const deleteUserAppConsent = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const appId = c.req.param('appId')
  const user = await userService.getUserByAuthId(
    c,
    authId,
  )
  await consentService.deleteUserAppConsent(
    c,
    user.id,
    Number(appId),
  )

  c.status(204)
  return c.body(null)
}

export const verifyEmail = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const user = await userService.getUserByAuthId(
    c,
    authId,
  )

  if (!user.email) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.SocialAccountNotSupported,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.SocialAccountNotSupported)
  }

  if (user.emailVerified) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.EmailAlreadyVerified,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.EmailAlreadyVerified)
  }

  const verificationCode = await emailService.sendEmailVerification(
    c,
    user.email,
    user,
    user.locale,
  )
  if (verificationCode) {
    await kvService.storeEmailVerificationCode(
      c.env.KV,
      user.id,
      verificationCode,
    )
  }

  return c.json({ success: true })
}

export const putUser = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()
  const bodyDto = new userDto.PutUserDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authId = c.req.param('authId')

  const { ENABLE_USER_ATTRIBUTE: enableUserAttribute } = env(c)

  const attributeValues = enableUserAttribute ? reqBody.attributes : undefined
  const user = await userService.updateUser(
    c,
    authId,
    bodyDto,
    attributeValues,
  )
  return c.json({ user })
}

export const deleteUser = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')

  await userService.deleteUser(
    c,
    authId,
  )

  c.status(204)
  return c.body(null)
}

export const linkAccount = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const linkingAuthId = c.req.param('linkingAuthId')

  const user = await userService.getUserByAuthId(
    c,
    authId,
  )

  if (user.linkedAuthId) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.UserAlreadyLinked,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.UserAlreadyLinked)
  }

  const targetUser = await userService.getUserByAuthId(
    c,
    linkingAuthId,
  )

  if (targetUser.linkedAuthId) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.TargetUserAlreadyLinked,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.TargetUserAlreadyLinked)
  }

  await userService.updateUserLinking(
    c,
    user.id,
    linkingAuthId,
  )

  await userService.updateUserLinking(
    c,
    targetUser.id,
    authId,
  )

  return c.json({ success: true })
}

export const unlinkAccount = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')

  const user = await userService.getUserByAuthId(
    c,
    authId,
  )

  await userService.updateUserLinking(
    c,
    user.id,
    null,
  )

  if (user.linkedAuthId) {
    const targetUser = await userService.getUserByAuthId(
      c,
      user.linkedAuthId,
    )

    if (targetUser) {
      await userService.updateUserLinking(
        c,
        targetUser.id,
        null,
      )
    }
  }

  return c.json({ success: true })
}

export const impersonateUser = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const appId = c.req.param('appId')
  const reqBody = await c.req.json()
  const impersonatorToken = reqBody.impersonatorToken

  let impersonator = null
  if (typeof impersonatorToken === 'string') {
    const accessTokenBody = await jwtService.getAccessTokenBody(
      c,
      impersonatorToken,
    )
    if (accessTokenBody) {
      impersonator = await userService.getUserByAuthId(
        c,
        accessTokenBody.sub,
      )
    }
  }

  if (!impersonator) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.impersonatorTokenIsRequired,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.impersonatorTokenIsRequired)
  }

  const user = await userService.getUserByAuthId(
    c,
    authId,
  )

  const app = await appService.getAppById(
    c,
    Number(appId),
  )

  if (app.type !== ClientType.SPA) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.impersonateNonSpaApp,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.impersonateNonSpaApp)
  }

  const impersonatorRoles = await roleService.getUserRoles(
    c,
    impersonator.id,
  )

  if (!impersonatorRoles.some((role) => variableConfig.S2sConfig.impersonationRoles.includes(role as Role))) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.impersonatorIsNotSuperAdmin,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.impersonatorIsNotSuperAdmin)
  }

  const requireConsent = await consentService.shouldCollectConsent(
    c,
    user.id,
    app.id,
  )

  if (requireConsent) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoConsent,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.NoConsent)
  }

  const userRoles = await roleService.getUserRoles(
    c,
    user.id,
  )

  const scope = `${Scope.OfflineAccess} ${Scope.Profile}`
  const currentTimestamp = timeUtil.getCurrentTimestamp()
  const refreshTokenExpiresIn = 1800
  const refreshToken = genRandomString(128)
  const refreshTokenExpiresAt = currentTimestamp + refreshTokenExpiresIn

  await kvService.storeRefreshToken(
    c.env.KV,
    refreshToken,
    {
      authId, clientId: app.clientId, scope, roles: userRoles, impersonatedBy: impersonator.authId,
    },
    refreshTokenExpiresIn,
  )

  return c.json({
    refresh_token: refreshToken,
    refresh_token_expires_in: refreshTokenExpiresIn,
    refresh_token_expires_on: refreshTokenExpiresAt,
  })
}

export const getUserOrgGroups = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const user = await userService.getUserByAuthId(
    c,
    authId,
  )

  const orgGroups = await orgGroupService.getUserOrgGroups(
    c,
    user.id,
  )
  return c.json({ orgGroups })
}

export const postUserOrgGroup = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const orgGroupId = c.req.param('orgGroupId')

  const user = await userService.getUserByAuthId(
    c,
    authId,
  )

  const org = await orgService.getOrgBySlug(
    c,
    user.orgSlug,
  )

  const orgGroup = await orgGroupService.getOrgGroupById(
    c,
    Number(orgGroupId),
  )

  if (!orgGroup || orgGroup.orgId !== org.id) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.OrgGroupNotFound,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.OrgGroupNotFound)
  }

  await orgGroupService.createUserOrgGroup(
    c,
    user.id,
    orgGroup.id,
  )

  return c.json({ success: true })
}

export const deleteUserOrgGroup = async (c: Context<typeConfig.Context>) => {
  const authId = c.req.param('authId')
  const orgGroupId = c.req.param('orgGroupId')

  const user = await userService.getUserByAuthId(
    c,
    authId,
  )

  await orgGroupService.deleteUserOrgGroup(
    c,
    user.id,
    Number(orgGroupId),
  )

  return c.json({ success: true })
}
