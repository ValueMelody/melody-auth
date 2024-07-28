import { Context } from 'hono'
import { env } from 'hono/adapter'
import { GetUserInfoRes } from 'shared'
import {
  errorConfig, localeConfig,
  typeConfig,
} from 'configs'
import { Forbidden } from 'configs/error'
import {
  identityDto, userDto,
} from 'dtos'
import {
  PostAuthorizeReqWithNamesDto, PostAuthorizeReqWithPasswordDto,
} from 'dtos/identity'
import {
  roleModel, userModel, userRoleModel,
} from 'models'
import {
  emailService, roleService,
} from 'services'
import {
  cryptoUtil, timeUtil,
} from 'utils'

export const getUserInfo = async (
  c: Context<typeConfig.Context>, authId: string,
): Promise<GetUserInfoRes> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )
  if (!user) {
    throw new errorConfig.Forbidden(localeConfig.Error.NoUser)
  }
  if (!user.isActive) {
    throw new errorConfig.Forbidden(localeConfig.Error.UserDisabled)
  }

  const result: GetUserInfoRes = {
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
  c: Context<typeConfig.Context>
): Promise<userModel.ApiRecord[]> => {
  const users = await userModel.getAll(c.env.DB)

  const { ENABLE_NAMES: enableNames } = env(c)

  const result = users.map((user) => userModel.convertToApiRecord(
    user,
    enableNames,
  ))
  return result
}

export const getUserByAuthId = async (
  c: Context<typeConfig.Context>,
  authId: string,
): Promise<userModel.ApiRecordWithRoles> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
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

  const result = userModel.convertToApiRecordWithRoles(
    user,
    enableNames,
    roles,
  )
  return result
}

export const verifyPasswordSignIn = async (
  c: Context<typeConfig.Context>,
  bodyDto: PostAuthorizeReqWithPasswordDto,
): Promise<userModel.Record> => {
  const password = await cryptoUtil.sha256(bodyDto.password)
  const user = await userModel.getByEmailAndPassword(
    c.env.DB,
    bodyDto.email,
    password,
  )
  if (!user) {
    throw new errorConfig.Forbidden(localeConfig.Error.NoUser)
  }
  if (!user.isActive) {
    throw new errorConfig.Forbidden(localeConfig.Error.UserDisabled)
  }
  return user
}

export const createAccountWithPassword = async (
  c: Context<typeConfig.Context>,
  bodyDto: PostAuthorizeReqWithNamesDto,
): Promise<userModel.Record> => {
  const password = await cryptoUtil.sha256(bodyDto.password)

  const user = await userModel.getByEmail(
    c.env.DB,
    bodyDto.email,
  )

  if (user) throw new Forbidden(localeConfig.Error.EmailTaken)

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

  return newUser
}

export const sendEmailVerification = async (
  c: Context<typeConfig.Context>,
  user: userModel.Record | userModel.ApiRecord,
): Promise<true> => {
  if (!user.isActive) throw new errorConfig.Forbidden(localeConfig.Error.UserDisabled)

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
  return true
}

export const verifyUserEmail = async (
  c: Context<typeConfig.Context>,
  bodyDto: identityDto.PostVerifyEmailReqDto,
): Promise<true> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    bodyDto.id,
  )
  if (!user || !user.emailVerificationCode || user.emailVerificationCode !== bodyDto.code) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)
  }
  if (!user.isActive) {
    throw new errorConfig.Forbidden(localeConfig.Error.UserDisabled)
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

  return true
}

export const sendPasswordReset = async (
  c: Context<typeConfig.Context>,
  email: string,
): Promise<true> => {
  const user = await userModel.getByEmail(
    c.env.DB,
    email,
  )
  if (!user || !user.isActive) return true

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
  bodyDto: identityDto.PostAuthorizeResetReqDto,
): Promise<true> => {
  const user = await userModel.getByEmail(
    c.env.DB,
    bodyDto.email,
  )
  if (!user || !user.passwordResetCode || user.passwordResetCode !== bodyDto.code) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)
  }
  if (!user.isActive) {
    throw new errorConfig.Forbidden(localeConfig.Error.UserDisabled)
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
  return true
}

export const updateUser = async (
  c: Context<typeConfig.Context>,
  authId: string,
  dto: userDto.PutUserReqDto,
): Promise<userModel.ApiRecordWithRoles> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )

  if (!user) throw new errorConfig.NotFound()

  const updateObj: userModel.Update = {
    firstName: dto.firstName,
    lastName: dto.lastName,
  }
  if (dto.isActive !== undefined) updateObj.isActive = dto.isActive ? 1 : 0

  const updatedUser = Object.keys(updateObj).length
    ? await userModel.update(
      c.env.DB,
      user.id,
      updateObj,
    )
    : user

  const {
    ENABLE_NAMES: enableNames,
    ENABLE_USER_ROLE: enableRoles,
  } = env(c)

  const userRoles = enableRoles
    ? await userRoleModel.getAllByUserId(
      c.env.DB,
      user.id,
    )
    : null

  if (dto.roles && userRoles) {
    const allRoles = await roleModel.getAll(c.env.DB)
    const targetRoles = allRoles.filter((role) => !!dto.roles?.includes(role.name))

    const recordsToDisable = userRoles.filter((userRole) => targetRoles.every((role) => role.id !== userRole.roleId))
    const recordsToCreate = targetRoles.filter((role) => userRoles.every((userRole) => userRole.roleId !== role.id))

    const currentTime = timeUtil.getDbCurrentTime()
    for (const recordToDisable of recordsToDisable) {
      await userRoleModel.update(
        c.env.DB,
        recordToDisable.id,
        { deletedAt: currentTime },
      )
    }

    for (const recordToCreate of recordsToCreate) {
      await userRoleModel.create(
        c.env.DB,
        {
          userId: user.id, roleId: recordToCreate.id,
        },
      )
    }
  }

  const roleNames = enableRoles && dto.roles ? dto.roles : null
  const potentialRoleNames = enableRoles && !dto.roles
    ? (userRoles || []).map((userRole) => userRole.roleName)
    : roleNames

  return userModel.convertToApiRecordWithRoles(
    updatedUser,
    enableNames,
    potentialRoleNames,
  )
}
