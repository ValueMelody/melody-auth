import { Context } from 'hono'
import { env } from 'hono/adapter'
import {
  verifyRegistrationResponse, generateRegistrationOptions,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import {
  errorConfig, localeConfig, routeConfig, typeConfig,
} from 'configs'
import { identityDto, oauthDto } from 'dtos'
import {
  appService,
  brandingService,
  emailService, kvService, passkeyService, smsService, userService,
} from 'services'
import {
  cryptoUtil,
  identityUtil,
  requestUtil, validateUtil,
} from 'utils'
import {
  AuthorizeEmailMfaView, AuthorizeOtpMfaView,
  AuthorizeMfaEnrollView,
  AuthorizeSmsMfaView,
  AuthorizePasskeyEnrollView,
} from 'views'
import { AuthCodeBody } from 'configs/type'
import { userModel } from 'models'
import { EnrollOptions } from 'views/AuthorizePasskeyEnroll'
import { oauthHandler } from 'handlers'



const allowOtpSwitchToEmailMfa = (
  c: Context<typeConfig.Context>,
  authCodeStore: AuthCodeBody,
) => {
  const {
    OTP_MFA_IS_REQUIRED: enableOtpMfa,
    EMAIL_MFA_IS_REQUIRED: enableEmailMfa,
    ALLOW_EMAIL_MFA_AS_BACKUP: allowFallback,
  } = env(c)
  const notEnrolledEmail = !enableEmailMfa && !authCodeStore.user.mfaTypes.includes(userModel.MfaType.Email)
  const enrolledOtp = enableOtpMfa || authCodeStore.user.mfaTypes.includes(userModel.MfaType.Otp)

  return allowFallback && notEnrolledEmail && enrolledOtp
}

const handleSendEmailMfa = async (
  c: Context<typeConfig.Context>,
  authCode: string,
  locale: typeConfig.Locale,
) => {
  const {
    EMAIL_MFA_IS_REQUIRED: enableEmailMfa,
    AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn,
    EMAIL_MFA_EMAIL_THRESHOLD: threshold,
  } = env(c)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    authCode,
  )
  if (!authCodeBody) {
    return {
      result: false,
      reason: localeConfig.Error.WrongAuthCode,
    }
  }

  const requireEmailMfa = enableEmailMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Email)
  const couldFallbackAsOtp = allowOtpSwitchToEmailMfa(
    c,
    authCodeBody,
  )
  const couldFallbackAsSms = allowSmsSwitchToEmailMfa(
    c,
    authCodeBody,
  )

  if (!requireEmailMfa && !couldFallbackAsOtp && !couldFallbackAsSms) throw new errorConfig.Forbidden()

  const ip = requestUtil.getRequestIP(c)
  const attempts = await kvService.getEmailMfaEmailAttemptsByIP(
    c.env.KV,
    authCodeBody.user.id,
    ip,
  )

  if (threshold) {
    if (attempts >= threshold) {
      return {
        result: false,
        reason: localeConfig.Error.EmailMfaLocked,
      }
    }

    await kvService.setEmailMfaEmailAttempts(
      c.env.KV,
      authCodeBody.user.id,
      ip,
      attempts + 1,
    )
  }

  const mfaCode = await emailService.sendEmailMfa(
    c,
    authCodeBody.user,
    locale,
  )
  if (mfaCode) {
    await kvService.storeEmailMfaCode(
      c.env.KV,
      authCode,
      mfaCode,
      codeExpiresIn,
    )
  }

  return { result: true }
}

const allowSmsSwitchToEmailMfa = (
  c: Context<typeConfig.Context>,
  authCodeStore: AuthCodeBody,
) => {
  if (!authCodeStore.user.smsPhoneNumber || !authCodeStore.user.smsPhoneNumberVerified) return false

  const {
    SMS_MFA_IS_REQUIRED: enableSmsMfa,
    EMAIL_MFA_IS_REQUIRED: enableEmailMfa,
    ALLOW_EMAIL_MFA_AS_BACKUP: allowFallback,
  } = env(c)
  const notEnrolledEmail = !enableEmailMfa && !authCodeStore.user.mfaTypes.includes(userModel.MfaType.Email)
  const enrolledSms = enableSmsMfa || authCodeStore.user.mfaTypes.includes(userModel.MfaType.Sms)

  return allowFallback && notEnrolledEmail && enrolledSms
}

const handleSendSmsMfa = async (
  c: Context<typeConfig.Context>,
  phoneNumber: string,
  authCode: string,
  authCodeBody: typeConfig.AuthCodeBody,
  locale: typeConfig.Locale,
) => {
  const {
    SMS_MFA_IS_REQUIRED: enableSmsMfa,
    AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn,
    SMS_MFA_MESSAGE_THRESHOLD: threshold,
  } = env(c)

  const requireSmsMfa = enableSmsMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Sms)

  if (!requireSmsMfa) throw new errorConfig.Forbidden()

  const ip = requestUtil.getRequestIP(c)
  const attempts = await kvService.getSmsMfaMessageAttemptsByIP(
    c.env.KV,
    authCodeBody.user.id,
    ip,
  )

  if (threshold) {
    if (attempts >= threshold) throw new errorConfig.Forbidden(localeConfig.Error.SmsMfaLocked)

    await kvService.setSmsMfaMessageAttempts(
      c.env.KV,
      authCodeBody.user.id,
      ip,
      attempts + 1,
    )
  }

  const mfaCode = await smsService.sendSmsMfa(
    c,
    phoneNumber,
    locale,
  )
  if (mfaCode) {
    await kvService.storeSmsMfaCode(
      c.env.KV,
      authCode,
      mfaCode,
      codeExpiresIn,
    )
  }

  return true
}

export const getAuthorizeMfaEnroll = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authCodeStore) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)

  if (authCodeStore.user.mfaTypes.length) throw new errorConfig.Forbidden(localeConfig.Error.MfaEnrolled)

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
    ENFORCE_ONE_MFA_ENROLLMENT: mfaTypes,
  } = env(c)

  return c.html(<AuthorizeMfaEnrollView
    branding={await brandingService.getBranding(
      c,
      queryDto.org,
    )}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    mfaTypes={mfaTypes}
  />)
}

export const postAuthorizeMfaEnroll = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeEnrollReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeStore) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

  if (authCodeStore.user.mfaTypes.length) throw new errorConfig.Forbidden(localeConfig.Error.MfaEnrolled)

  const user = await userService.enrollUserMfa(
    c,
    authCodeStore.user.authId,
    bodyDto.type,
  )
  const { AUTHORIZATION_CODE_EXPIRES_IN: codeExpiresIn } = env(c)
  const newAuthCodeStore = {
    ...authCodeStore,
    user,
  }
  await kvService.storeAuthCode(
    c.env.KV,
    bodyDto.code,
    newAuthCodeStore,
    codeExpiresIn,
  )

  return c.json(await identityUtil.processPostAuthorize(
    c,
    identityUtil.AuthorizeStep.MfaEnroll,
    bodyDto.code,
    newAuthCodeStore,
  ))
}

export const getAuthorizeOtpSetup = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authCodeStore) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)

  if (authCodeStore.user.otpVerified) throw new errorConfig.Forbidden(localeConfig.Error.OtpAlreadySet)

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  const otp = `otpauth://totp/${authCodeStore.appName}:${authCodeStore.user.email}?secret=${authCodeStore.user.otpSecret}&issuer=melody-auth&algorithm=SHA1&digits=6&period=30`

  return c.html(<AuthorizeOtpMfaView
    branding={await brandingService.getBranding(
      c,
      queryDto.org,
    )}
    otp={otp}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    showEmailMfaBtn={false}
  />)
}

export const getAuthorizeOtpMfa = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authCodeBody) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)

  const allowSwitch = allowOtpSwitchToEmailMfa(
    c,
    authCodeBody,
  )

  return c.html(<AuthorizeOtpMfaView
    branding={await brandingService.getBranding(
      c,
      queryDto.org,
    )}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    showEmailMfaBtn={allowSwitch}
  />)
}

export const postAuthorizeOtpMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeMfaReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeStore) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

  if (!authCodeStore.user.otpSecret) throw new errorConfig.Forbidden()

  const ip = requestUtil.getRequestIP(c)
  const failedAttempts = await kvService.getFailedOtpMfaAttemptsByIP(
    c.env.KV,
    authCodeStore.user.id,
    ip,
  )
  if (failedAttempts >= 5) throw new errorConfig.Forbidden(localeConfig.Error.OtpMfaLocked)

  const { AUTHORIZATION_CODE_EXPIRES_IN: expiresIn } = env(c)

  const isValid = await kvService.stampOtpMfaCode(
    c.env.KV,
    bodyDto.code,
    bodyDto.mfaCode,
    authCodeStore.user.otpSecret,
    expiresIn,
  )

  if (!isValid) {
    await kvService.setFailedOtpMfaAttempts(
      c.env.KV,
      authCodeStore.user.id,
      ip,
      failedAttempts + 1,
    )
    throw new errorConfig.UnAuthorized(localeConfig.Error.WrongMfaCode)
  }

  if (!authCodeStore.user.otpVerified) {
    await userService.markOtpAsVerified(
      c,
      authCodeStore.user.id,
    )
  }

  return c.json(await identityUtil.processPostAuthorize(
    c,
    identityUtil.AuthorizeStep.OtpMfa,
    bodyDto.code,
    authCodeStore,
  ))
}

export const getAuthorizeSmsMfa = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)
  await validateUtil.dto(queryDto)

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
    SMS_MFA_IS_REQUIRED: enableSmsMfa,
  } = env(c)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authCodeBody) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)

  const requireSmsMfa = enableSmsMfa || authCodeBody.user.mfaTypes.includes(userModel.MfaType.Sms)
  if (!requireSmsMfa) throw new errorConfig.Forbidden()

  if (authCodeBody.user.smsPhoneNumber && authCodeBody.user.smsPhoneNumberVerified) {
    await handleSendSmsMfa(
      c,
      authCodeBody.user.smsPhoneNumber,
      queryDto.code,
      authCodeBody,
      queryDto.locale || locales[0],
    )
  }

  const phoneNumber = authCodeBody.user.smsPhoneNumber
  const maskedNumber = phoneNumber && authCodeBody.user.smsPhoneNumberVerified
    ? '*'.repeat(phoneNumber.length - 4) + phoneNumber.slice(-4)
    : null

  const allowSwitch = allowSmsSwitchToEmailMfa(
    c,
    authCodeBody,
  )

  return c.html(<AuthorizeSmsMfaView
    phoneNumber={maskedNumber}
    branding={await brandingService.getBranding(
      c,
      queryDto.org,
    )}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    showEmailMfaBtn={allowSwitch}
  />)
}

export const postAuthorizeSmsMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeMfaReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeStore) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

  const { AUTHORIZATION_CODE_EXPIRES_IN: expiresIn } = env(c)

  const isValid = await kvService.stampSmsMfaCode(
    c.env.KV,
    bodyDto.code,
    bodyDto.mfaCode,
    expiresIn,
  )

  if (!isValid) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.WrongMfaCode)
  }

  if (!authCodeStore.user.smsPhoneNumberVerified) {
    await userModel.update(
      c.env.DB,
      authCodeStore.user.id,
      { smsPhoneNumberVerified: 1 },
    )
  }

  return c.json(await identityUtil.processPostAuthorize(
    c,
    identityUtil.AuthorizeStep.SmsMfa,
    bodyDto.code,
    authCodeStore,
  ))
}

export const postSetupSmsMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const { SUPPORTED_LOCALES: locales } = env(c)

  const bodyDto = new identityDto.PostSetupSmsMfaReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeBody) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

  if (authCodeBody.user.smsPhoneNumber && authCodeBody.user.smsPhoneNumberVerified) throw new errorConfig.Forbidden()

  const smsRes = await handleSendSmsMfa(
    c,
    bodyDto.phoneNumber,
    bodyDto.code,
    authCodeBody,
    bodyDto.locale || locales[0],
  )
  if (!smsRes) throw new errorConfig.Forbidden()

  await userModel.update(
    c.env.DB,
    authCodeBody.user.id,
    {
      smsPhoneNumber: bodyDto.phoneNumber,
      smsPhoneNumberVerified: 0,
    },
  )

  return c.json({ success: true })
}

export const resendSmsMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const { SUPPORTED_LOCALES: locales } = env(c)

  const bodyDto = new identityDto.PostAuthorizeFollowUpReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeBody = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeBody) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

  if (!authCodeBody.user.smsPhoneNumber) throw new errorConfig.Forbidden()

  const smsRes = await handleSendSmsMfa(
    c,
    authCodeBody.user.smsPhoneNumber,
    bodyDto.code,
    authCodeBody,
    bodyDto.locale || locales[0],
  )
  if (!smsRes) throw new errorConfig.Forbidden()

  return c.json({ success: true })
}

export const getAuthorizeEmailMfa = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)
  await validateUtil.dto(queryDto)

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  const emailRes = await handleSendEmailMfa(
    c,
    queryDto.code,
    queryDto.locale,
  )
  if (!emailRes || (!emailRes.result && emailRes.reason === localeConfig.Error.WrongAuthCode)) {
    return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)
  }

  return c.html(<AuthorizeEmailMfaView
    branding={await brandingService.getBranding(
      c,
      queryDto.org,
    )}
    queryDto={queryDto}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    error={
      !emailRes.result && emailRes.reason === localeConfig.Error.EmailMfaLocked
        ? localeConfig.requestError.emailMfaLocked
        : undefined
    }
  />)
}

export const postAuthorizeEmailMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizeMfaReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const { AUTHORIZATION_CODE_EXPIRES_IN: expiresIn } = env(c)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeStore) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

  const isOtpFallback = allowOtpSwitchToEmailMfa(
    c,
    authCodeStore,
  )

  const isSmsFallback = allowSmsSwitchToEmailMfa(
    c,
    authCodeStore,
  )

  const isValid = await kvService.stampEmailMfaCode(
    c.env.KV,
    bodyDto.code,
    bodyDto.mfaCode,
    expiresIn,
    isOtpFallback,
    isSmsFallback,
  )

  if (!isValid) throw new errorConfig.UnAuthorized(localeConfig.Error.WrongMfaCode)

  return c.json(await identityUtil.processPostAuthorize(
    c,
    identityUtil.AuthorizeStep.EmailMfa,
    bodyDto.code,
    authCodeStore,
  ))
}

export const postResendEmailMfa = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const { SUPPORTED_LOCALES: locales } = env(c)

  const bodyDto = new identityDto.PostAuthorizeFollowUpReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const emailRes = await handleSendEmailMfa(
    c,
    bodyDto.code,
    bodyDto.locale || locales[0],
  )
  if (!emailRes || (!emailRes.result && emailRes.reason === localeConfig.Error.WrongAuthCode)) {
    throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)
  }

  if (!emailRes.result && emailRes.reason === localeConfig.Error.EmailMfaLocked) {
    throw new errorConfig.Forbidden(localeConfig.Error.EmailMfaLocked)
  }

  return c.json({ success: true })
}

export const getAuthorizePasskeyEnroll = async (c: Context<typeConfig.Context>) => {
  const queryDto = await identityDto.parseGetAuthorizeFollowUpReq(c)
  await validateUtil.dto(queryDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    queryDto.code,
  )
  if (!authCodeStore) return c.redirect(`${routeConfig.IdentityRoute.AuthCodeExpired}?locale=${queryDto.locale}`)

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

  const {
    SUPPORTED_LOCALES: locales,
    ENABLE_LOCALE_SELECTOR: enableLocaleSelector,
  } = env(c)

  const enrollOptions: EnrollOptions = {
    rpId: identityUtil.getPasskeyRpId(c),
    userId: authCodeStore.user.id,
    userEmail: authCodeStore.user.email ?? '',
    userDisplayName: `${authCodeStore.user.firstName ?? ''} ${authCodeStore.user.lastName ?? ''}`,
    challenge,
  }

  return c.html(<AuthorizePasskeyEnrollView
    branding={await brandingService.getBranding(
      c,
      queryDto.org,
    )}
    locales={enableLocaleSelector ? locales : [queryDto.locale]}
    queryDto={queryDto}
    enrollOptions={enrollOptions}
  />)
}

export const postAuthorizePasskeyEnroll = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizePasskeyEnrollReqDto(reqBody)
  await validateUtil.dto(bodyDto)

  const authCodeStore = await kvService.getAuthCodeBody(
    c.env.KV,
    bodyDto.code,
  )
  if (!authCodeStore) throw new errorConfig.Forbidden(localeConfig.Error.WrongAuthCode)

  const challenge = await kvService.getPasskeyEnrollChallenge(
    c.env.KV,
    authCodeStore.user.id,
  )

  if (!challenge) throw new errorConfig.UnAuthorized(localeConfig.Error.InvalidRequest)

  const { AUTH_SERVER_URL: authServerUrl } = env(c)

  let verification
  try {
    verification = await verifyRegistrationResponse({
      response: bodyDto.enrollInfo,
      expectedChallenge: challenge,
      expectedOrigin: authServerUrl,
      expectedRPID: identityUtil.getPasskeyRpId(c),
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

  await passkeyService.createUserPasskey(
    c,
    authCodeStore.user.id,
    passkeyId,
    cryptoUtil.uint8ArrayToBase64(passkeyPublickey),
    passkeyCounter,
  )

  return c.json(await identityUtil.processPostAuthorize(
    c,
    identityUtil.AuthorizeStep.PasskeyEnroll,
    bodyDto.code,
    authCodeStore,
  ))
}

export const getAuthorizePasskeyVerify = async (c: Context<typeConfig.Context>) => {
  const dto = new identityDto.GetAuthorizePasskeyVerifyReqDto({
    email: c.req.query('email') ?? '',
  })
  await validateUtil.dto(dto)
  
  const userAndPasskey = await passkeyService.getUserAndPasskeyByEmail(c, dto.email)

  if (!userAndPasskey) {
    return c.json({ passkeyOption: null })
  }

  const options: PublicKeyCredentialRequestOptionsJSON = await generateAuthenticationOptions({
    rpID: identityUtil.getPasskeyRpId(c),
    allowCredentials: [{
      id: userAndPasskey.passkey.credentialId,
    }]
  });

  await kvService.setPasskeyVerifyChallenge(c.env.KV, dto.email, options.challenge)

  return c.json({ passkeyOption: options })
}

export const postAuthorizePasskeyVerify = async (c: Context<typeConfig.Context>) => {
  const reqBody = await c.req.json()

  const bodyDto = new identityDto.PostAuthorizePasskeyVerifyReqDto({
    ...reqBody,
    scopes: reqBody.scope.split(' '),
  })
  await validateUtil.dto(bodyDto)

  const challenge = await kvService.getPasskeyVerifyChallenge(c.env.KV, bodyDto.email)
  if (!challenge) throw new errorConfig.Forbidden(localeConfig.Error.InvalidRequest)

  const userAndPasskey = await passkeyService.getUserAndPasskeyByEmail(c, bodyDto.email)
  if (!userAndPasskey) throw new errorConfig.Forbidden(localeConfig.Error.InvalidRequest)
  const { user, passkey } = userAndPasskey

  const { AUTH_SERVER_URL: authServerUrl } = env(c)

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: bodyDto.passkeyInfo,
      expectedChallenge: challenge,
      expectedOrigin: authServerUrl,
      expectedRPID: identityUtil.getPasskeyRpId(c),
      credential: {
        id: passkey.credentialId,
        publicKey: cryptoUtil.base64ToUint8Array(passkey.publicKey),
        counter: passkey.counter,
      },
    });
  } catch (error) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.InvalidRequest)
  }

  if (!verification.verified) {
    throw new errorConfig.UnAuthorized(localeConfig.Error.InvalidRequest)
  }

  await passkeyService.updatePasskeyCounter(c, passkey.id, verification.authenticationInfo.newCounter)

  const app = await appService.verifySPAClientRequest(
    c,
    bodyDto.clientId,
    bodyDto.redirectUri,
  )

  const request = new oauthDto.GetAuthorizeReqDto(bodyDto)

  const authCodeBody = {
    appId: app.id,
    appName: app.name,
    user,
    request,
    isFullyAuthorized: true,
  }

  const authCode = await oauthHandler.createFullAuthorize(c, authCodeBody)

  return c.json(await identityUtil.processPostAuthorize(
    c,
    identityUtil.AuthorizeStep.PasskeyVerify,
    authCode,
    authCodeBody,
  ))
}