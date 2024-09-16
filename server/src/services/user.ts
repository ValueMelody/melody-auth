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
  roleModel, userAppConsentModel, userModel, userRoleModel,
} from 'models'
import {
  emailService, jwtService, kvService, roleService,
} from 'services'
import {
  cryptoUtil, requestUtil, timeUtil,
} from 'utils'

export const getUserInfo = async (
  c: Context<typeConfig.Context>, authId: string,
): Promise<GetUserInfoRes> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )
  if (!user) {
    throw new errorConfig.NotFound(localeConfig.Error.NoUser)
  }
  if (!user.isActive) {
    throw new errorConfig.Forbidden(localeConfig.Error.UserDisabled)
  }

  const roles = await roleService.getUserRoles(
    c,
    user.id,
  )

  const result: GetUserInfoRes = {
    authId: user.authId,
    email: user.email,
    locale: user.locale,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    emailVerified: !!user.emailVerified,
    roles,
  }

  const { ENABLE_NAMES: enableNames } = env(c)
  if (enableNames) {
    result.firstName = user.firstName
    result.lastName = user.lastName
  }

  return result
}

export const getUsers = async (
  c: Context<typeConfig.Context>,
  search: string | undefined,
  pagination: typeConfig.Pagination | undefined,
): Promise<userModel.PaginatedApiRecords> => {
  const searchObj = search
    ? {
      column: "(COALESCE(\"firstName\", '') || ' ' || COALESCE(\"lastName\", '') || ' ' || COALESCE(\"email\", ''))",
      value: `%${search}%`,
    }
    : undefined

  const users = await userModel.getAll(
    c.env.DB,
    {
      search: searchObj,
      pagination,
    },
  )
  const count = pagination
    ? await userModel.count(
      c.env.DB,
      { search: searchObj },
    )
    : users.length

  const { ENABLE_NAMES: enableNames } = env(c)

  const result = users.map((user) => userModel.convertToApiRecord(
    user,
    enableNames,
  ))
  return {
    users: result, count,
  }
}

export const getUserByAuthId = async (
  c: Context<typeConfig.Context>,
  authId: string,
): Promise<userModel.Record> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )
  if (!user) throw new errorConfig.NotFound(localeConfig.Error.NoUser)
  return user
}

export const getUserDetailByAuthId = async (
  c: Context<typeConfig.Context>,
  authId: string,
): Promise<userModel.ApiRecordWithRoles> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )
  if (!user) throw new errorConfig.NotFound(localeConfig.Error.NoUser)

  const { ENABLE_NAMES: enableNames } = env(c)

  const roles = await roleService.getUserRoles(
    c,
    user.id,
  )

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
  const {
    ACCOUNT_LOCKOUT_THRESHOLD: lockThreshold, ACCOUNT_LOCKOUT_EXPIRES_IN: lockExpiresIn,
  } = env(c)

  const ip = requestUtil.getRequestIP(c)

  const failedAttempts = lockThreshold
    ? await kvService.getFailedLoginAttemptsByIP(
      c.env.KV,
      bodyDto.email,
      ip,
    )
    : 0
  if (lockThreshold && (failedAttempts >= lockThreshold)) {
    throw new errorConfig.Forbidden(localeConfig.Error.AccountLocked)
  }

  const user = await userModel.getPasswordUserByEmail(
    c.env.DB,
    bodyDto.email,
  )

  if (!user) {
    throw new errorConfig.NotFound(localeConfig.Error.NoUser)
  }

  if (!user.password || !cryptoUtil.bcryptCompare(
    bodyDto.password,
    user.password,
  )) {
    if (lockThreshold) {
      await kvService.setFailedLoginAttempts(
        c.env.KV,
        bodyDto.email,
        ip,
        failedAttempts + 1,
        lockExpiresIn,
      )
    }
    throw new errorConfig.NotFound(localeConfig.Error.NoUser)
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
  const user = await userModel.getPasswordUserByEmail(
    c.env.DB,
    bodyDto.email,
  )

  if (user) throw new Forbidden(localeConfig.Error.EmailTaken)

  const password = await cryptoUtil.bcryptText(bodyDto.password)

  const { OTP_MFA_IS_REQUIRED: enableOtp } = env(c)
  const otpSecret = enableOtp ? cryptoUtil.genOtpSecret() : undefined
  const newUser = await userModel.create(
    c.env.DB,
    {
      authId: crypto.randomUUID(),
      email: bodyDto.email,
      socialAccountId: null,
      socialAccountType: null,
      password,
      locale: bodyDto.locale,
      otpSecret,
      firstName: bodyDto.firstName,
      lastName: bodyDto.lastName,
    },
  )

  return newUser
}

export const processGoogleAccount = async (
  c: Context<typeConfig.Context>,
  googleUser: jwtService.GoogleUser,
  locale: typeConfig.Locale,
) => {
  const currentUser = await userModel.getGoogleUserByGoogleId(
    c.env.DB,
    googleUser.id,
  )
  if (currentUser && !currentUser.isActive) throw new errorConfig.Forbidden(localeConfig.Error.UserDisabled)

  const user = currentUser ?? await userModel.create(
    c.env.DB,
    {
      authId: crypto.randomUUID(),
      email: googleUser.email,
      socialAccountId: googleUser.id,
      socialAccountType: userModel.SocialAccountType.Google,
      password: null,
      locale,
      emailVerified: googleUser.emailVerified ? 1 : 0,
      firstName: googleUser.firstName,
      lastName: googleUser.lastName,
    },
  )
  if (user.emailVerified !== googleUser.emailVerified) {
    await userModel.update(
      c.env.DB,
      user.id,
      { emailVerified: googleUser.emailVerified ? 1 : 0 },
    )
  }
  return user
}

export const processFacebookAccount = async (
  c: Context<typeConfig.Context>,
  facebookUser: jwtService.FacebookUser,
  locale: typeConfig.Locale,
) => {
  const currentUser = await userModel.getFacebookUserByFacebookId(
    c.env.DB,
    facebookUser.id,
  )
  if (currentUser && !currentUser.isActive) throw new errorConfig.Forbidden(localeConfig.Error.UserDisabled)

  const user = currentUser ?? await userModel.create(
    c.env.DB,
    {
      authId: crypto.randomUUID(),
      email: null,
      socialAccountId: facebookUser.id,
      socialAccountType: userModel.SocialAccountType.Facebook,
      password: null,
      locale,
      emailVerified: 0,
      firstName: facebookUser.firstName,
      lastName: facebookUser.lastName,
    },
  )
  return user
}

export const verifyUserEmail = async (
  c: Context<typeConfig.Context>,
  bodyDto: identityDto.PostVerifyEmailReqDto,
): Promise<true> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    bodyDto.id,
  )
  if (!user || user.emailVerified) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)
  }
  if (!user.isActive) {
    throw new errorConfig.Forbidden(localeConfig.Error.UserDisabled)
  }

  const isValid = await kvService.verifyEmailVerificationCode(
    c.env.KV,
    user.id,
    bodyDto.code,
  )
  if (!isValid) throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)

  await userModel.update(
    c.env.DB,
    user.id,
    { emailVerified: 1 },
  )

  return true
}

export const sendPasswordReset = async (
  c: Context<typeConfig.Context>,
  email: string,
  locale: typeConfig.Locale,
): Promise<true> => {
  const user = await userModel.getPasswordUserByEmail(
    c.env.DB,
    email,
  )
  if (!user || !user.isActive) return true

  const resetCode = await emailService.sendPasswordReset(
    c,
    user,
    locale,
  )

  if (resetCode) {
    await kvService.storePasswordResetCode(
      c.env.KV,
      user.id,
      resetCode,
    )
  }

  return true
}

export const resetUserPassword = async (
  c: Context<typeConfig.Context>,
  bodyDto: identityDto.PostAuthorizeResetReqDto,
): Promise<true> => {
  const user = await userModel.getPasswordUserByEmail(
    c.env.DB,
    bodyDto.email,
  )
  if (!user || !user.password) {
    throw new errorConfig.NotFound(localeConfig.Error.NoUser)
  }
  if (!user.isActive) {
    throw new errorConfig.Forbidden(localeConfig.Error.UserDisabled)
  }

  const isSame = cryptoUtil.bcryptCompare(
    bodyDto.password,
    user.password,
  )
  if (isSame) {
    throw new errorConfig.Forbidden(localeConfig.Error.RequireDifferentPassword)
  }

  const isValid = await kvService.verifyPasswordResetCode(
    c.env.KV,
    user.id,
    bodyDto.code,
  )

  if (!isValid) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongCode)
  }

  const password = await cryptoUtil.bcryptText(bodyDto.password)

  await userModel.update(
    c.env.DB,
    user.id,
    { password },
  )
  return true
}

export const enrollUserMfa = async (
  c: Context<typeConfig.Context>,
  authId: string,
  mfaType: userModel.MfaType,
): Promise<userModel.Record> => {
  const {
    OTP_MFA_IS_REQUIRED: otpMfaRequired,
    EMAIL_MFA_IS_REQUIRED: emailMfaRequired,
  } = env(c)

  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )
  if (!user) {
    throw new errorConfig.NotFound(localeConfig.Error.NoUser)
  }

  if (!user.isActive) {
    throw new errorConfig.Forbidden(localeConfig.Error.UserDisabled)
  }

  const isOtp = mfaType === userModel.MfaType.Otp
  if (isOtp && otpMfaRequired) return user
  if (mfaType === userModel.MfaType.Email && emailMfaRequired) return user

  if (user.mfaTypes.includes(mfaType)) return user

  const newUser = await userModel.update(
    c.env.DB,
    user.id,
    {
      mfaTypes: [...user.mfaTypes, mfaType].join(','),
      otpVerified: isOtp ? 0 : undefined,
      otpSecret: isOtp ? cryptoUtil.genOtpSecret() : undefined,
    },
  )

  return newUser
}

export const resetUserMfa = async (
  c: Context<typeConfig.Context>,
  authId: string,
  mfaType: userModel.MfaType,
): Promise<true> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )
  if (!user) {
    throw new errorConfig.NotFound(localeConfig.Error.NoUser)
  }

  if (!user.isActive) {
    throw new errorConfig.Forbidden(localeConfig.Error.UserDisabled)
  }

  const isOtp = mfaType === userModel.MfaType.Otp
  if (
    isOtp &&
    !user.mfaTypes.includes(userModel.MfaType.Otp) &&
    !user.otpVerified && !user.otpSecret
  ) return true
  if (mfaType === userModel.MfaType.Email && !user.mfaTypes.includes(userModel.MfaType.Email)) return true

  await userModel.update(
    c.env.DB,
    user.id,
    {
      mfaTypes: user.mfaTypes.filter((type) => type !== mfaType).join(','),
      otpVerified: isOtp ? 0 : undefined,
      otpSecret: isOtp ? '' : undefined,
    },
  )

  return true
}

export const increaseLoginCount = async (
  c: Context<typeConfig.Context>,
  userId: number,
) => {
  await userModel.updateCount(
    c.env.DB,
    userId,
  )
  return true
}

export const genUserOtp = async (
  c: Context<typeConfig.Context>,
  userId: number,
): Promise<userModel.Record> => {
  const otpSecret = cryptoUtil.genOtpSecret()
  const user = await userModel.update(
    c.env.DB,
    userId,
    { otpSecret },
  )
  return user
}

export const markOtpAsVerified = async (
  c: Context<typeConfig.Context>,
  userId: number,
): Promise<void> => {
  await userModel.update(
    c.env.DB,
    userId,
    { otpVerified: 1 },
  )
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

  if (!user) throw new errorConfig.NotFound(localeConfig.Error.NoUser)

  const updateObj: userModel.Update = {}
  if (dto.firstName !== undefined) updateObj.firstName = dto.firstName
  if (dto.lastName !== undefined) updateObj.lastName = dto.lastName
  if (dto.locale !== undefined) updateObj.locale = dto.locale
  if (dto.isActive !== undefined) updateObj.isActive = dto.isActive ? 1 : 0

  const updatedUser = Object.keys(updateObj).length
    ? await userModel.update(
      c.env.DB,
      user.id,
      updateObj,
    )
    : user

  const { ENABLE_NAMES: enableNames } = env(c)

  const userRoles = await userRoleModel.getAllByUserId(
    c.env.DB,
    user.id,
  )

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

  const roleNames = dto.roles ?? (userRoles).map((userRole) => userRole.roleName)

  return userModel.convertToApiRecordWithRoles(
    updatedUser,
    enableNames,
    roleNames,
  )
}

export const deleteUser = async (
  c: Context<typeConfig.Context>,
  authId: string,
): Promise<true> => {
  const user = await userModel.getByAuthId(
    c.env.DB,
    authId,
  )
  if (!user) throw new errorConfig.NotFound(localeConfig.Error.NoUser)
  await userModel.remove(
    c.env.DB,
    user.id,
  )
  await userAppConsentModel.removeByUser(
    c.env.DB,
    user.id,
  )
  return true
}
