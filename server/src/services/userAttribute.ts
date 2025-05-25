import { Context } from 'hono'
import {
  typeConfig, errorConfig, messageConfig,
} from 'configs'
import { userAttributeModel } from 'models'
import { userAttributeDto } from 'dtos'
import { loggerUtil } from 'utils'

export const getUserAttributes = async (c: Context<typeConfig.Context>): Promise<userAttributeModel.Record[]> => {
  const userAttributes = await userAttributeModel.getAll(c.env.DB)

  return userAttributes
}

export const getUserAttributeById = async (
  c: Context<typeConfig.Context>,
  id: number,
): Promise<userAttributeModel.Record> => {
  const userAttribute = await userAttributeModel.getById(
    c.env.DB,
    id,
  )

  if (!userAttribute) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.NoUserAttribute,
    )
    throw new errorConfig.NotFound(messageConfig.RequestError.NoUserAttribute)
  }
  return userAttribute
}

export const createUserAttribute = async (
  c: Context<typeConfig.Context>,
  dto: userAttributeDto.PostUserAttributeDto,
): Promise<userAttributeModel.Record> => {
  const userAttribute = await userAttributeModel.create(
    c.env.DB,
    {
      name: dto.name,
      includeInSignUpForm: dto.includeInSignUpForm ? 1 : 0,
      requiredInSignUpForm: dto.requiredInSignUpForm ? 1 : 0,
      includeInIdTokenBody: dto.includeInIdTokenBody ? 1 : 0,
      includeInUserInfo: dto.includeInUserInfo ? 1 : 0,
    },
  )
  return userAttribute
}

export const updateUserAttribute = async (
  c: Context<typeConfig.Context>,
  id: number,
  dto: userAttributeDto.PutUserAttributeDto,
): Promise<userAttributeModel.Record> => {
  const includeInSignUpForm = dto.includeInSignUpForm ? 1 : 0
  const requiredInSignUpForm = dto.requiredInSignUpForm ? 1 : 0
  const includeInIdTokenBody = dto.includeInIdTokenBody ? 1 : 0
  const includeInUserInfo = dto.includeInUserInfo ? 1 : 0

  const userAttribute = await userAttributeModel.update(
    c.env.DB,
    id,
    {
      name: dto.name,
      includeInSignUpForm: includeInSignUpForm === undefined ? undefined : includeInSignUpForm,
      requiredInSignUpForm: requiredInSignUpForm === undefined ? undefined : requiredInSignUpForm,
      includeInIdTokenBody: includeInIdTokenBody === undefined ? undefined : includeInIdTokenBody,
      includeInUserInfo: includeInUserInfo === undefined ? undefined : includeInUserInfo,
    },
  )
  return userAttribute
}

export const deleteUserAttributeById = async (
  c: Context<typeConfig.Context>,
  id: number,
): Promise<void> => {
  await userAttributeModel.remove(
    c.env.DB,
    id,
  )
}
