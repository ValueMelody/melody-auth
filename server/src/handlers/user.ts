import { Context } from 'hono'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import {
  consentService,
  emailService, kvService, passkeyService, userService,
} from 'services'
import { userDto } from 'dtos'
import {
  loggerUtil, validateUtil,
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

  const user = await userService.updateUser(
    c,
    authId,
    bodyDto,
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
