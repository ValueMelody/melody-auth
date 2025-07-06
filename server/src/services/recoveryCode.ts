import { Context } from 'hono'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import {
  cryptoUtil, loggerUtil,
} from 'utils'
import { userModel } from 'models'

export const getRecoveryCodeEnrollmentInfo = async (
  c: Context<typeConfig.Context>,
  authCodeStore: typeConfig.AuthCodeBody,
) => {
  if (authCodeStore.user.recoveryCodeHash) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.RecoveryCodeAlreadySet,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.RecoveryCodeAlreadySet)
  }

  const {
    recoveryCode, recoveryHash,
  } = await cryptoUtil.genRecoveryCode()
  const user = await userModel.update(
    c.env.DB,
    authCodeStore.user.id,
    { recoveryCodeHash: recoveryHash },
  )

  return {
    recoveryCode,
    user,
  }
}

export const regenerateRecoveryCode = async (
  c: Context<typeConfig.Context>,
  authCodeStore: typeConfig.AuthCodeBody,
) => {
  const {
    recoveryCode, recoveryHash,
  } = await cryptoUtil.genRecoveryCode()
  await userModel.update(
    c.env.DB,
    authCodeStore.user.id,
    { recoveryCodeHash: recoveryHash },
  )

  return {
    recoveryCode,
  }
}