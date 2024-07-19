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
import { emailService } from 'services'
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

  const { ENABLE_NAMES: enableNames } = env(c)
  if (enableNames) {
    result.firstName = user.firstName
    result.lastName = user.lastName
  }

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
  if (user && !user.deletedAt) throw new Forbidden(localeConfig.Error.EmailTaken)

  const newUser = user
    ? await userModel.update(
      c.env.DB,
      user.id,
      {
        password, firstName: bodyDto.firstName, lastName: bodyDto.lastName, deletedAt: null,
      },
    )
    : await userModel.create(
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
  c: Context<typeConfig.Context>, user: userModel.Record,
) => {
  const verificationCode = await emailService.sendEmailVerificationEmail(
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
  if (!user || user.emailVerificationCode !== bodyDto.code) {
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
