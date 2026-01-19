import { Context } from 'hono'
import {
  verifyRegistrationResponse,
  generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server'
import { env } from 'hono/adapter'
import {
  errorConfig, messageConfig, typeConfig,
} from 'configs'
import {
  userModel, userPasskeyModel,
} from 'models'
import {
  cryptoUtil, loggerUtil,
} from 'utils'
import { kvService } from 'services'
import {
  AuthCodeBody, EmbeddedSessionBodyWithUser,
} from 'configs/type'

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

export const genPasskeyEnrollOptions = async (
  c: Context<typeConfig.Context>,
  authCodeStore: AuthCodeBody | EmbeddedSessionBodyWithUser,
) => {
  const registrationOptions = await generateRegistrationOptions({
    rpName: '',
    rpID: cryptoUtil.getPasskeyRpId(c),
    attestationType: 'none',
    userID: new TextEncoder().encode(String(authCodeStore.user.id)),
    userName: authCodeStore.user.email ?? '',
    userDisplayName: `${authCodeStore.user.firstName ?? ''} ${authCodeStore.user.lastName ?? ''}`,
  })

  const challenge = registrationOptions.challenge
  await kvService.setPasskeyEnrollChallenge(
    c.env.KV,
    authCodeStore.user.id,
    challenge,
  )

  return registrationOptions
}

export const genPasskeyVerifyOptions = async (c: Context<typeConfig.Context>) => {
  const options = await generateAuthenticationOptions({ rpID: cryptoUtil.getPasskeyRpId(c) })

  return options
}

export const processPasskeyEnroll = async (
  c: Context<typeConfig.Context>,
  authCodeStore: AuthCodeBody | EmbeddedSessionBodyWithUser,
  enrollInfo: RegistrationResponseJSON,
) => {
  const challenge = await kvService.getPasskeyEnrollChallenge(
    c.env.KV,
    authCodeStore.user.id,
  )

  if (!challenge) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.InvalidPasskeyEnrollRequest,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.InvalidPasskeyEnrollRequest)
  }

  const {
    AUTH_SERVER_URL: authServerUrl, EMBEDDED_AUTH_ORIGINS: embeddedAuthOrigins,
  } = env(c)

  let verification
  try {
    verification = await verifyRegistrationResponse({
      response: enrollInfo,
      expectedChallenge: challenge,
      expectedOrigin: [...embeddedAuthOrigins, authServerUrl],
      expectedRPID: cryptoUtil.getPasskeyRpId(c),
      requireUserVerification: false,
    })
  } catch (error) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.InvalidPasskeyEnrollRequest,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.InvalidPasskeyEnrollRequest)
  }

  const passkeyId = verification.registrationInfo?.credential.id
  const passkeyPublickey = verification.registrationInfo?.credential.publicKey
  const passkeyCounter = verification.registrationInfo?.credential.counter || 0

  if (!verification.verified || !passkeyPublickey || !passkeyId) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.InvalidPasskeyEnrollRequest,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.InvalidPasskeyEnrollRequest)
  }

  return {
    passkeyId,
    passkeyPublickey,
    passkeyCounter,
  }
}

export const processPasskeyVerify = async (
  c: Context<typeConfig.Context>,
  passkeyInfo: AuthenticationResponseJSON,
  challenge: string,
) => {
  const isValidChallenge = await kvService.getPasskeyVerifyChallenge(
    c.env.KV,
    challenge,
  )

  if (!isValidChallenge) {
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.InvalidPasskeyVerifyRequest)
  }

  const passkey = await userPasskeyModel.getByCredentialId(
    c.env.DB,
    passkeyInfo.rawId,
  )

  const user = passkey?.userId
    ? await userModel.getById(
      c.env.DB,
      passkey.userId,
    )
    : null

  if (!passkey || !user) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.InvalidPasskeyVerifyRequest,
    )
    throw new errorConfig.Forbidden(messageConfig.RequestError.InvalidPasskeyVerifyRequest)
  }

  const {
    AUTH_SERVER_URL: authServerUrl, EMBEDDED_AUTH_ORIGINS: embeddedAuthOrigins,
  } = env(c)

  let verification
  try {
    verification = await verifyAuthenticationResponse({
      response: passkeyInfo,
      expectedChallenge: challenge,
      expectedOrigin: [...embeddedAuthOrigins, authServerUrl],
      expectedRPID: cryptoUtil.getPasskeyRpId(c),
      credential: {
        id: passkey.credentialId,
        publicKey: cryptoUtil.base64ToUint8Array(passkey.publicKey),
        counter: passkey.counter,
      },
      requireUserVerification: false,
    })
  } catch (error) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.InvalidPasskeyVerifyRequest,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.InvalidPasskeyVerifyRequest)
  }

  if (!verification.verified) {
    loggerUtil.triggerLogger(
      c,
      loggerUtil.LoggerLevel.Warn,
      messageConfig.RequestError.InvalidPasskeyVerifyRequest,
    )
    throw new errorConfig.UnAuthorized(messageConfig.RequestError.InvalidPasskeyVerifyRequest)
  }

  return {
    user,
    passkeyId: passkey.id,
    newCounter: verification.authenticationInfo?.newCounter,
  }
}
