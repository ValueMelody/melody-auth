import { Context } from 'hono'
import {
  verifyRegistrationResponse, generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server'
import { env } from 'hono/adapter'
import {
  errorConfig, localeConfig, typeConfig,
} from 'configs'
import {
  userModel, userPasskeyModel,
} from 'models'
import { cryptoUtil } from 'utils'
import { EnrollOptions } from 'views/AuthorizePasskeyEnroll'
import { kvService } from 'services'
import { AuthCodeBody } from 'configs/type'

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

const getUserAndPasskeyByEmail = async (
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

export const genPasskeyEnrollOptions = async (
  c: Context<typeConfig.Context>,
  authCodeStore: AuthCodeBody,
) => {
  const registrationOptions = await generateRegistrationOptions({
    rpName: '',
    rpID: '',
    userName: '',
  })

  const challenge = registrationOptions.challenge
  await kvService.setPasskeyEnrollChallenge(
    c.env.KV,
    authCodeStore.user.id,
    challenge,
  )

  const enrollOptions: EnrollOptions = {
    rpId: cryptoUtil.getPasskeyRpId(c),
    userId: authCodeStore.user.id,
    userEmail: authCodeStore.user.email ?? '',
    userDisplayName: `${authCodeStore.user.firstName ?? ''} ${authCodeStore.user.lastName ?? ''}`,
    challenge,
  }

  return enrollOptions
}

export const genPasskeyVerifyOptions = async (
  c: Context<typeConfig.Context>,
  email: string,
) => {
  const userAndPasskey = await getUserAndPasskeyByEmail(
    c,
    email,
  )

  if (!userAndPasskey) return null

  const options = await generateAuthenticationOptions({
    rpID: cryptoUtil.getPasskeyRpId(c),
    allowCredentials: [{ id: userAndPasskey.passkey.credentialId }],
  })

  return options
}

export const processPasskeyEnroll = async (
  c: Context<typeConfig.Context>,
  authCodeStore: AuthCodeBody,
  enrollInfo: RegistrationResponseJSON,
) => {
  const challenge = await kvService.getPasskeyEnrollChallenge(
    c.env.KV,
    authCodeStore.user.id,
  )

  if (!challenge) throw new errorConfig.UnAuthorized(localeConfig.Error.InvalidRequest)

  const { AUTH_SERVER_URL: authServerUrl } = env(c)

  let verification
  try {
    verification = await verifyRegistrationResponse({
      response: enrollInfo,
      expectedChallenge: challenge,
      expectedOrigin: authServerUrl,
      expectedRPID: cryptoUtil.getPasskeyRpId(c),
    })
  } catch (error) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.InvalidRequest)
  }

  const passkeyId = verification.registrationInfo?.credential.id
  const passkeyPublickey = verification.registrationInfo?.credential.publicKey
  const passkeyCounter = verification.registrationInfo?.credential.counter || 0

  if (!verification.verified || !passkeyPublickey || !passkeyId) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.InvalidRequest)
  }

  return {
    passkeyId,
    passkeyPublickey,
    passkeyCounter,
  }
}

export const processPasskeyVerify = async (
  c: Context<typeConfig.Context>,
  email: string,
  passkeyInfo: AuthenticationResponseJSON,
) => {
  const challenge = await kvService.getPasskeyVerifyChallenge(
    c.env.KV,
    email,
  )
  if (!challenge) throw new errorConfig.Forbidden(localeConfig.Error.InvalidRequest)

  const userAndPasskey = await getUserAndPasskeyByEmail(
    c,
    email,
  )
  if (!userAndPasskey) throw new errorConfig.Forbidden(localeConfig.Error.InvalidRequest)
  const {
    user, passkey,
  } = userAndPasskey

  const { AUTH_SERVER_URL: authServerUrl } = env(c)

  let verification
  try {
    verification = await verifyAuthenticationResponse({
      response: passkeyInfo,
      expectedChallenge: challenge,
      expectedOrigin: authServerUrl,
      expectedRPID: cryptoUtil.getPasskeyRpId(c),
      credential: {
        id: passkey.credentialId,
        publicKey: cryptoUtil.base64ToUint8Array(passkey.publicKey),
        counter: passkey.counter,
      },
    })
  } catch (error) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.InvalidRequest)
  }

  if (!verification.verified) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.InvalidRequest)
  }

  return {
    user,
    passkeyId: passkey.id,
    newCounter: verification.authenticationInfo?.newCounter,
  }
}
