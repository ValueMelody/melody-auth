import { Context } from 'hono'
import { env } from 'hono/adapter'
import { GetUserInfo } from '../../../global'
import {
  errorConfig, localeConfig,
  typeConfig,
} from 'configs'
import { Forbidden } from 'configs/error'
import { identityDto } from 'dtos'
import {
  PostAuthorizeReqBodyWithNamesDto, PostAuthorizeReqBodyWithPasswordDto,
} from 'dtos/identity'
import { userModel } from 'models'
import {
  emailService, roleService,
} from 'services'
import {
  cryptoUtil, timeUtil,
} from 'utils'

export const getUserInfo = async (
  c: Context<typeConfig.Context>, authId: string,
) => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )
  if (!user) {
    throw new errorConfig.Forbidden(localeConfig.Error.NoUser)
  }

  const result: GetUserInfo = {
    authId: user.authId,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    emailVerified: !!user.emailVerified,
  }

  const {
    ENABLE_NAMES: enableNames,
    ENABLE_USER_ROLE: enableRoles,
  } = env(c)
  if (enableNames) {
    result.firstName = user.firstName
    result.lastName = user.lastName
  }

  if (enableRoles) {
    const roles = await roleService.getUserRoles(
      c,
      user.id,
    )
    if (roles) result.roles = roles
  }

  return result
}

export const getUsers = async (
  c: Context<typeConfig.Context>,
  includeDeleted: boolean = false,
) => {
  const users = await userModel.getAll(
    c.env.DB,
    includeDeleted,
  )

  const { ENABLE_NAMES: enableNames } = env(c)

  const result = users.map((user) => userModel.convertToApiRecord(
    user,
    enableNames,
    null,
  ))
  return result
}

export const getUserByAuthId = async (
  c: Context<typeConfig.Context>,
  authId: string,
  includeDeleted: boolean = false,
) => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
    includeDeleted,
  )
  if (!user) throw new errorConfig.NotFound(localeConfig.Error.NoUser)

  const {
    ENABLE_USER_ROLE: enableRoles,
    ENABLE_NAMES: enableNames,
  } = env(c)

  const roles = enableRoles
    ? await roleService.getUserRoles(
      c,
      user.id,
    )
    : null

  const result = userModel.convertToApiRecord(
    user,
    enableNames,
    roles,
  )
  return result
}

export const verifyPasswordSignIn = async (
  c: Context<typeConfig.Context>, bodyDto: PostAuthorizeReqBodyWithPasswordDto,
) => {
  const password = await cryptoUtil.sha256(bodyDto.password)
  const user = await userModel.getByEmailAndPassword(
    c.env.DB,
    bodyDto.email,
    password,
  )
  if (!user) {
    throw new errorConfig.Forbidden(localeConfig.Error.NoUser)
  }
  return user
}

export const createAccountWithPassword = async (
  c: Context<typeConfig.Context>, bodyDto: PostAuthorizeReqBodyWithNamesDto,
) => {
  const password = await cryptoUtil.sha256(bodyDto.password)

  const includeDeleted = true
  const user = await userModel.getByEmail(
    c.env.DB,
    bodyDto.email,
    includeDeleted,
  )

  if (user) throw new Forbidden(user.deletedAt ? localeConfig.Error.UserDisabled : localeConfig.Error.EmailTaken)

  const newUser = await userModel.create(
    c.env.DB,
    {
      authId: crypto.randomUUID(),
      email: bodyDto.email,
      password,
      firstName: bodyDto.firstName,
      lastName: bodyDto.lastName,
    },
  )

  if (!newUser) {
    throw new errorConfig.InternalServerError(localeConfig.Error.CanNotCreateUser)
  }
  return newUser
}

export const sendEmailVerification = async (
  c: Context<typeConfig.Context>, user: userModel.Record | userModel.ApiRecord,
) => {
  const verificationCode = await emailService.sendEmailVerification(
    c,
    user,
  )
  if (verificationCode) {
    await userModel.update(
      c.env.DB,
      user.id,
      {
        emailVerificationCode: verificationCode,
        emailVerificationCodeExpiresOn: timeUtil.getCurrentTimestamp() + 7200,
      },
    )
  }
}

export const verifyUserEmail = async (
  c: Context<typeConfig.Context>,
  bodyDto: identityDto.PostVerifyEmailReqBodyDto,
) => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    bodyDto.id,
  )
  if (!user || !user.emailVerificationCode || user.emailVerificationCode !== bodyDto.code) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)
  }

  const currentTimeStamp = timeUtil.getCurrentTimestamp()
  if (!user.emailVerificationCodeExpiresOn || currentTimeStamp > user.emailVerificationCodeExpiresOn) {
    throw new errorConfig.Forbidden(localeConfig.Error.CodeExpired)
  }

  await userModel.update(
    c.env.DB,
    user.id,
    {
      emailVerified: 1,
      emailVerificationCode: null,
      emailVerificationCodeExpiresOn: null,
    },
  )
}

export const sendPasswordReset = async (
  c: Context<typeConfig.Context>, email: string,
) => {
  const user = await userModel.getByEmail(
    c.env.DB,
    email,
  )
  if (!user) return true

  const resetCode = await emailService.sendPasswordReset(
    c,
    user,
  )
  if (resetCode) {
    await userModel.update(
      c.env.DB,
      user.id,
      {
        passwordResetCode: resetCode,
        passwordResetCodeExpiresOn: timeUtil.getCurrentTimestamp() + 7200,
      },
    )
  }

  return true
}

export const resetUserPassword = async (
  c: Context<typeConfig.Context>,
  bodyDto: identityDto.PostAuthorizeResetReqBodyDto,
) => {
  const user = await userModel.getByEmail(
    c.env.DB,
    bodyDto.email,
  )
  if (!user || !user.passwordResetCode || user.passwordResetCode !== bodyDto.code) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)
  }

  const currentTimeStamp = timeUtil.getCurrentTimestamp()
  if (!user.passwordResetCodeExpiresOn || currentTimeStamp > user.passwordResetCodeExpiresOn) {
    throw new errorConfig.Forbidden(localeConfig.Error.CodeExpired)
  }

  const password = await cryptoUtil.sha256(bodyDto.password)
  await userModel.update(
    c.env.DB,
    user.id,
    {
      password,
      passwordResetCode: null,
      passwordResetCodeExpiresOn: null,
    },
  )
}

export const enableUser = async (
  c: Context<typeConfig.Context>,
  authId: string,
) => {
  const includeDeleted = true
  const user = await getUserByAuthId(
    c,
    authId,
    includeDeleted,
  )

  if (!user.deletedAt) throw new errorConfig.NotFound(localeConfig.Error.NoUser)

  await userModel.update(
    c.env.DB,
    user.id,
    { deletedAt: null },
  )
}

export const disableUser = async (
  c: Context<typeConfig.Context>,
  authId: string,
) => {
  const user = await getUserByAuthId(
    c,
    authId,
  )

  await userModel.update(
    c.env.DB,
    user.id,
    { deletedAt: timeUtil.getDbCurrentTime() },
  )
}
