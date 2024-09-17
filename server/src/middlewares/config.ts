import {
  Context, Next,
} from 'hono'
import { env } from 'hono/adapter'
import {
  errorConfig, typeConfig,
} from 'configs'

export const enableSignUp = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { ENABLE_SIGN_UP: enableSignUp } = env(c)

  if (!enableSignUp) throw new errorConfig.Forbidden()

  await next()
}

export const enablePasswordSignIn = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { ENABLE_PASSWORD_SIGN_IN: enableSignIn } = env(c)

  if (!enableSignIn) throw new errorConfig.Forbidden()

  await next()
}

export const enablePasswordReset = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { ENABLE_PASSWORD_RESET: enabledReset } = env(c)

  if (!enabledReset) throw new errorConfig.Forbidden()

  await next()
}

export const enableGoogleSignIn = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { GOOGLE_AUTH_CLIENT_ID: googleId } = env(c)
  if (!googleId) throw new errorConfig.Forbidden()
  await next()
}

export const enableFacebookSignIn = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    FACEBOOK_AUTH_CLIENT_ID: facebookId, FACEBOOK_AUTH_CLIENT_SECRET: facebookSecret,
  } = env(c)
  if (!facebookId || !facebookSecret) throw new errorConfig.Forbidden()
  await next()
}

export const enableEmailVerification = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const { ENABLE_EMAIL_VERIFICATION: enableEmailVerification } = env(c)

  if (!enableEmailVerification) throw new errorConfig.Forbidden()

  await next()
}

export const enableMfaEnroll = async (
  c: Context<typeConfig.Context>, next: Next,
) => {
  const {
    ENFORCE_ONE_MFA_ENROLLMENT: enforceMfa,
    EMAIL_MFA_IS_REQUIRED: requireEmailMfa,
    OTP_MFA_IS_REQUIRED: requireOtpMfa,
  } = env(c)

  if (!enforceMfa || requireEmailMfa || requireOtpMfa) {
    throw new errorConfig.Forbidden()
  }

  await next()
}
