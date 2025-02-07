import { Context } from 'hono'
import {
  errorConfig, typeConfig,
} from 'configs'
import {
  userModel, userPasskeyModel,
} from 'models'

export const createUserPasskey = async (
  c: Context<typeConfig.Context>,
  userId: number,
  credentialId: string,
  publicKey: string,
  counter: number,
) => {
  const isCreated = await userPasskeyModel.create(
    c.env.DB,
    {
      userId,
      credentialId,
      publicKey,
      counter,
    },
  )
  return isCreated
}

export const getPasskeyByUser = async (
  c: Context<typeConfig.Context>,
  userId: number,
) => {
  const passkey = await userPasskeyModel.getByUser(
    c.env.DB,
    userId,
  )
  return passkey
}

export const getUserAndPasskeyByEmail = async (
  c: Context<typeConfig.Context>,
  email: string,
) => {
  const user = await userModel.getByEmail(
    c.env.DB,
    email,
  )
  if (!user) return null

  const passkey = await userPasskeyModel.getByUser(
    c.env.DB,
    user.id,
  )
  if (!passkey) return null
  return {
    user, passkey,
  }
}

export const updatePasskeyCounter = async (
  c: Context<typeConfig.Context>,
  passkeyId: number,
  counter: number,
) => {
  const isUpdated = await userPasskeyModel.update(
    c.env.DB,
    passkeyId,
    { counter },
  )
  return isUpdated
}

export const deletePasskey = async (
  c: Context<typeConfig.Context>,
  userId: number,
  passkeyId: number,
) => {
  const passkey = await userPasskeyModel.getByUser(
    c.env.DB,
    userId,
  )
  if (!passkey || passkey.id !== passkeyId) throw new errorConfig.UnAuthorized()

  return userPasskeyModel.remove(
    c.env.DB,
    passkeyId,
  )
}
